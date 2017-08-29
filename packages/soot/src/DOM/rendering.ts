import { IVFlags } from "soot-iv-flags";
import {
  combineFrom,
  isArray,
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isString,
  isStringOrNumber,
  isUndefined,
  NO_OP,
  throwError,
  warning
} from "soot-shared";
import { VNodeFlags } from "soot-vnode-flags";
import { IV } from "../core/iv";
import { isVNode, Props, VNode } from "../core/vnode";
import {
  booleanProps,
  namespaces,
  skipProps,
  syntheticEvents
} from "./constants";
import {
  mount,
  mountArrayChildren,
  mountComponent,
  mountElement,
  mountText
} from "./mounting";
import { unmount } from "./unmounting";
import {
  EMPTY_OBJ,
  insertOrAppend,
  removeAllChildren,
  removeChild,
  replaceChild,
  replaceDOM,
  replaceWithNewNode,
  setTextContent
} from "./utils";

const roots = new Map();
let queue: boolean = false;

if (process.env.NODE_ENV !== "production") {
  if (document.body === null) {
    warning(
      'Soot warning: you cannot initialize soot without "document.body". Wait on "DOMContentLoaded" event, add script to bottom of body, or use async/defer attributes on script tag.'
    );
  }
}

export function triggerLifecycle(listeners) {
  for (let i = 0, len = listeners.length; i < len; i++) {
    listeners[i]();
  }
  listeners.length = 0;
}

const delegatedEvents: Map<string, IDelegate> = new Map();

interface IDelegate {
  docEvent: any;
  items: any;
}

export function handleEvent(name: string, nextEvent, dom) {
  let delegatedRoots = delegatedEvents.get(name);

  if (nextEvent) {
    if (!delegatedRoots) {
      delegatedRoots = { items: new Map(), docEvent: null };
      delegatedRoots.docEvent = attachEventToDocument(name, delegatedRoots);
      delegatedEvents.set(name, delegatedRoots);
    }
    delegatedRoots.items.set(dom, nextEvent);
  } else if (delegatedRoots) {
    const items = delegatedRoots.items;

    if (items.delete(dom)) {
      // If any items were deleted, check if listener need to be removed
      if (items.size === 0) {
        document.removeEventListener(
          normalizeEventName(name),
          delegatedRoots.docEvent
        );
        delegatedEvents.delete(name);
      }
    }
  }
}

function normalizeEventName(name) {
  return name.substr(2).toLowerCase();
}

function stopPropagation() {
  this.cancelBubble = true;
  this.stopImmediatePropagation();
}

function attachEventToDocument(name, delegatedRoots: IDelegate): Function {
  const docEvent = (event: Event) => {
    const items = delegatedRoots.items;
    let count = items.size;

    if (count > 0) {
      const isClick = event.type === "click";

      queue = true;
      event.stopPropagation = stopPropagation;

      let dom: any = event.target;

      Object.defineProperty(event, "currentTarget", {
        configurable: true,
        get() {
          return dom;
        }
      });

      while (count > 0) {
        const eventsToTrigger = items.get(dom);

        if (!isUndefined(eventsToTrigger)) {
          count--;
          if (isFunction(eventsToTrigger)) {
            eventsToTrigger(event);
          } else {
            eventsToTrigger.event(eventsToTrigger.data, event);
          }
          if (event.cancelBubble) {
            break;
          }
        }

        dom = dom.parentNode;

        // Html Nodes can be nested fe: span inside button in that scenario browser does not handle disabled attribute on parent,
        // because the event listener is on document.body
        // Don't process clicks on disabled elements
        if (isNull(dom) || (isClick && dom.disabled)) {
          break;
        }
      }
      flushSetStates();
      queue = false;
    }
  };
  document.addEventListener(normalizeEventName(name), docEvent);
  return docEvent;
}

/**
 * Renders virtual node tree into parent node.
 * @param {VNode | null | string | number} input v to be rendered
 * @param {*} parentDom DOM node which content will be replaced by virtual node
 * @param {Function?} callback Callback to be called after rendering has finished
 * @returns {void}
 */
export function render(
  input: VNode | null | string | undefined,
  parentDom:
    | Element
    | SVGAElement
    | DocumentFragment
    | null
    | HTMLElement
    | Node,
  callback?: Function
) {
  if ((input as any) === NO_OP) {
    return;
  }
  queue = true;
  const root = roots.get(parentDom);
  let rootIV: IV;
  let lifecycle;
  if (root === undefined) {
    if (isInvalid(input)) {
      return;
    }
    rootIV = new IV(input, 0, null);
    lifecycle = [];
    mount(rootIV, input as VNode, parentDom as Element, lifecycle, false, true);

    roots.set(parentDom, {
      iv: rootIV,
      lifeCycle: lifecycle
    });
  } else {
    rootIV = root.iv;
    lifecycle = root.lifeCycle;

    if (isNullOrUndef(input) && !isInvalid(rootIV.v)) {
      unmount(rootIV, parentDom as Element);
      roots.delete(parentDom);
    } else {
      patch(rootIV, input as VNode, parentDom as Element, lifecycle, false);
    }
  }
  triggerLifecycle(lifecycle);
  if (!isNullOrUndef(callback)) {
    callback();
  }
  flushSetStates();
  queue = false;
}

export function patch(
  iv: IV,
  nextInput: VNode | string | number,
  parentDom: Element,
  lifecycle,
  isSVG: boolean
) {
  const lastInput = iv.v;
  if (lastInput !== nextInput) {
    if (isStringOrNumber(nextInput)) {
      if (isStringOrNumber(lastInput)) {
        (iv.d as Element).nodeValue = nextInput as string;
      } else {
        replaceDOM(iv, parentDom, mountText(iv, nextInput, null, false));
      }
    } else if (isStringOrNumber(lastInput)) {
      replaceDOM(
        iv,
        parentDom,
        mount(iv, nextInput, parentDom, lifecycle, isSVG, false)
      );
    } else {
      const lastFlags = lastInput.f;
      const nextFlags = nextInput.f;

      if ((nextFlags & VNodeFlags.Element) > 0) {
        if ((lastFlags & VNodeFlags.Element) > 0) {
          patchElement(iv, lastInput, nextInput, parentDom, lifecycle, isSVG);
        } else {
          replaceDOM(
            iv,
            parentDom,
            mountElement(iv, nextInput, parentDom, lifecycle, isSVG, false)
          );
        }
      } else if ((nextFlags & VNodeFlags.Component) > 0) {
        const isClass = (nextFlags & VNodeFlags.ComponentClass) > 0;

        if ((lastFlags & VNodeFlags.Component) > 0) {
          const lastType = lastInput.t as Function;
          const nextType = nextInput.t as Function;
          const lastKey = lastInput.k;
          const nextKey = nextInput.k;

          if (lastType !== nextType || lastKey !== nextKey) {
            replaceWithNewNode(iv, nextInput, parentDom, lifecycle, isSVG);
          } else {
            const nextProps = nextInput.p || EMPTY_OBJ;

            if (isClass) {
              const instance = iv.i as Component<any, any>;
              instance.__IV = iv;

              if (!instance.__UN) {
                handleUpdate(
                  instance,
                  instance.state,
                  nextProps,
                  false,
                  isSVG,
                  lifecycle,
                  parentDom
                );
              }
            } else {
              let shouldUpdate = true;
              const lastProps = lastInput.p;
              const nextHooks = nextInput.r;
              const nextHooksDefined = !isNullOrUndef(nextHooks);

              if (lastKey !== nextKey) {
                shouldUpdate = true;
              } else {
                if (
                  nextHooksDefined &&
                  !isNullOrUndef(nextHooks.onComponentShouldUpdate)
                ) {
                  shouldUpdate = nextHooks.onComponentShouldUpdate(
                    lastProps,
                    nextProps
                  );
                }
              }
              if (shouldUpdate !== false) {
                if (
                  nextHooksDefined &&
                  !isNullOrUndef(nextHooks.onComponentWillUpdate)
                ) {
                  nextHooks.onComponentWillUpdate(lastProps, nextProps);
                }
                const renderOutput = nextType(nextProps);

                if (renderOutput !== NO_OP) {
                  patchChildren(iv, renderOutput, parentDom, lifecycle, isSVG);
                  iv.d = iv.c === null ? null : (iv.c as IV).d;
                  if (
                    nextHooksDefined &&
                    !isNullOrUndef(nextHooks.onComponentDidUpdate)
                  ) {
                    nextHooks.onComponentDidUpdate(lastProps, nextProps);
                  }
                }
              }
            }
          }
        } else {
          replaceDOM(
            iv,
            parentDom,
            mountComponent(
              iv,
              nextInput,
              parentDom,
              lifecycle,
              isSVG,
              isClass,
              false
            )
          );
        }
      }
    }
  }

  iv.v = nextInput;
}

export function patchChildren(
  parentIV: IV,
  nextInput,
  parentDOM: Element,
  lifecycle,
  childrenIsSVG: boolean
) {
  const childFlags = parentIV.f;
  let childIVs = parentIV.c as any;

  if ((childFlags & IVFlags.HasTextChildren) > 0) {
    if (isInvalid(nextInput)) {
      removeChild(parentDOM, parentDOM.firstChild as Element);
      parentIV.f = IVFlags.HasInvalidChildren;
    } else if (isStringOrNumber(nextInput)) {
      (parentDOM.firstChild as any).nodeValue = nextInput;
    } else if (isVNode(nextInput)) {
      childIVs = new IV(nextInput, 0, null) as IV;
      const newDOM = mount(
        childIVs,
        nextInput,
        parentDOM,
        lifecycle,
        childrenIsSVG,
        false
      );
      replaceChild(parentDOM, newDOM, parentDOM.firstChild);
      childIVs.d = newDOM;
      parentIV.c = childIVs;
      parentIV.f = IVFlags.HasBasicChildren;
    } else {
      parentDOM.removeChild(parentDOM.firstChild as Element);
      mountArrayChildren(
        parentIV,
        nextInput,
        parentDOM,
        lifecycle,
        childrenIsSVG,
        false
      );
    }
  } else if ((childFlags & IVFlags.HasInvalidChildren) > 0) {
    if (!isInvalid(nextInput)) {
      if (isStringOrNumber(nextInput)) {
        setTextContent(parentDOM, nextInput);
        parentIV.f = IVFlags.HasTextChildren;
      } else if (isVNode(nextInput)) {
        childIVs = new IV(nextInput, 0, null) as IV;
        mount(childIVs, nextInput, parentDOM, lifecycle, childrenIsSVG, true);
        parentIV.c = childIVs;
        parentIV.f = IVFlags.HasBasicChildren;
      } else {
        mountArrayChildren(
          parentIV,
          nextInput,
          parentDOM,
          lifecycle,
          childrenIsSVG,
          false
        );
      }
    }
  } else if ((childFlags & IVFlags.HasBasicChildren) > 0) {
    if (isInvalid(nextInput)) {
      unmount(childIVs, parentDOM);
      parentIV.c = null;
      parentIV.f = IVFlags.HasInvalidChildren;
    } else if (isVNode(nextInput)) {
      patch(childIVs, nextInput, parentDOM, lifecycle, childrenIsSVG);
    } else if (isStringOrNumber(nextInput)) {
      replaceWithNewNode(
        childIVs,
        nextInput,
        parentDOM,
        lifecycle,
        childrenIsSVG
      );
    } else {
      unmount(childIVs, parentDOM);
      mountArrayChildren(
        parentIV,
        nextInput,
        parentDOM,
        lifecycle,
        childrenIsSVG,
        false
      );
    }
  } else {
    // Multiple children
    if (isInvalid(nextInput)) {
      removeAllChildren(parentIV, parentDOM, childIVs);
    } else if (isArray(nextInput)) {
      const lastLength = childIVs === null ? 0 : childIVs.length;
      const nextLength = (nextInput as VNode[]).length;

      if (lastLength === 0) {
        if (nextLength > 0) {
          mountArrayChildren(
            parentIV,
            nextInput,
            parentDOM,
            lifecycle,
            childrenIsSVG,
            false
          );
        }
      } else if (nextLength === 0) {
        removeAllChildren(parentIV, parentDOM, childIVs as IV[]);
      } else if (
        (childFlags & IVFlags.HasKeyedChildren) > 0 &&
        (nextInput.length > 0 &&
          !isNullOrUndef(nextInput[0]) &&
          !isNullOrUndef(nextInput[0].k))
      ) {
        patchKeyedChildren(
          parentIV,
          childIVs as IV[],
          nextInput as VNode[],
          parentDOM,
          lifecycle,
          childrenIsSVG,
          lastLength,
          nextLength
        );
      } else {
        patchNonKeyedChildren(
          childIVs as IV[],
          nextInput as VNode[],
          parentDOM,
          lifecycle,
          childrenIsSVG,
          lastLength,
          nextLength
        );
      }
    } else if (isStringOrNumber(nextInput)) {
      removeAllChildren(parentIV, parentDOM, childIVs);
      setTextContent(parentDOM, nextInput);
      parentIV.f = IVFlags.HasTextChildren;
    } else {
      // vNode
      removeAllChildren(parentIV, parentDOM, childIVs);
      childIVs = new IV(nextInput, 0, null) as IV;
      mount(childIVs, nextInput, parentDOM, lifecycle, childrenIsSVG, true);
      parentIV.c = childIVs;
      parentIV.f = IVFlags.HasBasicChildren;
    }
  }
}

export function patchElement(
  iv: IV,
  lastVNode: VNode,
  nextVNode: VNode,
  parentDom: Element | null,
  lifecycle,
  isSVG: boolean
) {
  const nextTag = nextVNode.t;
  const lastTag = lastVNode.t;

  if (lastTag !== nextTag) {
    replaceWithNewNode(iv, nextVNode, parentDom, lifecycle, isSVG);
  } else {
    const dom = iv.d as Element;
    const lastProps = lastVNode.p;
    const nextProps = nextVNode.p;
    const lastChildren = lastVNode.c;
    const nextChildren = nextVNode.c;
    const nextFlags = nextVNode.f;
    const nextRef = nextVNode.r;
    const lastClassName = lastVNode.cN;
    const nextClassName = nextVNode.cN;

    isSVG = isSVG || (nextFlags & VNodeFlags.SvgElement) > 0;

    if (lastChildren !== nextChildren) {
      const childrenIsSVG = isSVG === true && nextVNode.t !== "foreignObject";

      patchChildren(iv, nextChildren, dom, lifecycle, childrenIsSVG);
    }

    if (lastProps !== nextProps) {
      let prop: string;

      if (isNull(lastProps)) {
        if (!isNull(nextProps)) {
          for (prop in nextProps) {
            patchProp(prop, null, nextProps[prop], dom, isSVG);
          }
        }
      } else {
        if (isNull(nextProps)) {
          for (prop in lastProps) {
            removeProp(prop, dom, nextFlags);
          }
        } else {
          for (prop in nextProps) {
            patchProp(prop, lastProps[prop], nextProps[prop], dom, isSVG);
          }
          for (prop in lastProps) {
            if (!nextProps.hasOwnProperty(prop)) {
              removeProp(prop, dom, nextFlags);
            }
          }
        }
      }
    }

    if (lastClassName !== nextClassName) {
      if (isNullOrUndef(nextClassName)) {
        dom.removeAttribute("class");
      } else {
        if (isSVG) {
          dom.setAttribute("class", nextClassName);
        } else {
          dom.className = nextClassName;
        }
      }
    }
    if (lastVNode.r !== nextRef) {
      if (isFunction(nextRef)) {
        lifecycle.push(() => nextRef(dom));
      }
    }
  }
}

function removeProp(prop, dom, nextFlags) {
  if (prop === "value") {
    // When removing value of select element, it needs to be set to null instead empty string, because empty string is valid value for option which makes that option selected
    // MS IE/Edge don't follow html spec for textArea and v elements and we need to set empty string to value in those cases to avoid "null" and "undefined" texts
    (dom as any).value = (nextFlags & VNodeFlags.SelectElement) > 0 ? null : "";
  } else if (prop === "style") {
    dom.removeAttribute("style");
  } else if (isAttrAnEvent(prop)) {
    handleEvent(prop, null, dom);
  } else {
    dom.removeAttribute(prop);
  }
}

export function patchNonKeyedChildren(
  childIVs: IV[],
  nextChildren: Array<
    VNode | null | string | false | undefined | true | number
  >,
  parentDOM: Element,
  lifecycle,
  isSVG: boolean,
  lastIVsLength: number,
  nextChildrenLength: number
) {
  let nextChild;
  let iteratedIV = childIVs[0];
  let pos = iteratedIV.p;
  let nextNode = iteratedIV.d;
  let newChildIVs;
  let updatedIVs = 0;
  let addedIVs = 0;

  for (let j = 0; j < nextChildrenLength; j++) {
    nextChild = nextChildren[j];

    if (pos === j) {
      if (isInvalid(nextChild)) {
        unmount(iteratedIV, parentDOM);
        lastIVsLength--;
        childIVs.splice(addedIVs + updatedIVs, 1);
      } else {
        patch(iteratedIV, nextChild, parentDOM, lifecycle, isSVG);
        updatedIVs++;
      }
      if (updatedIVs < lastIVsLength) {
        iteratedIV = childIVs[addedIVs + updatedIVs];
        pos = iteratedIV.p;
        nextNode = iteratedIV.d;
      } else {
        nextNode = null;
      }
    } else if (!isInvalid(nextChild)) {
      newChildIVs = new IV(nextChild, j, null);

      insertOrAppend(
        newChildIVs,
        parentDOM,
        mount(newChildIVs, nextChild, parentDOM, lifecycle, isSVG, false),
        nextNode
      );

      childIVs.splice(j, 0, newChildIVs);
      addedIVs++;
    }
  }
  if (updatedIVs < lastIVsLength) {
    const firstIndex = updatedIVs;

    do {
      unmount(childIVs[addedIVs + updatedIVs++], parentDOM);
    } while (updatedIVs < lastIVsLength);

    childIVs.splice(firstIndex, lastIVsLength - firstIndex); // Remove dead IVs
  }
}

export function patchKeyedChildren(
  parentIV: IV,
  a: IV[],
  b: VNode[],
  parentDOM,
  lifecycle,
  isSVG: boolean,
  aLength: number,
  bLength: number
) {
  let aEnd = aLength - 1;
  let bEnd = bLength - 1;
  let aStart: number = 0;
  let bStart: number = 0;
  let i: number = -1;
  let j: number;
  let aNode: IV;
  let bNode: VNode;
  let nextNode: Element | null = null;
  let nextPos: number = 0;
  let node: VNode;
  let aStartNode = a[aStart];
  let bStartNode = b[bStart];
  let aEndNode = a[aEnd];
  let bEndNode = b[bEnd];
  const newChildIVs = new Array(bLength);

  // Step 1
  // tslint:disable-next-line
  outer: {
    // Sync nodes with the same key at the beginning.
    while (aStartNode.k === bStartNode.k) {
      patch(aStartNode, bStartNode, parentDOM, lifecycle, isSVG);
      newChildIVs[bStart] = aStartNode;
      aStart++;
      bStart++;
      if (aStart > aEnd || bStart > bEnd) {
        break outer;
      }
      aStartNode = a[aStart];
      bStartNode = b[bStart];
    }

    // Sync nodes with the same key at the end.
    while (aEndNode.k === bEndNode.k) {
      patch(aEndNode, bEndNode, parentDOM, lifecycle, isSVG);
      newChildIVs[bEnd] = aEndNode;
      aEnd--;
      bEnd--;
      if (aStart > aEnd || bStart > bEnd) {
        break outer;
      }
      nextNode = aEndNode.d;
      nextPos = aEnd;
      aEndNode = a[aEnd];
      bEndNode = b[bEnd];
    }
  }

  if (aStart > aEnd) {
    if (bStart <= bEnd) {
      nextPos = bEnd + 1;
      nextNode = nextPos < bLength ? newChildIVs[nextPos].d : null;

      while (bStart <= bEnd) {
        node = b[bStart];
        const childIV = new IV(node, bStart, node.k);
        insertOrAppend(
          childIV,
          parentDOM,
          mount(childIV, node, parentDOM, lifecycle, isSVG, false),
          nextNode
        );
        newChildIVs[bStart] = childIV;
        bStart++;
      }
    }
  } else if (bStart > bEnd) {
    for (i = aStart; i <= aEnd; i++) {
      unmount(a[i], parentDOM);
    }
  } else {
    const sources = new Array(bEnd - bStart + 1).fill(-1);
    const keyIndex = new Map();

    // Mark all nodes as inserted.
    for (i = bStart; i <= bEnd; i++) {
      keyIndex.set(b[i].k, i);
    }

    let moved = false;
    let pos = 0;
    let bUpdated = 0;
    nextPos = 0;
    // Try to patch same keys and remove old
    for (i = aStart; i <= aEnd; i++) {
      aNode = a[i];
      j = keyIndex.get(aNode.k);

      if (isUndefined(j)) {
        unmount(aNode, parentDOM);
      } else {
        bNode = b[j];
        sources[j - bStart] = i;
        if (pos > j) {
          moved = true;
        } else {
          pos = j;
        }
        patch(aNode, bNode, parentDOM, lifecycle, isSVG);
        newChildIVs[j] = aNode;
        bUpdated++;
      }
    }
    if (moved) {
      const seq = LIS(sources);

      j = seq.length - 1;
      for (i = bEnd - bStart; i >= 0; i--) {
        if (sources[i] === -1) {
          pos = i + bStart;
          node = b[pos];
          nextPos = pos + 1;
          nextNode = nextPos < bLength ? newChildIVs[nextPos].d : null;

          const childIV = new IV(node, bStart, node.k);

          insertOrAppend(
            childIV,
            parentDOM,
            mount(childIV, node, parentDOM, lifecycle, isSVG, false),
            nextNode
          );
          newChildIVs[pos] = childIV;
        } else {
          if (j < 0 || i !== seq[j]) {
            pos = i + bStart;
            nextPos = pos + 1;
            nextNode = nextPos < bLength ? newChildIVs[nextPos].d : null;

            insertOrAppend(
              newChildIVs[pos],
              parentDOM,
              newChildIVs[pos].d as Element,
              nextNode
            );
          } else {
            j--;
          }
        }
      }
    } else {
      for (i = bEnd; i >= bStart && bUpdated !== bLength; i--) {
        bNode = b[i];

        if (isUndefined(newChildIVs[i])) {
          const iv = new IV(bNode, i, bNode.k);

          insertOrAppend(
            iv,
            parentDOM,
            mount(iv, bNode, parentDOM, lifecycle, isSVG, false),
            nextNode
          );
          newChildIVs[i] = iv;
          bUpdated++;
        }

        nextNode = newChildIVs[i].d;
      }
    }
  }
  parentIV.c = newChildIVs;
}

// Longest Increasing Subsequence algorithm
// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function LIS(arr: number[]): number[] {
  const p = arr.slice(0);
  const result: number[] = [0];
  let i;
  let j;
  let u;
  let v;
  let c;
  const len = arr.length;

  for (i = 0; i < len; i++) {
    const arrI = arr[i];

    if (arrI !== -1) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }

      u = 0;
      v = result.length - 1;

      while (u < v) {
        c = ((u + v) / 2) | 0;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }

      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }

  u = result.length;
  v = result[u - 1];

  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }

  return result;
}

export function isAttrAnEvent(attr: string): boolean {
  return attr[0] === "o" && attr[1] === "n";
}

export function patchProp(
  prop,
  lastValue,
  nextValue,
  dom: Element,
  isSVG: boolean
) {
  if (lastValue !== nextValue && !skipProps.has(prop)) {
    if (booleanProps.has(prop)) {
      dom[prop] = !!nextValue;
    } else if (isAttrAnEvent(prop)) {
      patchEvent(prop, lastValue, nextValue, dom);
    } else if (isNullOrUndef(nextValue)) {
      dom.removeAttribute(prop);
    } else if (prop === "style") {
      patchStyle(lastValue, nextValue, dom);
    } else {
      // We optimize for condition being boolean. Its 99.9% time false
      if (isSVG && namespaces.has(prop)) {
        // If we end up in this path we can read property again
        dom.setAttributeNS(namespaces.get(prop) as string, prop, nextValue);
      } else {
        dom.setAttribute(prop, nextValue);
      }
    }
  }
}

function createEventCallback(fn: any, data: any) {
  if (isFunction(fn)) {
    return function(a1, a2) {
      queue = true;

      if (isNull(data)) {
        fn(a1, a2);
      } else {
        fn(data, a1, a2);
      }

      flushSetStates();
      queue = false;
    };
  }

  return null;
}

export function patchEvent(name: string, lastValue, nextValue, dom) {
  if (lastValue !== nextValue) {
    if (syntheticEvents.has(name)) {
      handleEvent(name, nextValue, dom);
    } else {
      const nameLowerCase = name.toLowerCase();

      dom[nameLowerCase] =
        !isFunction(nextValue) && !isNullOrUndef(nextValue)
          ? createEventCallback(nextValue.event, nextValue.data)
          : createEventCallback(nextValue, null);
    }
  }
}

// We are assuming here that we come from patchProp routine
// -nextAttrValue cannot be null or undefined
function patchStyle(lastAttrValue, nextAttrValue, dom) {
  const domStyle = dom.style;
  let style: string;
  let value;

  if (isString(nextAttrValue)) {
    domStyle.cssText = nextAttrValue;
  } else if (!isNullOrUndef(lastAttrValue) && !isString(lastAttrValue)) {
    for (style in nextAttrValue) {
      value = nextAttrValue[style];
      if (value !== lastAttrValue[style]) {
        domStyle.setProperty(style, value);
      }
    }

    for (style in lastAttrValue) {
      if (isNullOrUndef(nextAttrValue[style])) {
        domStyle.removeProperty(style);
      }
    }
  } else {
    for (style in nextAttrValue) {
      domStyle.setProperty(style, nextAttrValue[style]);
    }
  }
}

export interface ComponentLifecycle<P, S> {
  componentDidMount?(): void;
  componentWillMount?(): void;
  componentWillReceiveProps?(nextProps: P): void;
  shouldComponentUpdate?(nextProps: P, nextState: S): boolean;
  componentWillUpdate?(nextProps: P, nextState: S): void;
  componentDidUpdate?(prevProps: P, prevState: S): void;
  componentWillUnmount?(): void;
}

function queueStateChanges<P, S>(
  component: Component<P, S>,
  newState: S,
  callback?: Function
): void {
  if (isFunction(newState)) {
    newState = (newState as any)(component.state, component.props) as S;
  }
  let pending = component.__PS;

  if (isNullOrUndef(pending)) {
    component.__PS = pending = newState;
  } else {
    for (const stateKey in newState as S) {
      pending[stateKey] = newState[stateKey];
    }
  }

  if (!component.__PSS && !component.__BR) {
    queueStateChange(component, callback);
  } else {
    const state = component.state;

    if (state === null) {
      component.state = pending;
    } else {
      for (const key in pending) {
        state[key] = pending[key];
      }
    }

    component.__PS = null;
    if (component.__BR && isFunction(callback)) {
      component.__LC.push(callback.bind(component));
    }
  }
}

let componentFlushQueue: Array<Component<any, any>> = [];

export function handleUpdate(
  component: Component<any, any>,
  nextState,
  nextProps,
  fromSetState: boolean,
  isSVG: boolean,
  lifecycle,
  parentDom
) {
  const hasComponentDidUpdateIsFunction = isFunction(
    component.componentDidUpdate
  );
  // When component has componentDidUpdate hook, we need to clone lastState or will be modified by reference during update
  const prevState = hasComponentDidUpdateIsFunction
    ? combineFrom(nextState, null)
    : component.state;
  const prevProps = component.props;

  if (prevProps !== nextProps || nextProps === EMPTY_OBJ) {
    if (!fromSetState && isFunction(component.componentWillReceiveProps)) {
      // keep a copy of state before componentWillReceiveProps
      const beforeState = combineFrom(component.state) as any;
      component.__BR = true;
      component.componentWillReceiveProps(nextProps);
      component.__BR = false;
      const afterState = component.state;
      if (beforeState !== afterState) {
        // if state changed in componentWillReceiveProps, reassign the beforeState
        component.state = beforeState;
        // set the afterState as pending state so the change gets picked up below
        component.__PSS = true;
        component.__PS = afterState;
      }
    }
    if (component.__PSS) {
      nextState = combineFrom(nextState, component.__PS) as any;
      component.__PSS = false;
      component.__PS = null;
    }
  }

  /* Update if scu is not defined, or it returns truthy value*/
  const hasSCU = isFunction(component.shouldComponentUpdate);
  if (
    !hasSCU ||
    (hasSCU &&
      (component.shouldComponentUpdate as Function)(nextProps, nextState) !==
        false)
  ) {
    if (isFunction(component.componentWillUpdate)) {
      component.__BS = true;
      component.componentWillUpdate(nextProps, nextState);
      component.__BS = false;
    }

    component.props = nextProps;
    component.state = nextState;

    const iv = component.__IV;
    const renderOutput = component.render(nextProps, nextState);

    if (renderOutput !== NO_OP) {
      patchChildren(iv, renderOutput, parentDom as Element, lifecycle, isSVG);

      const dom = iv.c === null ? null : (iv.c as IV).d;

      iv.d = dom;

      if (fromSetState) {
        triggerLifecycle(lifecycle);
        let parent = iv.b;

        while (!isNull(parent)) {
          parent.d = dom;
          parent = parent.b;
        }
      }

      if (hasComponentDidUpdateIsFunction) {
        (component.componentDidUpdate as Function)(prevProps, prevState);
      }
    }
  } else {
    component.props = nextProps;
    component.state = nextState;
  }

  component.__PN = parentDom;
}

function applyState<P, S>(component: Component<P, S>): void {
  if (component.__UN) {
    return;
  }
  if (!component.__BR) {
    const pendingState = component.__PS;
    component.__PSS = false;
    component.__PS = null;
    handleUpdate(
      component,
      combineFrom(component.state, pendingState),
      component.props,
      true,
      component.__SVG,
      component.__LC,
      component.__PN
    );
  } else {
    component.state = component.__PS as S;
    component.__PS = null;
  }
}

export function flushSetStates() {
  const length = componentFlushQueue.length;

  if (length > 0) {
    for (let i = 0; i < length; i++) {
      const component = componentFlushQueue[i];

      applyState(component);

      const callbacks = component.__FCB;

      if (!isNull(callbacks)) {
        for (let j = 0, len = callbacks.length; j < len; j++) {
          callbacks[i].call(component);
        }
        component.__FCB = null;
      }
      component.__FP = false; // Flush no longer pending for this component
    }
    componentFlushQueue = [];
  }
}

function queueStateChange(component, callback) {
  if (queue) {
    if (!component.__FP) {
      component.__FP = true;
      componentFlushQueue.push(component);
    }

    if (isFunction(callback)) {
      const callbacks = component.__FCB;

      if (callbacks === null) {
        component.__FCB = [callback];
      } else {
        callbacks.push(callback);
      }
    }
  } else {
    queue = true;
    applyState(component);
    flushSetStates();
    queue = false;

    if (isFunction(callback)) {
      callback.call(component);
    }
  }
}

export class Component<P, S> implements ComponentLifecycle<P, S> {
  public state: S | null = null;
  public props: P & Props;
  public __BR = false;
  public __BS = true;
  public __PSS = false;
  public __PS: S | null = null;
  public __IV: IV;
  public __UN: boolean = false;
  public __LC: Function[];
  public __SVG: boolean = false;
  public __PN: Element;

  public __FP: boolean = false; // Flush Pending
  public __FCB: Function[] | null = null; // Flush callbacks for this component

  constructor(props?: P) {
    this.props = props || (EMPTY_OBJ as P);
  }

  // LifeCycle methods
  public componentDidMount?(): void;

  public componentWillMount?(): void;

  public componentWillReceiveProps?(nextProps: P): void;

  public shouldComponentUpdate?(nextProps: P, nextState: S): boolean;

  public componentWillUpdate?(nextProps: P, nextState: S): void;

  public componentDidUpdate?(prevProps: P, prevState: S): void;

  public componentWillUnmount?(): void;

  public setState(newState: S | Function, callback?: Function) {
    if (this.__UN) {
      return;
    }
    if (!this.__BS) {
      queueStateChanges(this, newState, callback);
    } else {
      if (process.env.NODE_ENV !== "production") {
        throwError(
          "cannot update state via setState() in componentWillUpdate() or constructor."
        );
      }
      throwError();
    }
  }

  // tslint:disable-next-line:no-empty
  public render(nextProps?: P, nextState?): any {}
}

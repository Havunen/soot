import { IVFlags } from "soot-iv-flags";
import {
  isArray,
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isObject,
  isStringOrNumber,
  throwError
} from "soot-shared";
import { VNodeFlags } from "soot-vnode-flags";
import { createIV, IV } from "../core/iv";
import { VNode } from "../core/vnode";
import { svgNS } from "./constants";
import { Component, patchProp } from "./rendering";
import { appendChild, EMPTY_OBJ, setTextContent } from "./utils";

export function mount(
  iv: IV,
  input: VNode | string | number,
  parentDom: Element,
  lifecycle,
  isSVG: boolean,
  insertIntoDOM: boolean
) {
  // Text - Number
  if (isStringOrNumber(input)) {
    return mountText(iv, input, parentDom, insertIntoDOM);
  } else {
    // VNode
    const flags = (input as VNode).f;

    if ((flags & VNodeFlags.Element) > 0) {
      return mountElement(
        iv,
        input,
        parentDom,
        lifecycle,
        isSVG,
        insertIntoDOM
      );
    } else if ((flags & VNodeFlags.Component) > 0) {
      return mountComponent(
        iv,
        input,
        parentDom,
        lifecycle,
        isSVG,
        (flags & VNodeFlags.ComponentClass) > 0,
        insertIntoDOM
      );
    } else {
      if (process.env.NODE_ENV !== "production") {
        if (typeof input === "object") {
          throwError(
            `mount() received an object that's not a valid VNode, you should stringify it first. Object: "${JSON.stringify(
              input
            )}".`
          );
        } else {
          throwError(
            `mount() expects a valid VNode, instead it received an object with the type "${typeof input}".`
          );
        }
      }
      throwError();
    }
  }
}

export function mountText(
  iv: IV,
  text: string | number,
  parentDom: Element | null,
  insertIntoDom: boolean
): any {
  const dom = document.createTextNode(text as string) as any;

  if (insertIntoDom) {
    iv.d = dom;
    appendChild(parentDom, dom);
  }

  iv.f = IVFlags.HasTextChildren;

  return dom;
}

export function mountElement(
  iv: IV,
  vNode: VNode,
  parentDom: Element | null,
  lifecycle,
  isSVG: boolean,
  insertIntoDom: boolean
) {
  let dom;
  const flags = vNode.f;
  const tag = vNode.t as string;

  isSVG = isSVG || (flags & VNodeFlags.SvgElement) > 0;
  if (isSVG) {
    dom = document.createElementNS(svgNS, tag);
  } else {
    dom = document.createElement(tag);
  }
  const children = vNode.c;
  const props = vNode.p;
  const className = vNode.cN;
  const ref = vNode.r;

  if (!isInvalid(children)) {
    if (isStringOrNumber(children)) {
      // Text
      setTextContent(dom, children as string | number);
      iv.f = IVFlags.HasTextChildren;
    } else {
      const childrenIsSVG = isSVG === true && tag !== "foreignObject";
      if (isArray(children)) {
        // Array
        mountArrayChildren(iv, children, dom, lifecycle, childrenIsSVG, false);
      } else {
        // VNode
        const childIV = createIV(children as VNode, 0, null);

        iv.c = childIV;
        iv.f = IVFlags.HasBasicChildren;

        mount(childIV, children as VNode, dom, lifecycle, childrenIsSVG, true);
      }
    }
  } else {
    iv.f = IVFlags.HasInvalidChildren;
  }
  if (!isNull(props)) {
    for (const prop in props) {
      patchProp(prop, null, props[prop], dom, isSVG);
    }
  }

  if (!isNull(className)) {
    if (isSVG) {
      dom.setAttribute("class", className);
    } else {
      dom.className = className;
    }
  }

  if (isFunction(ref)) {
    lifecycle.push(() => ref(dom));
  }
  if (insertIntoDom) {
    iv.d = dom;
    appendChild(parentDom, dom);
  }

  return dom;
}

export function mountArrayChildren(
  iv: IV,
  children,
  dom: Element,
  lifecycle,
  isSVG: boolean,
  isKeyed: boolean
) {
  iv.c = null;
  iv.f = IVFlags.HasInvalidChildren; // default to invalid

  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i];

    if (!isInvalid(child)) {
      if (iv.c === null) {
        iv.c = [];
        isKeyed =
          isKeyed || isObject(child)
            ? !isNullOrUndef((child as VNode).k)
            : false;
        iv.f = isKeyed ? IVFlags.HasKeyedChildren : IVFlags.HasNonKeydChildren;
      }
      const childIV = createIV(child, i, child.k);

      (iv.c as IV[]).push(childIV);
      mount(childIV, child, dom, lifecycle, isSVG, true);
    }
  }
}

export function mountComponent(
  iv: IV,
  vNode: VNode,
  parentDom: Element,
  lifecycle,
  isSVG: boolean,
  isClass: boolean,
  insertIntoDom: boolean
) {
  let dom = null;
  const type = vNode.t as any;
  const props = vNode.p || EMPTY_OBJ;
  let childIV;
  let renderOutput;
  let instance;
  const ref = vNode.r;

  if (isClass) {
    instance = new type(props) as Component<any, any>;
    iv.i = instance;
    instance.__BS = false;
    instance.__PN = parentDom;

    if (instance.p === EMPTY_OBJ) {
      instance.p = props;
    }
    instance.__LC = lifecycle;
    instance.__PSS = true;
    instance.__SVG = isSVG;
    if (isFunction(instance.componentWillMount)) {
      instance.__BR = true;
      instance.componentWillMount();
      instance.__BR = false;
    }

    renderOutput = instance.render(props, instance.state);

    instance.__PSS = false;
    instance.__IV = iv;
  } else {
    renderOutput = type(props);
  }

  if (!isInvalid(renderOutput)) {
    iv.c = childIV = createIV(renderOutput, 0, null);

    childIV.d = dom = mount(
      childIV,
      renderOutput,
      parentDom,
      lifecycle,
      isSVG,
      false
    );
    iv.f = IVFlags.HasBasicChildren;

    if (isObject(renderOutput)) {
      if (((renderOutput as VNode).f & VNodeFlags.Component) > 0) {
        childIV.b = iv;
      }
    }
  } else {
    iv.f = IVFlags.HasInvalidChildren;
  }

  if (isClass) {
    if (isFunction(ref)) {
      ref(instance);
    }
    if (isFunction(instance.componentDidMount)) {
      lifecycle.push(() => instance.componentDidMount());
    }
  } else {
    if (!isNull(ref)) {
      if (isFunction(ref.onComponentWillMount)) {
        ref.onComponentWillMount(props);
      }
      if (isFunction(ref.onComponentDidMount)) {
        lifecycle.push(() => ref.onComponentDidMount(dom, props));
      }
    }
  }

  if (insertIntoDom && !isNull(dom)) {
    iv.d = dom;
    appendChild(parentDom, dom);
  }

  return dom;
}

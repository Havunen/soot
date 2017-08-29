import { IVFlags } from "soot-iv-flags";
import { isNull } from "soot-shared";
import { IV } from "../core/iv";
import { VNode } from "../core/vnode";
import { mount } from "./mounting";
import { unmount } from "./unmounting";

// We need EMPTY_OBJ defined in one place.
// Its used for comparison so we cant inline it into shared
export const EMPTY_OBJ = {};

if (process.env.NODE_ENV !== "production") {
  Object.freeze(EMPTY_OBJ);
}

export function replaceDOM(iv: IV, parentDom, newDOM) {
  unmount(iv, null);
  replaceChild(parentDom, newDOM, iv.d);
  iv.d = newDOM;
}

export function setTextContent(dom, text: string | number) {
  if (text !== "") {
    dom.textContent = text;
  } else {
    dom.appendChild(document.createTextNode(""));
  }
}

export function appendChild(parentDom, dom) {
  parentDom.appendChild(dom);
}

export function insertOrAppend(
  iv: IV,
  parentDom: Element,
  newNode: Element,
  nextNode: Element | null
) {
  if (isNull(nextNode)) {
    appendChild(parentDom, newNode);
  } else {
    parentDom.insertBefore(newNode, nextNode);
  }
  iv.d = newNode;
}

export function replaceWithNewNode(
  iv: IV,
  nextInput: VNode | string | number,
  parentDom,
  lifecycle,
  isSVG: boolean
) {
  const oldNode = iv.d;

  unmount(iv, null);

  const newDom = mount(iv, nextInput, parentDom, lifecycle, isSVG, false);

  if (isNull(newDom)) {
    removeChild(parentDom, oldNode as Element);
  } else {
    replaceChild(parentDom, newDom, oldNode);
  }

  iv.d = newDom;
}

export function replaceChild(parentDom, nextDom, lastDom) {
  parentDom.replaceChild(nextDom, lastDom);
}

export function removeChild(parentDom: Element, dom: Element) {
  parentDom.removeChild(dom);
}

export function removeAllChildren(parentIV: IV, dom: Element, children: IV[]) {
  for (let i = 0, len = children.length; i < len; i++) {
    unmount(children[i], null);
  }
  parentIV.c = null;
  parentIV.f = IVFlags.HasInvalidChildren;
  dom.textContent = "";
}

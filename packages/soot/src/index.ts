import { NO_OP, warning } from "soot-shared";
import { Props, V, VNode } from "./core/vnode";
import { linkEvent } from "./DOM/events/linkEvent";
import { Component, render } from "./DOM/rendering";
import { EMPTY_OBJ } from "./DOM/utils";

if (process.env.NODE_ENV !== "production") {
  /* tslint:disable-next-line:no-empty */
  const testFunc = function testFn() {};
  if (
    ((testFunc as Function).name || testFunc.toString()).indexOf("testFn") ===
    -1
  ) {
    warning(
      "It looks like you're using a minified copy of the development build " +
        "of Soot. When deploying Soot apps to production, make sure to use " +
        "the production build which skips development warnings and is faster. "
    );
  }
}

const version = process.env.SOOT_VERSION;

export {
  EMPTY_OBJ,
  VNode,
  Component,
  NO_OP,
  Props,
  V,
  linkEvent,
  render,
  version
};

import { VNodeFlags } from "soot-vnode-flags";
import { VNode } from "./vnode";

// tslint:disable-next-line
let validateChildren: Function = function() {};
if (process.env.NODE_ENV !== "production") {
  validateChildren = function(vNode: VNode) {
    if ((vNode.f & VNodeFlags.InputElement) > 0) {
      throw new Error(
        "Failed to set children, v elements can't have children."
      );
    }
  };
}

export function validate(vNode): void {
  // TODO: Add validation about invalid children
  // TODO: Duplicate keys / invalid keys
  // TODO: Children for input / media elements
  // TODO: Nested arrays
  // TODO: wholes in keyed children
}

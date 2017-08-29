import {
  isArray,
  isFunction,
  isInvalid,
  isNull,
  isNullOrUndef,
  isStringOrNumber
} from "soot-shared";
import { VNodeFlags } from "soot-vnode-flags";
import { IV } from "../core/iv";
import { syntheticEvents } from "./constants";
import { Component, handleEvent } from "./rendering";
import { removeChild } from "./utils";

export function unmount(iv: IV, parentDom: Element | null) {
  const input = iv.v;

  if (isStringOrNumber(input)) {
    if (!isNull(parentDom)) {
      removeChild(parentDom, iv.d as Element);
    }
  } else {
    // It's vNode
    const flags = input.f;
    const dom = iv.d as Element;
    const ref = input.r as any;
    const props = input.p;
    const childIVs = iv.c;

    if ((flags & VNodeFlags.Element) > 0) {
      if (isFunction(ref)) {
        ref(null);
      }

      if (!isNull(childIVs)) {
        if (isArray(childIVs)) {
          for (let i = 0, len = childIVs.length; i < len; i++) {
            unmount(childIVs[i], null);
          }
        } else {
          unmount(childIVs, null);
        }
      }

      // Remove synthetic events
      if (!isNull(props)) {
        for (const name in props) {
          if (syntheticEvents.has(name)) {
            handleEvent(name, null, dom);
          }
        }
      }
    } else if ((flags & VNodeFlags.Component) > 0) {
      if ((flags & VNodeFlags.ComponentClass) > 0) {
        const instance = iv.i as Component<any, any>;

        if (isFunction(instance.componentWillUnmount)) {
          instance.componentWillUnmount();
        }
        if (isFunction(ref)) {
          ref(null);
        }
        instance.__UN = true;
        iv.i = null;
      } else {
        if (!isNullOrUndef(ref)) {
          if (isFunction(ref.onComponentWillUnmount)) {
            ref.onComponentWillUnmount(dom, props);
          }
        }
      }

      iv.b = null;

      if (!isNull(childIVs) && !isInvalid((childIVs as IV).v)) {
        unmount(childIVs as IV, null);
      }
    }

    if (!isNull(parentDom) && !isNull(dom)) {
      removeChild(parentDom, dom);
    }
  }
}

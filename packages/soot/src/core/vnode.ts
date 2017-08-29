import { isNullOrUndef, isStatefulComponent, isUndefined } from "soot-shared";
import { VNodeFlags } from "soot-vnode-flags";
import { Component } from "../DOM/rendering";
import { validate } from "./validation";

export type Type = string | null | Function | Component<any, any>;

export interface Props {
  children?: any;
  [k: string]: any;
}

export class VNode {
  public c: any;
  public cN: string;
  public f: number;
  public k: string | number | null;
  public p: Props | null;
  public r;
  public t: Type;

  constructor(children, className, flags, key, props, ref, type) {
    this.c = isUndefined(children) ? null : children;
    this.cN = isUndefined(className) ? null : className;
    this.f = flags;
    this.k = isUndefined(key) ? null : key;
    this.p = isUndefined(props) ? null : props;
    this.r = isUndefined(ref) ? null : ref;
    this.t = type;
  }
}

/**
 * Creates virtual node
 * @param {number} flags
 * @param {*} type
 * @param {string|null?} className
 * @param {Object?} children
 * @param {Object?} props
 * @param {*?} key
 * @param {Object|Function?} ref
 * @returns {Object} returns new virtual node
 */
export function V(
  flags: VNodeFlags,
  type,
  className?: string | null,
  children?: any,
  props?: Props | null,
  key?: any,
  ref?
) {
  if ((flags & VNodeFlags.ComponentUnknown) > 0) {
    flags = isStatefulComponent(type)
      ? VNodeFlags.ComponentClass
      : VNodeFlags.ComponentFunction;
  }

  if ((flags & VNodeFlags.Component) > 0) {
    const defaultProps = (type as any).defaultProps;

    if (!isNullOrUndef(defaultProps)) {
      if (!props) {
        props = defaultProps;
      } else {
        for (const prop in defaultProps) {
          if (isUndefined(props[prop])) {
            props[prop] = defaultProps[prop];
          }
        }
      }
    }
  } else {
    if (props) {
      if (className === null) {
        className = props.hasOwnProperty("className") ? props.className : null;
      }
      if (children === null) {
        children = props.hasOwnProperty("children") ? props.children : null;
      }
    }
  }

  const vNode = new VNode(children, className, flags, key, props, ref, type);

  if (process.env.NODE_ENV !== "production") {
    validate(vNode);
  }

  return vNode;
}

export function isVNode(o: any): o is VNode {
  return !!o.f;
}

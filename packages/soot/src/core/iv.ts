import { VNode } from "./vnode";

// Internal representation of VNode
// Its not exposed to application level, so we can freely modify its properties in-place
// This allows SOOT to iterate virtual nodes in immutable way - instead of modifying vNode's properties
// We create Internal VNode (IV) per vNode and modify it instead
export interface IV {
  b: IV | null; // Base - reference to IVs parent only used for Components to handle root changing
  c: IV | IV[] | null; // Children
  d: Element | null; // DOM
  f: number; // ChildFlags - number that tells what type of children this IV has
  i: any; // Component instance reference - IVs that has Component v
  k: string | number | null; // Key (keyed algorithm)
  p: number; // Position (non keyed algorithm)
  v: VNode | string | number; // Actual v (fe. VNode)
}

export function createIV(
  input: VNode | string | number,
  pos: number,
  key: string | number | null
): IV {
  return {
    b: null,
    c: null,
    d: null,
    f: 0,
    i: null,
    k: key,
    p: pos,
    v: input
  };
}

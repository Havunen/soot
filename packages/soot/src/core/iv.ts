import { VNode } from "./vnode";

// Internal representation of VNode
// Its not exposed to application level, so we can freely modify its properties in-place
// This allows SOOT to iterate virtual nodes in immutable way - instead of modifying vNode's properties
// We create Internal VNode (IV) per vNode and modify it instead
export class IV {
  public v: VNode | string | number; // Actual v (fe. VNode)
  public d: Element | null; // DOM
  public c: IV | IV[] | null; // Children
  public k: string | number | null; // Key (keyed algorithm)
  public p: number; // Position (non keyed algorithm)
  public i: any; // Component instance reference - IVs that has Component v
  public f: number = 0; // ChildFlags - number that tells what type of children this IV has
  public b: IV | null; // Base - reference to IVs parent only used for Components to handle root changing

  constructor(
    input: VNode | string | number,
    pos: number,
    key: string | number | null
  ) {
    this.v = input;
    this.d = null;
    this.c = null;
    this.k = key;
    this.p = pos;
    this.i = null;
    this.f = 0;
    this.b = null;
  }
}

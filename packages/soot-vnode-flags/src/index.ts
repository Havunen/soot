export const enum VNodeFlags {
  HtmlElement = 1,

  ComponentClass = 1 << 1,
  ComponentFunction = 1 << 2,
  ComponentUnknown = 1 << 3,

  SvgElement = 1 << 4,
  InputElement = 1 << 5,
  TextareaElement = 1 << 6,
  SelectElement = 1 << 7,

  Element = HtmlElement |
    SvgElement |
    InputElement |
    TextareaElement |
    SelectElement,

  Component = ComponentFunction | ComponentClass | ComponentUnknown
}

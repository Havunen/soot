import { V, render } from "soot";
import { VNodeFlags } from "soot-vnode-flags";

describe("patching routine", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = "";
    document.body.removeChild(container);
  });

  it("Should do nothing if lastVNode strictly equals nextVnode", () => {
    const yar = V(
      VNodeFlags.HtmlElement,
      "div",
      null,
      "123",
      null,
      null,
      null,
      true
    );
    const bar = V(
      VNodeFlags.HtmlElement,
      "div",
      null,
      "123",
      null,
      null,
      null,
      true
    );
    let foo = V(
      VNodeFlags.HtmlElement,
      "div",
      null,
      [bar, yar],
      null,
      null,
      null,
      true
    );

    render(foo, container);
    expect(container.innerHTML).toEqual(
      "<div><div>123</div><div>123</div></div>"
    );

    foo = V(
      VNodeFlags.HtmlElement,
      "div",
      null,
      [bar, yar],
      null,
      null,
      null,
      true
    );

    render(foo, container);
    expect(container.innerHTML).toEqual(
      "<div><div>123</div><div>123</div></div>"
    );
  });

  // it("Should mount nextNode if lastNode crashed", () => {
  //   const validNode = V(
  //     VNodeFlags.HtmlElement,
  //     "span",
  //     null,
  //     V(VNodeFlags.HtmlElement, 'div', null, "a"),
  //     null,
  //     null,
  //     null,
  //     false
  //   );
  //   const invalidNode = V(0, "span");
  //
  //   render(validNode, container);
  //   try {
  //     render(invalidNode, container);
  //   } catch (e) {
  //     expect(
  //       e.message.indexOf("Soot Error: mount() received an object")
  //     ).not.toEqual(-1);
  //   }
  //   expect(container.innerHTML).toEqual("<span><div>a</div></span>");
  //
  //   render(validNode, container);
  //   expect(container.innerHTML).toEqual("<span><div>a</div></span>");
  // });

  // it("Patch operation when nextChildren is NOT Invalid/Array/StringOrNumber/VNode", () => {
  //   const validNode = V(
  //     VNodeFlags.HtmlElement,
  //     "span",
  //     null,
  //     V(
  //       VNodeFlags.HtmlElement,
  //       "span",
  //       null,
  //       V(VNodeFlags.HtmlElement, 'div', null, "a"),
  //       null,
  //       null,
  //       null,
  //       false
  //     ),
  //     null,
  //     null,
  //     null,
  //     false
  //   );
  //
  //   const invalidChildNode = V(
  //     VNodeFlags.HtmlElement,
  //     "span",
  //     null,
  //     V(0, "span"),
  //     null,
  //     null,
  //     null,
  //     false
  //   );
  //
  //   render(validNode, container);
  //   render(invalidChildNode, container);
  // });

  it("Should not access real DOM property when text does not change", () => {
    render(V(VNodeFlags.HtmlElement, "div", null, "a"), container);
    expect(container.textContent).toEqual("a");
    render(V(VNodeFlags.HtmlElement, "div", null, "a"), container);
    expect(container.textContent).toEqual("a");
  });
});

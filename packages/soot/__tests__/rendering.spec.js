import { V, render } from "soot";
import { NO_OP } from "soot-shared";
import { VNodeFlags } from "soot-vnode-flags";

describe("rendering routine", () => {
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

  it("Should throw error when trying to render to document.body", () => {
    const div = V(
      VNodeFlags.HtmlElement,
      "div",
      null,
      "1",
      null,
      null,
      null,
      true
    );
    try {
      render(div, document.body);
    } catch (e) {
      expect(e.message).toEqual(
        'Soot Error: you cannot render() to the "document.body". Use an empty element as a container instead.'
      );
    }
  });

  it("Should do nothing if v is NO-OP", () => {
    render(NO_OP, container);
    expect(container.innerHTML).toEqual("");
  });

  it("Should create new object when d exists", () => {
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
    const foo = V(
      VNodeFlags.HtmlElement,
      "div",
      null,
      bar,
      null,
      null,
      null,
      true
    );

    render(foo, container);
    expect(container.innerHTML).toEqual("<div><div>123</div></div>");

    render(null, container);

    render(foo, container);
    expect(container.innerHTML).toEqual("<div><div>123</div></div>");
  });
});

import { V, render } from "soot";
import { VNodeFlags } from "soot-vnode-flags";

describe("Keyed simple", () => {
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

  function createDivWithKey(text, key) {
    return V(VNodeFlags.HtmlElement, "div", null, text, null, key);
  }

  it("Should move 6 after 3", () => {
    render(
      V(VNodeFlags.HtmlElement, "div", null, [
        createDivWithKey(1, 1),
        createDivWithKey(2, 2),
        createDivWithKey(3, 3),
        createDivWithKey(4, 4),
        createDivWithKey(5, 5),
        createDivWithKey(6, 6)
      ]),
      container
    );

    expect(container.textContent).toBe("123456");

    render(
      V(VNodeFlags.HtmlElement, "div", null, [
        createDivWithKey(1, 1),
        createDivWithKey(2, 2),
        createDivWithKey(3, 3),
        createDivWithKey(6, 6),
        createDivWithKey(4, 4),
        createDivWithKey(5, 5)
      ]),
      container
    );

    expect(container.textContent).toBe("123645");
  });

  it("Should move 4 before 9", () => {
    render(
      V(VNodeFlags.HtmlElement, "div", null, [
        createDivWithKey(1, 1),
        createDivWithKey(2, 2),
        createDivWithKey(3, 3),
        createDivWithKey(4, 4),
        createDivWithKey(5, 5),
        createDivWithKey(6, 6),
        createDivWithKey(9, 9)
      ]),
      container
    );

    expect(container.textContent).toBe("1234569");

    render(
      V(VNodeFlags.HtmlElement, "div", null, [
        createDivWithKey(1, 1),
        createDivWithKey(2, 2),
        createDivWithKey(3, 3),
        createDivWithKey(5, 5),
        createDivWithKey(6, 6),
        createDivWithKey(4, 4),
        createDivWithKey(9, 9)
      ]),
      container
    );

    expect(container.textContent).toBe("1235649");
  });

  it("Should not do any DOM moves when order is right after removals #1", () => {
    render(
      V(VNodeFlags.HtmlElement, "div", null, [
        createDivWithKey("x", "x"),
        createDivWithKey(1, 1),
        createDivWithKey(2, 2),
        createDivWithKey("a", "a"),
        createDivWithKey("b", "b"),
        createDivWithKey("c", "c"),
        createDivWithKey(3, 3),
        createDivWithKey(5, 5),
        createDivWithKey("z", "z")
      ]),
      container
    );

    expect(container.textContent).toBe("x12abc35z");

    render(
      V(VNodeFlags.HtmlElement, "div", null, [
        createDivWithKey(1, 1),
        createDivWithKey(2, 2),
        createDivWithKey(3, 3),
        createDivWithKey(5, 5)
      ]),
      container
    );

    expect(container.textContent).toBe("1235");
  });

  it("Should not do any DOM moves when order is right after removals #2", () => {
    render(
      V(VNodeFlags.HtmlElement, "div", null, [
        createDivWithKey(1, 1),
        createDivWithKey(2, 2),
        createDivWithKey("a", "a"),
        createDivWithKey("b", "b"),
        createDivWithKey("c", "c"),
        createDivWithKey(3, 3),
        createDivWithKey(5, 5)
      ]),
      container
    );

    expect(container.textContent).toBe("12abc35");

    render(
      V(VNodeFlags.HtmlElement, "div", null, [
        createDivWithKey(1, 1),
        createDivWithKey(2, 2),
        createDivWithKey("z", "z"),
        createDivWithKey("y", "y"),
        createDivWithKey("x", "x"),
        createDivWithKey(3, 3),
        createDivWithKey(5, 5)
      ]),
      container
    );

    expect(container.textContent).toBe("12zyx35");
  });

  it("Should not do any DOM moves when order is right after removals #3", () => {
    render(
      V(VNodeFlags.HtmlElement, "div", null, [
        createDivWithKey(1, 1),
        createDivWithKey("H", "H"),
        createDivWithKey(2, 2),
        createDivWithKey("a", "a"),
        createDivWithKey("b", "b"),
        createDivWithKey("c", "c"),
        createDivWithKey(3, 3),
        createDivWithKey("G", "G"),
        createDivWithKey(5, 5)
      ]),
      container
    );

    expect(container.textContent).toBe("1H2abc3G5");

    render(
      V(VNodeFlags.HtmlElement, "div", null, [
        createDivWithKey(1, 1),
        createDivWithKey(2, 2),
        createDivWithKey("z", "z"),
        createDivWithKey("y", "y"),
        createDivWithKey("x", "x"),
        createDivWithKey(3, 3),
        createDivWithKey(5, 5)
      ]),
      container
    );

    expect(container.textContent).toBe("12zyx35");
  });
});

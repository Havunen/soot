import { render } from "soot";

describe("Creation - (non-JSX)", () => {
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

  [
    {
      description: "should render div with span child",
      template: () => {
        return (
          <div>
            <span />
          </div>
        );
      },
      tagName: "div",
      children: 1,
      textContent: ""
    },
    {
      description: "should render span with span child",
      template: () => (
        <span>
          <span />
        </span>
      ),
      tagName: "span",
      children: 1,
      textContent: ""
    },
    {
      description: "should render div with two span children",
      template: () => (
        <div>
          <span />
          <span />
        </div>
      ),
      tagName: "div",
      children: 2,
      textContent: ""
    },
    {
      description:
        "should render div with three span children and unset middle child",
      template: () => <div>{[<span />, null, <span />]}</div>,
      tagName: "div",
      children: 2,
      textContent: ""
    },
    {
      description:
        "should render div with three span children and unset first, and middle child",
      template: () => <div>{[null, null, <span />]}</div>,
      tagName: "div",
      children: 1,
      textContent: ""
    },
    {
      description: "should render empty div 3 nulls",
      template: () => <div>{[null, null, null]}</div>,
      tagName: "div",
      children: 0,
      textContent: ""
    },
    {
      description: "should render div with two null children and one text node",
      template: () => <div>{[null, null, "Baboy", null]}</div>,
      tagName: "div",
      children: 1,
      textContent: "Baboy"
    },
    {
      description: "should render div with one textNode and a span children",
      template: () => <div>{["Hello!", null, <span />]}</div>,
      tagName: "div",
      children: 2,
      textContent: "Hello!"
    },
    {
      description: "should render div with two textNodes and a span children",
      template: () => <div>{["Hello, ", null, "World!", <span />]}</div>,
      tagName: "div",
      children: 3,
      textContent: "Hello, World!"
    },
    {
      description:
        "should render div with two textNodes and a two span children",
      template: () => <div>{["Hello, ", <span />, "World!", <span />]}</div>,
      tagName: "div",
      children: 4,
      textContent: "Hello, World!"
    },
    {
      description:
        "should render div with two textNodes and one span children, and span with textNode",
      template: () => (
        <div>{["Hello", <span />, ", ", <span>World!</span>]}</div>
      ),
      tagName: "div",
      children: 4,
      textContent: "Hello, World!"
    },
    {
      description:
        "should render div with tree null values in an array for children",
      template: () => <div>{[null, null, null]}</div>,
      tagName: "div",
      children: 0,
      textContent: ""
    },
    {
      description:
        "should render div with b child, and tree null values in an array for children",
      template: () => (
        <div>
          <b>{[null, null, null]}</b>
        </div>
      ),
      tagName: "div",
      children: 1,
      textContent: ""
    },
    {
      description:
        "should render div with b child, and number and two null values in an array for children",
      template: () => (
        <div>
          <b>{[null, null, 123]}</b>
        </div>
      ),
      tagName: "div",
      children: 1,
      textContent: "123"
    },
    {
      description: "should render empty div",
      template: () => <div />,
      tagName: "div",
      children: 0,
      textContent: ""
    },
    {
      description: "should render empty span",
      template: () => <span />,
      tagName: "span",
      children: 0,
      textContent: ""
    }
  ].forEach(test => {
    it(test.description, () => {
      render(test.template(), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.tagName.toLowerCase()).toBe(test.tagName);
      expect(container.firstChild.childNodes.length).toBe(test.children);
      expect(container.firstChild.textContent).toBe(test.textContent);

      render(test.template(), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.tagName.toLowerCase()).toBe(test.tagName);
      expect(container.firstChild.childNodes.length).toBe(test.children);
    });
  });
});

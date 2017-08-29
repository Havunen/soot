import { render, V } from "soot";
import { VNodeFlags } from "soot-vnode-flags";

const comparer = document.createElement("div");
function innerHTML(HTML) {
  comparer.innerHTML = HTML;
  return comparer.innerHTML;
}

describe("Basic JSX", () => {
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

  it("Should work correctly when removing nodes", () => {
    function Functional({ children }) {
      return <div>{children}</div>;
    }

    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        null,
        [
          <Functional>{["1", "2", "3"]}</Functional>,
          <Functional>{["4", "5"]}</Functional>
        ],
        null,
        null,
        null
      ),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML("<div><div>123</div><div>45</div></div>")
    );

    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        null,
        [
          <Functional>{["3", "4", "5"]}</Functional>,
          <Functional>{["6", "7"]}</Functional>
        ],
        null,
        null,
        null
      ),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML("<div><div>345</div><div>67</div></div>")
    );

    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        null,
        [
          <Functional>{["3", "4", "5"]}</Functional>,
          <Functional>{["6", "7"]}</Functional>,
          <Functional>{["3", "4", "5"]}</Functional>
        ],
        null,
        null,
        null
      ),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML("<div><div>345</div><div>67</div><div>345</div></div>")
    );
  });

  it("Basic Keyed algo test", () => {
    render(
      <div>
        <div key="a">A</div>
        <div key="b">B</div>
        <div key="c">C</div>
        <div key="d">D</div>
        <div key="e">E</div>
        <div key="f">F</div>
        <div key="g">G</div>
        <div key="h">H</div>
      </div>,
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML(
        "<div><div>A</div><div>B</div><div>C</div><div>D</div><div>E</div><div>F</div><div>G</div><div>H</div></div>"
      )
    );

    render(
      <div>
        <div key="d">D</div>
        <div key="g">G</div>
        <div key="a">A</div>
        <div key="x">X</div>
        <div key="z">Z</div>
        <div key="b">B</div>
        <div key="1">1</div>
        <div key="2">2</div>
      </div>,
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML(
        "<div><div>D</div><div>G</div><div>A</div><div>X</div><div>Z</div><div>B</div><div>1</div><div>2</div></div>"
      )
    );

    render(
      <div>
        <div key="1">1</div>
        <div key="g">G</div>
        <div key="b">B</div>
        <div key="a">A</div>
        <div key="2">2</div>
        <div key="c">C</div>
      </div>,
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML(
        "<div><div>1</div><div>G</div><div>B</div><div>A</div><div>2</div><div>C</div></div>"
      )
    );
  });
});

describe("Basic use-cases", () => {
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

  it("Should be possible to render and remove single div", () => {
    render(
      V(VNodeFlags.HtmlElement, "div", "1st-test", "2", null, null, null),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML('<div class="1st-test">2</div>')
    );

    render(null, container);

    expect(innerHTML(container.innerHTML)).toEqual("");
  });

  it("Should be possible to render and unmount single div with 2 text nodes as children", () => {
    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        "1st-test",
        ["1", "2"],
        null,
        null,
        null
      ),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML('<div class="1st-test">12</div>')
    );

    render(null, container);

    expect(innerHTML(container.innerHTML)).toEqual("");
  });

  it("Should be possible to render and unmount text nodes #1", () => {
    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        "1st-test",
        ["1", "2", "3"],
        null,
        null,
        null
      ),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML('<div class="1st-test">123</div>')
    );

    render(null, container);

    expect(innerHTML(container.innerHTML)).toEqual("");

    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        "1st-test",
        ["1", "3"],
        null,
        null,
        null
      ),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML('<div class="1st-test">13</div>')
    );

    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        "1st-test",
        ["1", "3", "4"],
        null,
        null,
        null
      ),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML('<div class="1st-test">134</div>')
    );

    render(
      V(VNodeFlags.HtmlElement, "div", "1st-test", ["4"], null, null, null),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML('<div class="1st-test">4</div>')
    );

    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        "1st-test",
        ["4", "4"],
        null,
        null,
        null
      ),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML('<div class="1st-test">44</div>')
    );

    render(
      V(VNodeFlags.HtmlElement, "div", "1st-test", null, null, null, null),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML('<div class="1st-test"></div>')
    );

    render(
      V(VNodeFlags.HtmlElement, "div", "1st-test", "", null, null, null),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML('<div class="1st-test"></div>')
    );

    render(
      V(VNodeFlags.HtmlElement, "div", "1st-test", [], null, null, null),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML('<div class="1st-test"></div>')
    );
  });

  it("Should unmount and mount correctly when doing nonKeyed", () => {
    let div1mountCount = 0;
    let div1unMountCount = 0;
    const div1 = V(
      VNodeFlags.HtmlElement,
      "div",
      "1",
      "one",
      null,
      null,
      function(n) {
        if (n === null) {
          div1unMountCount++;
        } else {
          div1mountCount++;
        }
      }
    );

    let div2mountCount = 0;
    let div2unMountCount = 0;
    const div2 = V(
      VNodeFlags.HtmlElement,
      "div",
      "2",
      "second",
      null,
      null,
      function(n) {
        if (n === null) {
          div2unMountCount++;
        } else {
          div2mountCount++;
        }
      }
    );

    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        "parent",
        [div1, "2", div2],
        null,
        null,
        null
      ),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML(
        '<div class="parent"><div class="1">one</div>2<div class="2">second</div></div>'
      )
    );

    expect(div1mountCount).toEqual(1);
    expect(div2mountCount).toEqual(1);

    render(null, container);

    expect(div2unMountCount).toEqual(1);
    expect(div2unMountCount).toEqual(1);

    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        "parent",
        [null, null, div1, null, null, div2],
        null,
        null,
        null
      ),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML(
        '<div class="parent"><div class="1">one</div><div class="2">second</div></div>'
      )
    );
    expect(div1mountCount).toEqual(2);
    expect(div2mountCount).toEqual(2);

    div1mountCount = 0;
    div1unMountCount = 0;

    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        "parent",
        [null, div1, div1, null, div1, div2],
        null,
        null,
        null
      ),
      container
    );
    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML(
        '<div class="parent"><div class="1">one</div><div class="1">one</div><div class="1">one</div><div class="2">second</div></div>'
      )
    );
    expect(div1mountCount).toEqual(2); // 2 added
    expect(div1unMountCount).toEqual(0); // 0 removed

    div1unMountCount = 0;

    render(null, container);

    expect(div1unMountCount).toEqual(3);

    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        "parent",
        [null, null, div1, null, null, div2],
        null,
        null,
        null
      ),
      container
    );

    div1mountCount = 0;
    div1unMountCount = 0;
    div2unMountCount = 0;
    div2mountCount = 0;

    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        "parent",
        [null, div1, null, div1, null, null, div2],
        null,
        null,
        null
      ),
      container
    );
    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML(
        '<div class="parent">' +
          '<div class="1">one</div>' +
          '<div class="1">one</div>' +
          '<div class="2">second</div>' +
          "</div>"
      )
    );

    expect(div1mountCount).toEqual(2);
    expect(div1unMountCount).toEqual(1);
    expect(div2mountCount).toEqual(1);
    expect(div2unMountCount).toEqual(1);
  });

  it("Should be possible to swap vNodes freely", () => {
    let div1mountCount = 0;
    let div1unMountCount = 0;
    const div1 = V(
      VNodeFlags.HtmlElement,
      "div",
      "1",
      "one",
      null,
      null,
      function(n) {
        if (n === null) {
          div1unMountCount++;
        } else {
          div1mountCount++;
        }
      }
    );

    let div2mountCount = 0;
    let div2unMountCount = 0;
    const div2 = V(
      VNodeFlags.HtmlElement,
      "div",
      "2",
      "second",
      null,
      null,
      function(n) {
        if (n === null) {
          div2unMountCount++;
        } else {
          div2mountCount++;
        }
      }
    );

    const array1 = [div1, div2];

    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        "parent",
        [null, ...array1, ...array1, div1, null],
        null,
        null,
        null
      ),
      container
    );
    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML(
        '<div class="parent">' +
          '<div class="1">one</div>' +
          '<div class="2">second</div>' +
          '<div class="1">one</div>' +
          '<div class="2">second</div>' +
          '<div class="1">one</div>' +
          "</div>"
      )
    );

    expect(div1mountCount).toEqual(3);
    expect(div2mountCount).toEqual(2);

    array1.reverse();

    render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        "parent",
        [null, ...array1, ...array1, div1, null],
        null,
        null,
        null
      ),
      container
    );

    expect(innerHTML(container.innerHTML)).toEqual(
      innerHTML(
        '<div class="parent">' +
          '<div class="2">second</div>' +
          '<div class="1">one</div>' +
          '<div class="2">second</div>' +
          '<div class="1">one</div>' +
          '<div class="1">one</div>' +
          "</div>"
      )
    );
  });

  describe("Should have parentDOM defined #1", () => {
    class A extends Component {
      render() {
        return <div>A</div>;
      }
    }

    class B extends Component {
      render() {
        return <span>B</span>;
      }
    }

    class Counter extends Component {
      constructor(props) {
        super(props);
        this.state = {
          bool: false
        };
        this.btnCount = this.btnCount.bind(this);
      }

      btnCount() {
        this.setState({
          bool: !this.state.bool
        });
      }

      render() {
        return (
          <div className="my-component">
            <h1>
              {this.props.car} {this.state.bool ? <A /> : <B />}
            </h1>
            <button type="button" onClick={this.btnCount}>
              btn
            </button>
          </div>
        );
      }
    }

    class Wrapper extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return (
          <div>
            {["Saab", "Volvo", "BMW"].map(function(c) {
              return <Counter car={c} />;
            })}
          </div>
        );
      }
    }

    it("Initial render (creation)", () => {
      render(<Wrapper />, container);

      expect(container.innerHTML).toBe(
        innerHTML(
          '<div><div class="my-component"><h1>Saab <span>B</span></h1><button type="button">btn</button></div><div class="my-component"><h1>Volvo <span>B</span></h1><button type="button">btn</button></div><div class="my-component"><h1>BMW <span>B</span></h1><button type="button">btn</button></div></div>'
        )
      );

      render(null, container);
    });

    it("Second render (update)", done => {
      render(<Wrapper />, container);
      const buttons = Array.prototype.slice.call(
        container.querySelectorAll("button")
      );
      buttons.forEach(button => button.click());

      // requestAnimationFrame is needed here because
      // setState fires after a requestAnimationFrame
      requestAnimationFrame(() => {
        expect(container.innerHTML).toBe(
          innerHTML(
            '<div><div class="my-component"><h1>Saab <div>A</div></h1><button type="button">btn</button></div><div class="my-component"><h1>Volvo <div>A</div></h1><button type="button">btn</button></div><div class="my-component"><h1>BMW <div>A</div></h1><button type="button">btn</button></div></div>'
          )
        );
        render(null, container);
        done();
      });
    });
  });

  describe("Infinite loop issue", () => {
    it("Should not get stuck when doing setState from ref callback", done => {
      class A extends Component {
        constructor(props) {
          super(props);

          this.state = {
            text: "foo"
          };

          this.onWilAttach = this.onWilAttach.bind(this);
        }

        onWilAttach(node) {
          // Do something with node and setState
          this.setState({
            text: "animate"
          });
        }

        render() {
          if (!this.props.open) {
            return null;
          }

          return <div ref={this.onWilAttach}>{this.state.text}</div>;
        }
      }

      render(<A />, container);

      render(<A open={true} />, container);
      setTimeout(() => {
        expect(container.innerHTML).toBe(innerHTML("<div>animate</div>"));
        done();
      }, 10);
    });
  });

  describe("Refs inside components", () => {
    it("Should have refs defined when componentDidMount is called", () => {
      class Com extends Component {
        constructor(props) {
          super(props);
          this._first = null;
          this._second = null;
        }

        componentDidMount() {
          expect(this._first).not.toBe(null);
          expect(this._second).not.toBe(null);
        }

        render() {
          return (
            <div ref={node => (this._first = node)}>
              <span>1</span>
              <span ref={node => (this._second = node)}>2</span>
            </div>
          );
        }
      }

      render(<Com />, container);
    });
  });

  describe("Spread operator and templates", () => {
    it("Should be able to update property", () => {
      class A extends Component {
        constructor(props) {
          super(props);
        }

        render() {
          return (
            <div>
              <input disabled={this.props.disabled} {...this.props.args} />
            </div>
          );
        }
      }

      render(<A disabled={true} />, container);
      let input = container.querySelector("input");
      expect(input.disabled).toBe(true);

      render(<A disabled={false} />, container);
      input = container.querySelector("input");
      expect(input.disabled).toBe(false);
    });
  });
});

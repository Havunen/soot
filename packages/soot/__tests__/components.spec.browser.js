import { render, Component } from "soot";
import { innerHTML, waits } from "soot-utils";

describe("Components (non-JSX)", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    document.body.removeChild(container);
  });

  it("should pass", () => {
    expect(true).toBeTruthy();
  });

  if (typeof global !== "undefined" && !global.usingJSDOM) {
    class BasicComponent1 extends Component {
      render() {
        const template = (name, title) => (
          <div className="basic">
            <span className={name}>{`The title is ${title}`}</span>
          </div>
        );
        return template(this.props.name, this.props.title);
      }
    }

    it("should render a basic component", () => {
      const template = (Component, title) => (
        <div>
          <Component title={title} name="basic-render" />
        </div>
      );

      expect(() => {
        render(template(null, "abc"), container);
      }).toThrowError();

      expect(() => {
        render(template({}, "abc"), container);
      }).toThrowError();

      render(template(BasicComponent1, "abc"), container);

      expect(container.firstChild.firstChild.getAttribute("class")).toBe(
        "basic"
      );
      expect(
        container.firstChild.firstChild.firstChild.getAttribute("class")
      ).toBe("basic-render");
      expect(container.firstChild.firstChild.tagName).toBe("DIV");
      expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
      expect(container.firstChild.firstChild.firstChild.innerHTML).toBe(
        "The title is abc"
      );

      expect(() => {
        render(template({}, "abc"), container);
      }).toThrowError();

      expect(() => render(template(BasicComponent1, {}), container)).toThrow();

      render(template(BasicComponent1, []), container);

      render(template(BasicComponent1, "abcdef"), container);

      expect(container.firstChild.firstChild.getAttribute("class")).toBe(
        "basic"
      );
      expect(
        container.firstChild.firstChild.firstChild.getAttribute("class")
      ).toBe("basic-render");
      expect(container.firstChild.firstChild.tagName).toBe("DIV");
      expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
      expect(container.firstChild.firstChild.firstChild.innerHTML).toBe(
        "The title is abcdef"
      );

      render(template(BasicComponent1, null), container);

      expect(container.firstChild.firstChild.getAttribute("class")).toBe(
        "basic"
      );
      expect(
        container.firstChild.firstChild.firstChild.getAttribute("class")
      ).toBe("basic-render");
      expect(container.firstChild.firstChild.tagName).toBe("DIV");
      expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
      expect(container.firstChild.firstChild.firstChild.innerHTML).toBe(
        "The title is "
      );

      render(template(BasicComponent1, undefined), container);

      expect(container.firstChild.firstChild.getAttribute("class")).toBe(
        "basic"
      );
      expect(
        container.firstChild.firstChild.firstChild.getAttribute("class")
      ).toBe("basic-render");
      expect(container.firstChild.firstChild.tagName).toBe("DIV");
      expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
      expect(container.firstChild.firstChild.firstChild.innerHTML).toBe(
        "The title is "
      );

      render(template(BasicComponent1, "1234"), container);

      expect(container.firstChild.firstChild.getAttribute("class")).toBe(
        "basic"
      );
      expect(
        container.firstChild.firstChild.firstChild.getAttribute("class")
      ).toBe("basic-render");
      expect(container.firstChild.firstChild.tagName).toBe("DIV");
      expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
      expect(container.firstChild.firstChild.firstChild.innerHTML).toBe(
        "The title is 1234"
      );
    });

    class BasicComponent1b extends Component {
      render() {
        const template = (isChecked, title) => (
          <div className="basic">
            <label>
              <input type="checkbox" checked={isChecked} />
            </label>
          </div>
        );
        return template(this.props.isChecked, this.props.title);
      }
    }
    //
    it("should render a basic component with inputs", () => {
      const template = (Component, title, isChecked) => (
        <div>
          <Component title={title} isChecked={isChecked} />
        </div>
      );

      render(null, container);

      render(template(BasicComponent1b, "abc", true), container);
      expect(container.firstChild.firstChild.getAttribute("class")).toBe(
        "basic"
      );
      expect(
        container.firstChild.firstChild.firstChild.firstChild.getAttribute(
          "type"
        )
      ).toBe("checkbox");
      expect(container.firstChild.firstChild.tagName).toBe("DIV");
      expect(container.firstChild.firstChild.firstChild.tagName).toBe("LABEL");
      expect(container.firstChild.firstChild.firstChild.innerHTML).toBe(
        innerHTML('<input type="checkbox">The title is abc')
      );
      expect(container.querySelector("input").checked).toBe(true);

      render(null, container);
      render(null, container);

      render(template(BasicComponent1b, "abc", null), container);
      expect(container.firstChild.firstChild.getAttribute("class")).toBe(
        "basic"
      );
      expect(
        container.firstChild.firstChild.firstChild.firstChild.getAttribute(
          "type"
        )
      ).toBe("checkbox");
      expect(container.firstChild.firstChild.tagName).toBe("DIV");
      expect(container.firstChild.firstChild.firstChild.tagName).toBe("LABEL");
      expect(container.firstChild.firstChild.firstChild.innerHTML).toBe(
        innerHTML('<input type="checkbox">The title is abc')
      );
      expect(container.querySelector("input").checked).toBe(false);
    });

    class BasicComponent1c extends Component {
      render() {
        const template = (isEnabled, title, type) => (
          <div className="basic">
            <label>
              <input type={type} disabled={!isEnabled} />
              {"The title is "}
              {title}
            </label>
          </div>
        );
        return template(
          this.props.isEnabled,
          this.props.title,
          this.props.type
        );
      }
    }

    it("should render a basic component with input tag and attributes", () => {
      const template = (Component, title, isEnabled) => (
        <div>
          <Component title={title} isEnabled={isEnabled} type="password" />
        </div>
      );

      render(template(BasicComponent1c, "abc", true), container);
      expect(container.firstChild.firstChild.tagName).toBe("DIV");
      expect(container.firstChild.firstChild.getAttribute("class")).toBe(
        "basic"
      );
      expect(container.firstChild.firstChild.firstChild.tagName).toBe("LABEL");
      expect(
        container.firstChild.firstChild.firstChild.firstChild.tagName
      ).toBe("INPUT");
      expect(
        container.firstChild.firstChild.firstChild.firstChild.getAttribute(
          "type"
        )
      ).toBe("password");
      expect(
        container.firstChild.firstChild.firstChild.firstChild.disabled
      ).toBe(false);
      expect(container.firstChild.firstChild.firstChild.textContent).toBe(
        "The title is abc"
      );
      render(template(BasicComponent1c, ["abc"], true), container);
      expect(container.firstChild.firstChild.tagName).toBe("DIV");
      expect(container.firstChild.firstChild.getAttribute("class")).toBe(
        "basic"
      );
      expect(container.firstChild.firstChild.firstChild.tagName).toBe("LABEL");
      expect(
        container.firstChild.firstChild.firstChild.firstChild.tagName
      ).toBe("INPUT");
      expect(
        container.firstChild.firstChild.firstChild.firstChild.getAttribute(
          "type"
        )
      ).toBe("password");
      expect(
        container.firstChild.firstChild.firstChild.firstChild.disabled
      ).toBe(false);
      expect(container.firstChild.firstChild.firstChild.textContent).toBe(
        "The title is abc"
      );
    });

    class BasicComponent1d extends Component {
      render() {
        const template = (isDisabled, title) => (
          <div className="basic">
            <label>
              <input type="password" disabled={isDisabled} />
              {"The title is "}
              {title}
            </label>
          </div>
        );
        return template(this.props.isDisabled, this.props.title);
      }
    }

    it("should render a basic component with inputs #3 #3", () => {
      const template = (Component, title, isDisabled) => (
        <div>
          <Component title={title} isDisabled={isDisabled} />
        </div>
      );
      render(template(BasicComponent1d, "abc", true), container);
      expect(innerHTML(container.innerHTML)).toBe(
        innerHTML(
          '<div><div class="basic"><label><input disabled="" type="password">The title is abc</label></div></div>'
        )
      );
      expect(container.querySelector("input").disabled).toBe(true);

      render(template(BasicComponent1d, "123", false), container);
      expect(innerHTML(container.innerHTML)).toBe(
        '<div><div class="basic"><label><input type="password">The title is 123</label></div></div>'
      );
      expect(container.querySelector("input").disabled).toBe(false);
    });

    it("should render a basic component and remove property if null #1", () => {
      const template = (Component, title, name) => (
        <div>
          <Component title={title} name={name} />
        </div>
      );

      render(template(BasicComponent1, "abc", "basic-render"), container);

      expect(container.innerHTML).toBe(
        '<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>'
      );

      render(template(BasicComponent1, "123", null), container);
      expect(container.innerHTML).toBe(
        '<div><div class="basic"><span>The title is 123</span></div></div>'
      );
    });

    it("should render a basic component and remove property if null #2", () => {
      const template = (Component, title, name) => (
        <div>
          <Component title={title} name={name} />
        </div>
      );

      render(template(BasicComponent1, "abc", null), container);

      expect(container.innerHTML).toBe(
        '<div><div class="basic"><span>The title is abc</span></div></div>'
      );

      render(null, container);

      render(template(BasicComponent1, "123", "basic-update"), container);
      expect(container.innerHTML).toBe(
        '<div><div class="basic"><span class="basic-update">The title is 123</span></div></div>'
      );
    });

    it("should render a basic root component", () => {
      const template = (Component, title, name) => (
        <Component title={title} name={name} />
      );

      render(template(BasicComponent1, "abc", "basic-render"), container);

      expect(container.innerHTML).toBe(
        '<div class="basic"><span class="basic-render">The title is abc</span></div>'
      );
      render(template(BasicComponent1, "abc", "basic-render"), container);

      expect(container.innerHTML).toBe(
        '<div class="basic"><span class="basic-render">The title is abc</span></div>'
      );

      render(template(BasicComponent1, "abc", {}), container);

      expect(container.innerHTML).toBe(
        '<div class="basic"><span class="[object Object]">The title is abc</span></div>'
      );

      render(null, container);

      expect(container.innerHTML).toBe("");
    });

    class BasicComponent2 extends Component {
      render() {
        const template = (name, title, children) => (
          <div className="basic">
            <span className={name}>
              {"The title is"}
              {title}
            </span>
            {children}
          </div>
        );
        return template(this.props.name, this.props.title, this.props.children);
      }
    }

    it("should render a basic component with children", () => {
      const template = (Component, title, name) => (
        <div>
          <Component title={title} name={name}>
            <span>I'm a child</span>
          </Component>
        </div>
      );

      render(template(BasicComponent2, "abc", "basic-render"), container);

      expect(container.innerHTML).toBe(
        '<div><div class="basic"><span class="basic-render">The title is abc</span><span>I\'m a child</span></div></div>'
      );
      render(template(BasicComponent2, "abc", "basic-render"), container);

      expect(container.innerHTML).toBe(
        '<div><div class="basic"><span class="basic-render">The title is abc</span><span>I\'m a child</span></div></div>'
      );

      render(template(BasicComponent2, "123", "basic-update"), container);
      expect(container.innerHTML).toBe(
        '<div><div class="basic"><span class="basic-update">The title is 123</span><span>I\'m a child</span></div></div>'
      );
      render(template(BasicComponent2, "1234", "basic-update"), container);
      expect(container.innerHTML).toBe(
        '<div><div class="basic"><span class="basic-update">The title is 1234</span><span>I\'m a child</span></div></div>'
      );
    });

    class BasicComponent2b extends Component {
      render() {
        const template = children => (
          <div>
            <span>component!</span>
            <div>{children}</div>
          </div>
        );
        return template(this.props.children);
      }
    }

    class BasicComponent2c extends Component {
      render() {
        const template = children => (
          <div>
            <span>other component!</span>
            <div>{children}</div>
          </div>
        );
        return template(this.props.children);
      }
    }

    class BasicComponent3 extends Component {
      render() {
        const template = (styles, title) => (
          <div style={styles}>
            <span style={styles}>
              {"The title is"}
              {title}
            </span>
          </div>
        );

        return template(this.props.styles, this.props.title);
      }
    }

    if (typeof global !== "undefined" && !global.usingJSDOM) {
      it("should render a basic component with styling", () => {
        const template = (Component, props) => <Component {...props} />;

        render(
          template(BasicComponent3, {
            title: "styled!",
            styles: {
              color: "red",
              paddingLeft: "10px"
            }
          }),
          container
        );

        expect(container.innerHTML).toBe(
          '<div style="color: red; padding-left: 10px;"><span style="color: red; padding-left: 10px;">The title is styled!</span></div>'
        );
        render(
          template(BasicComponent3, {
            title: "styled!",
            styles: {
              color: "red",
              paddingLeft: "10px"
            }
          }),
          container
        );

        expect(container.innerHTML).toBe(
          '<div style="color: red; padding-left: 10px;"><span style="color: red; padding-left: 10px;">The title is styled!</span></div>'
        );

        render(
          template(BasicComponent3, {
            title: "styled (again)!",
            styles: {
              color: "blue",
              paddingRight: "20px"
            }
          }),
          container
        );
        expect(container.innerHTML).toBe(
          '<div style="color: blue; padding-right: 20px;"><span style="color: blue; padding-right: 20px;">The title is styled (again)!</span></div>'
        );
      });
    }

    it("should render a basic component with component children", () => {
      const template = (Component1, Component2, Component3) => (
        <Component1>
          <Component2>
            <Component3 />
          </Component2>
        </Component1>
      );
      render(
        template(BasicComponent2b, BasicComponent2b, BasicComponent2b),
        container
      );

      expect(container.innerHTML).toBe(
        "<div><span>component!</span><div><div><span>component!</span><div><div><span>component!</span><div></div></div></div></div></div></div>"
      );

      render(null, container);

      render(
        template(BasicComponent2b, BasicComponent2b, BasicComponent2b),
        container
      );
      expect(container.innerHTML).toBe(
        "<div><span>component!</span><div><div><span>component!</span><div><div><span>component!</span><div></div></div></div></div></div></div>"
      );

      render(
        template(BasicComponent2b, BasicComponent2b, BasicComponent2c),
        container
      );
      expect(container.innerHTML).toBe(
        "<div><span>component!</span><div><div><span>component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>"
      );

      render(
        template(BasicComponent2b, BasicComponent2c, BasicComponent2c),
        container
      );
      expect(container.innerHTML).toBe(
        "<div><span>component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>"
      );

      render(
        template(BasicComponent2b, BasicComponent2c, BasicComponent2c),
        container
      );
      expect(container.innerHTML).toBe(
        "<div><span>component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>"
      );

      render(
        template(BasicComponent2c, BasicComponent2c, BasicComponent2c),
        container
      );
      expect(container.innerHTML).toBe(
        "<div><span>other component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>"
      );
      render(
        template(BasicComponent2c, BasicComponent2c, BasicComponent2c),
        container
      );
      expect(container.innerHTML).toBe(
        "<div><span>other component!</span><div><div><span>other component!</span><div><div><span>other component!</span><div></div></div></div></div></div></div>"
      );
    });

    it("should render a basic component and correctly mount", () => {
      let template;
      let componentWillMountCount;

      class ComponentLifecycleCheck extends Component {
        render() {
          const _template = children => (
            <div>
              <span>component!</span>
              <div>{children}</div>
            </div>
          );
          return _template(this.props.children);
        }

        componentWillMount() {
          componentWillMountCount++;
        }
      }

      componentWillMountCount = 0;
      template = (Component1, Component2, Component3) => (
        <Component1>
          <Component2>
            <Component3 />
          </Component2>
        </Component1>
      );

      render(
        template(
          ComponentLifecycleCheck,
          ComponentLifecycleCheck,
          ComponentLifecycleCheck
        ),
        container
      );
      expect(componentWillMountCount).toBe(3);

      render(
        template(
          ComponentLifecycleCheck,
          ComponentLifecycleCheck,
          ComponentLifecycleCheck
        ),
        container
      );
      expect(componentWillMountCount).toBe(3);
    });

    describe("should render multiple components", () => {
      it("should render multiple components", () => {
        const template = (
          Component,
          title1,
          name1,
          Component2,
          title2,
          name2
        ) => (
          <div>
            <Component1 title={title1} name={name1} />
            <Component2 title={title2} name={name2} />
          </div>
        );

        render(
          template(
            BasicComponent1,
            "component 1",
            "basic-render",
            BasicComponent1,
            "component 2",
            "basic-render"
          ),
          container
        );

        expect(container.innerHTML).toBe(
          '<div><div class="basic"><span class="basic-render">The title is component 1</span></div>' +
            '<div class="basic"><span class="basic-render">The title is component 2</span></div></div>'
        );

        render(
          template(
            BasicComponent1,
            "component 1",
            "basic-render",
            BasicComponent1,
            "component 2",
            "basic-render"
          ),
          container
        );

        expect(container.innerHTML).toBe(
          '<div><div class="basic"><span class="basic-render">The title is component 1</span></div>' +
            '<div class="basic"><span class="basic-render">The title is component 2</span></div></div>'
        );
      });
    });

    it("should mount and unmount a basic component", () => {
      let mountCount;
      let unmountCount;
      let template;

      class ComponentLifecycleCheck extends Component {
        render() {
          const _template = () => (
            <div>
              <span />
            </div>
          );
          return _template();
        }

        componentDidMount() {
          mountCount++;
        }

        componentWillUnmount() {
          unmountCount++;
        }
      }

      mountCount = 0;
      unmountCount = 0;
      template = Component => <Component />;
      render(template(ComponentLifecycleCheck), container);

      expect(mountCount).toBe(1);
      render(null, container);
      expect(unmountCount).toBe(1);
    });

    it("should mount and unmount a basic component #2", () => {
      let mountCount;
      let unmountCount;

      class ComponentLifecycleCheck extends Component {
        render() {
          return (
            <div>
              <span />
            </div>
          );
        }

        componentDidMount() {
          mountCount++;
        }

        componentWillUnmount() {
          unmountCount++;
        }
      }

      mountCount = 0;
      unmountCount = 0;

      render(<ComponentLifecycleCheck />, container);
      expect(mountCount).toBe(1);
      render(null, container);
      expect(unmountCount).toBe(1);
      render(<ComponentLifecycleCheck />, container);
      expect(mountCount).toBe(2);
      render(null, container);
      expect(unmountCount).toBe(2);
    });

    describe("state changes should trigger all lifecycle events for an update", () => {
      let componentWillMountCount;
      let template;

      class ComponentLifecycleCheck extends Component {
        constructor() {
          super(null);
          this.state = {
            counter: 0
          };
        }

        render() {
          const _template = counter => (
            <div>
              <span />
            </div>
          );
          return _template(this.state.counter);
        }

        componentWillMount() {
          componentWillMountCount++;
          this.setState({
            counter: this.state.counter + 1
          });
        }
      }

      beforeEach(done => {
        componentWillMountCount = 0;
        template = Component => <Component />;
        render(template(ComponentLifecycleCheck), container);
        waits(30, done);
      });

      it("componentWillMountCount to have fired once", () => {
        expect(componentWillMountCount).toBe(1);
      });
      it("the element in the component should show the new state", () => {
        expect(container.innerHTML).toBe("<div><span>1</span></div>");
      });
    });

    describe("state changes should trigger all lifecycle events for an update #2", () => {
      let componentWillMountCount;
      let shouldComponentUpdateCount;
      let componentDidUpdateCount;
      let componentWillUpdateCount;
      let template;

      class ComponentLifecycleCheck extends Component {
        constructor() {
          super(null);
          this.state = {
            counter: 0
          };
        }

        render() {
          const _template = counter => (
            <div>
              <span>{counter}</span>
            </div>
          );
          return _template(this.state.counter);
        }

        componentWillMount() {
          componentWillMountCount++;
          setTimeout(() => {
            this.setState({
              counter: this.state.counter + 1
            });
          }, 1);
        }

        shouldComponentUpdate() {
          shouldComponentUpdateCount++;
          return true;
        }

        componentDidUpdate() {
          componentDidUpdateCount++;
        }

        componentWillUpdate() {
          componentWillUpdateCount++;
        }
      }

      beforeEach(done => {
        componentWillMountCount = 0;
        shouldComponentUpdateCount = 0;
        componentDidUpdateCount = 0;
        componentWillUpdateCount = 0;
        template = Component => <Component />;
        render(template(ComponentLifecycleCheck), container);
        waits(30, done);
      });

      it("componentWillMountCount to have fired once", () => {
        expect(componentWillMountCount).toBe(1);
      });
      it("shouldComponentUpdateCount to have fired once", () => {
        expect(shouldComponentUpdateCount).toBe(1);
      });
      it("componentWillUpdateCount to have fired once", () => {
        expect(componentWillUpdateCount).toBe(1);
      });
      it("componentDidUpdateCount to have fired once", () => {
        expect(componentDidUpdateCount).toBe(1);
      });
      it("the element in the component should show the new state", () => {
        expect(container.innerHTML).toBe("<div><span>1</span></div>");
      });
    });

    describe("should render a basic component with conditional fragment", () => {
      const tpl3625453295 = function() {
        return <h1>BIG</h1>;
      };
      const tpl4021787591 = function() {
        return <h2>small</h2>;
      };

      class ConditionalComponent extends Component {
        render() {
          return (
            <div>
              {this.props.condition ? tpl3625453295() : tpl4021787591()}
              <p>test</p>
            </div>
          );
        }
      }

      it("Initial render (creation)", () => {
        render(<ConditionalComponent condition={true} />, container);
        expect(container.innerHTML).toBe("<div><h1>BIG</h1><p>test</p></div>");
        render(<ConditionalComponent condition={false} />, container);
        expect(container.innerHTML).toBe(
          "<div><h2>small</h2><p>test</p></div>"
        );
      });
    });

    describe("should render a basic component with a list of values from state", () => {
      const tpl2026545261 = function(v0) {
        return <ul className="login-organizationlist">{["", v0, ""]}</ul>;
      };
      const tpl3192647933 = function(v0) {
        return <li>{v0}</li>;
      };
      const tpl1546018623 = function(v0) {
        return <v0 />;
      };

      class ValueComponent extends Component {
        constructor(props) {
          super(props);
          this.state = {
            organizations: [
              { name: "test1", key: "1" },
              { name: "test2", key: 2 },
              { name: "test3", key: "3" },
              { name: "test4", key: "4" },
              { name: "test5", key: "5" },
              { name: "test6", key: "6" }
            ]
          };
        }

        render() {
          return tpl2026545261(
            this.state.organizations.map(function(result) {
              return tpl3192647933(result.name);
            })
          );
        }
      }

      it("Initial render (creation)", () => {
        render(tpl1546018623(ValueComponent), container);
        expect(container.innerHTML).toBe(
          '<ul class="login-organizationlist"><li>test1</li><li>test2</li><li>test3</li><li>test4</li><li>test5</li><li>test6</li></ul>'
        );
        render(tpl1546018623(ValueComponent), container);
        expect(container.innerHTML).toBe(
          '<ul class="login-organizationlist"><li>test1</li><li>test2</li><li>test3</li><li>test4</li><li>test5</li><li>test6</li></ul>'
        );
        render(tpl1546018623(ValueComponent), container);
        expect(container.innerHTML).toBe(
          '<ul class="login-organizationlist"><li>test1</li><li>test2</li><li>test3</li><li>test4</li><li>test5</li><li>test6</li></ul>'
        );
      });
    });

    function BasicStatelessComponent1({ name, title }) {
      const template = (_name, _title) => (
        <div className="basic">
          <span className={_name}>{["The title is ", title]}</span>
        </div>
      );
      return template(name, title);
    }

    it("should render a stateless component", () => {
      const template = (Component, title) => (
        <div>
          <Component title={title} name="Hello, World!" />
        </div>
      );

      render(template(BasicStatelessComponent1, "abc"), container);
      expect(container.firstChild.childNodes.length).toBe(1);
      expect(container.firstChild.firstChild.getAttribute("class")).toBe(
        "basic"
      );
      expect(
        container.firstChild.firstChild.firstChild.getAttribute("class")
      ).toBe("Hello, World!");
      expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
      expect(container.firstChild.firstChild.firstChild.textContent).toBe(
        "The title is abc"
      );
      render(template(BasicStatelessComponent1, null), container);
      render(template(BasicStatelessComponent1, "abc"), container);
      expect(container.firstChild.childNodes.length).toBe(1);
      expect(container.firstChild.firstChild.getAttribute("class")).toBe(
        "basic"
      );
      expect(
        container.firstChild.firstChild.firstChild.getAttribute("class")
      ).toBe("Hello, World!");
      expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
      expect(container.firstChild.firstChild.firstChild.textContent).toBe(
        "The title is abc"
      );

      render(template(BasicStatelessComponent1), container);
      expect(container.firstChild.childNodes.length).toBe(1);
      expect(container.firstChild.firstChild.getAttribute("class")).toBe(
        "basic"
      );
      expect(
        container.firstChild.firstChild.firstChild.getAttribute("class")
      ).toBe("Hello, World!");
      expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
      expect(container.firstChild.firstChild.firstChild.textContent).toBe(
        "The title is "
      );

      render(template(BasicStatelessComponent1), container);
      expect(container.firstChild.childNodes.length).toBe(1);
      expect(container.firstChild.firstChild.getAttribute("class")).toBe(
        "basic"
      );
      expect(
        container.firstChild.firstChild.firstChild.getAttribute("class")
      ).toBe("Hello, World!");
      expect(container.firstChild.firstChild.firstChild.tagName).toBe("SPAN");
      expect(container.firstChild.firstChild.firstChild.textContent).toBe(
        "The title is "
      );
    });

    describe("should render a component with a conditional state item", () => {
      const tpl3578458729 = function(v0) {
        return <div className="login-view bg-visma">{v0}</div>;
      };
      const tpl188998005 = function() {
        return <div>VISIBLE</div>;
      };

      const tpl3754840163 = function(v0) {
        return (
          <div>
            <button onclick={v0}>Make visible</button>
          </div>
        );
      };

      class TEST extends Component {
        constructor(props) {
          super(props);
          this.state = {
            show: false
          };

          this.makeVisible = function() {
            this.setState({
              show: true
            });
          }.bind(this);
        }

        render() {
          return tpl3578458729(
            function() {
              if (this.state.show === true) {
                return tpl188998005();
              } else {
                return tpl3754840163(this.makeVisible);
              }
            }.call(this)
          );
        }
      }

      it("Initial render (creation)", () => {
        render(<TEST />, container);
        expect(container.innerHTML).toBe(
          innerHTML(
            '<div class="login-view bg-visma"><div><button>Make visible</button></div></div>'
          )
        );
      });

      it("Second render (update with state change)", done => {
        render(<TEST />, container);
        render(<TEST />, container);
        const buttons = Array.prototype.slice.call(
          container.querySelectorAll("button")
        );

        buttons.forEach(button => button.click());

        requestAnimationFrame(() => {
          expect(container.innerHTML).toBe(
            innerHTML('<div class="login-view bg-visma"><div>VISIBLE</div>')
          );
          done();
        });
      });
    });

    describe("should render a component with a list of divs", () => {
      const BaseView = function(v0, v1) {
        return (
          <div className="login-view">
            <button onclick={v0}>ADD</button>
            <br />
            {v1}
          </div>
        );
      };

      const Looper = function(v0) {
        return (
          <div>
            <h1>{v0}</h1>
          </div>
        );
      };

      class SomeError extends Component {
        constructor(props) {
          super(props);
          this.state = {
            list: ["SS", "SS1"]
          };
        }

        render() {
          /* eslint new-cap:0 */
          return BaseView(
            this.toggle,
            function() {
              return this.state.list.map(function(result) {
                return Looper(result);
              });
            }.call(this)
          );
        }
      }

      it("Initial render (creation)", () => {
        render(<SomeError />, container);

        expect(container.innerHTML).toBe(
          innerHTML(
            '<div class="login-view"><button>ADD</button><br><div><h1>SS</h1></div><div><h1>SS1</h1></div></div>'
          )
        );

        render(<SomeError />, container);

        expect(container.innerHTML).toBe(
          innerHTML(
            '<div class="login-view"><button>ADD</button><br><div><h1>SS</h1></div><div><h1>SS1</h1></div></div>'
          )
        );
      });
    });

    describe("should render a component with a list of text nodes", () => {
      const root = function(children) {
        return <div>{children}</div>;
      };

      const header = function(children) {
        return <div>{children}</div>;
      };

      const view = function(state) {
        return root([state ? header(["Foo"]) : header(["Bar", "Qux"])]);
      };

      it("Initial render (creation)", () => {
        render(view(true), container);
        expect(container.innerHTML).toBe(
          innerHTML("<div><div>Foo</div></div>")
        );
      });
      it("Second render (update)", () => {
        render(view(true), container);
        render(view(false), container);
        expect(container.innerHTML).toBe(
          innerHTML("<div><div>BarQux</div></div>")
        );
      });
    });

    describe("SetState function callback", () => {
      it("Should have state, props, and context as parameters", done => {
        function checkParams(state, props) {
          expect(state).toEqual({ btnstate: "btnstate" });
          expect(props).toEqual({ buttonProp: "magic", children: "btn" });
          done();
        }

        class Button extends Component {
          constructor(props) {
            super(props);
            this.state = {
              btnstate: "btnstate"
            };
          }

          click() {
            this.setState(checkParams);
          }

          render() {
            return (
              <button
                onClick={this.click.bind(this)}
                style={{ background: "green" }}
              >
                {this.props.children}
              </button>
            );
          }
        }

        class Message extends Component {
          render() {
            return (
              <div>
                {[this.props.text, <Button buttonProp="magic">btn</Button>]}
              </div>
            );
          }
        }

        class MessageList extends Component {
          render() {
            const children = this.props.messages.map(function(message) {
              return <Message text={message.text} />;
            });

            return <div>{children}</div>;
          }
        }

        render(
          <MessageList messages={[{ text: "eka" }, { text: "toka" }]} />,
          container
        );

        container.querySelector("button").click();
      });
    });
  }
});

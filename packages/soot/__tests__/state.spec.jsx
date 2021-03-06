import { V, render, Component } from "soot";
import { VNodeFlags } from "soot-vnode-flags";

class TestCWRP extends Component {
  constructor(props) {
    super(props);

    this.state = {
      a: 0,
      b: 0
    };
  }

  componentWillReceiveProps() {
    this.setState({ a: 1 });

    if (this.state.a !== 1) {
      this.props.done("state is not correct");
      return;
    }

    this.props.done();
  }

  render() {
    return <div>{JSON.stringify(this.state)}</div>;
  }
}

describe("state", () => {
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

  // As per React
  it("Should not have state defined in base constructor", () => {
    class Foo extends Component {
      constructor(p, c) {
        super(p, c);

        expect(this.state).toBeNull();
      }
    }

    const f = new Foo({}, {});

    expect(f).not.toBeNull();
  });

  describe("setting state", () => {
    it("Should call ref callback for componentClass", done => {
      const node = V(
        VNodeFlags.ComponentClass,
        TestCWRP,
        null,
        null,
        null,
        null,
        done
      );
      render(node, container);
    });
  });

  describe("didUpdate and setState", () => {
    it("order", done => {
      class Test extends Component {
        constructor(props) {
          super(props);

          this.state = {
            testScrollTop: 0
          };
        }

        componentWillReceiveProps(nextProps) {
          if (nextProps.scrollTop !== 0) {
            this.setState({ testScrollTop: nextProps.scrollTop });
          }
        }

        componentDidUpdate(prevProps, prevState) {
          expect(prevState.testScrollTop).toBe(0);
          expect(this.state.testScrollTop).toBe(200);
        }

        render() {
          return <div>aa</div>;
        }
      }

      class Example extends Component {
        constructor(props) {
          super(props);
          this.state = {
            exampleScrollTop: 0
          };
        }

        render() {
          return <Test scrollTop={this.state.exampleScrollTop} />;
        }

        componentDidMount() {
          setTimeout(() => {
            this.setState({ exampleScrollTop: 200 });

            setTimeout(() => {
              done();
            }, 50);
          }, 50);
        }
      }

      const node = <Example name="World" />;
      render(node, container);
    });
  });
});

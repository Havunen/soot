import { innerHTML } from "soot-utils";
import { render, Component } from "soot";

describe("Components (JSX) #2", () => {
  let container;
  let Inner;
  let attachedListener = null;
  let renderedName = null;

  beforeEach(function() {
    attachedListener = null;
    renderedName = null;

    container = document.createElement("div");
    container.style.display = "none";
    document.body.appendChild(container);

    Inner = class extends Component {
      render() {
        attachedListener = this.props.onClick;
        renderedName = this.props.name;
        return <div className={this.props.name} />;
      }
    };
  });

  afterEach(function() {
    render(null, container);
    document.body.removeChild(container);
  });

  describe("tracking DOM state", () => {
    class ComponentA extends Component {
      render() {
        return (
          <div>
            <span>Something</span>
          </div>
        );
      }
    }

    class ComponentB extends Component {
      render() {
        return (
          <div>
            <span>Something</span>
          </div>
        );
      }
    }

    class ComponentBWithStateChange extends Component {
      componentWillMount() {
        this.setState({
          text: "newText"
        });

        this.setState({
          text: "newText2"
        });
      }

      render() {
        return (
          <div>
            <span>{this.state.text}</span>
          </div>
        );
      }
    }

    function ComA() {
      return (
        <div>
          <span>Something</span>
        </div>
      );
    }

    function ComB() {
      return (
        <div>
          <span>Something</span>
        </div>
      );
    }

    it("patching component A to component B, given they have the same children, should replace DOM tree ( for lifecycle ) with identical one", () => {
      render(<ComponentA />, container);
      expect(container.innerHTML).toBe(
        innerHTML("<div><span>Something</span></div>")
      );
      const trackElemDiv = container.firstChild;
      const trackElemSpan = container.firstChild.firstChild;

      render(<ComponentB />, container);
      // These are same but not equal
      expect(container.innerHTML).toBe(
        innerHTML("<div><span>Something</span></div>")
      );
      expect(container.firstChild === trackElemDiv).toBe(false);
      expect(container.firstChild.firstChild === trackElemSpan).toBe(false);
    });

    it("patching component A to component B, given they have the same children, should not change the DOM tree when stateless components", () => {
      render(<ComA />, container);
      expect(container.innerHTML).toBe(
        innerHTML("<div><span>Something</span></div>")
      );
      const trackElemDiv = container.firstChild;
      const trackElemSpan = container.firstChild.firstChild;

      render(<ComB />, container);
      expect(container.innerHTML).toBe(
        innerHTML("<div><span>Something</span></div>")
      );

      expect(container.firstChild === trackElemDiv).toBe(false);
      expect(container.firstChild.firstChild === trackElemSpan).toBe(false);
    });

    it("Should not crash when ComB does setState while changing", () => {
      render(<ComponentA />, container);
      expect(container.innerHTML).toBe(
        innerHTML("<div><span>Something</span></div>")
      );
      const trackElemDiv = container.firstChild;
      const trackElemSpan = container.firstChild.firstChild;

      render(<ComponentBWithStateChange />, container);
      // These are same but not equal
      expect(container.innerHTML).toBe(
        innerHTML("<div><span>newText2</span></div>")
      );
      expect(container.firstChild === trackElemDiv).toBe(false);
      expect(container.firstChild.firstChild === trackElemSpan).toBe(false);
    });
  });

  class Comp extends Component {
    render() {
      return this.props.foo;
    }

    static defaultProps = {
      foo: "bar"
    };
  }

  it("should render the component with a key", () => {
    let val = "1";

    render(<Comp key={val} />, container);
    expect(container.innerHTML).toBe(innerHTML("bar"));
    val = 2;
    render(<Comp key={val} />, container);
    expect(container.innerHTML).toBe(innerHTML("bar"));
  });
});

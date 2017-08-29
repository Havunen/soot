(function() {
  "use strict";

  // React
  // http://jsfiddle.net/4a3avjqy/
  var V = Soot.V;
  var Component = Soot.Component;
  var VNodeFlags = SootVNodeFlags.VNodeFlags;
  var setStateCounter = 0;

  class List extends Component {
    constructor() {
      super();
      // set initial time:
      this.state = {
        items: []
      };
      this.items = [];
    }

    componentDidMount() {
      while (this.items.length < 20000) {
        this.items[this.items.length] = V(
          VNodeFlags.HtmlElement,
          "li",
          null,
          `${this.items.length}bar`
        );
        this.setState({ items: this.items }, function() {
          console.log(setStateCounter++);
        });
      }
    }

    render() {
      return V(VNodeFlags.HtmlElement, "ul", null, this.state.items);
    }
  }

  document.addEventListener("DOMContentLoaded", function() {
    var container = document.querySelector("#App");

    const times = [];
    const count = 100;
    let totalTime = 0;

    for (var i = 0; i < count; i++) {
      var start = window.performance.now();
      console.log("Iteration", i);

      Soot.render(V(VNodeFlags.ComponentClass, List), container);

      var end = window.performance.now();

      // Soot.render(null, container);

      var roundTime = end - start;
      totalTime += roundTime;

      times.push(roundTime);
    }

    Soot.render(
      V(
        VNodeFlags.HtmlElement,
        "div",
        null,
        `
			Rounds: ${count},
			Average: ${totalTime / count},
			Total: ${totalTime}
		`
      ),
      document.querySelector("#results")
    );
  });
})();

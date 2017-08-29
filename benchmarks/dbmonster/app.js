(function() {
  "use strict";
  var elem = document.getElementById("app");

  perfMonitor.startFPSMonitor();
  perfMonitor.startMemMonitor();
  perfMonitor.initProfiler("view update");

  var V = Soot.V;
  var VNodeFlags = SootVNodeFlags.VNodeFlags;
  var elementFlag = VNodeFlags.HtmlElement;
  var nonKeyedAndElement = elementFlag | VNodeFlags.HasNonKeyedChildren;

  var arrow = V(VNodeFlags.HtmlElement, "div", "arrow");

  function renderBenchmark(dbs) {
    var length = dbs.length;
    var databases = new Array(length);

    for (var i = 0; i < length; i++) {
      var db = dbs[i];
      var lastSample = db.lastSample;
      var children = new Array(7);

      children[0] = V(VNodeFlags.HtmlElement, "td", "dbname", db.dbname);
      children[1] = V(
        VNodeFlags.HtmlElement,
        "td",
        "query-count",
        V(
          VNodeFlags.HtmlElement,
          "span",
          lastSample.countClassName,
          lastSample.nbQueries
        )
      );

      for (var i2 = 0; i2 < 5; i2++) {
        var query = lastSample.topFiveQueries[i2];

        children[i2 + 2] = V(nonKeyedAndElement, "td", query.elapsedClassName, [
          V(VNodeFlags.HtmlElement, "div", "foo", query.formatElapsed),
          V(nonKeyedAndElement, "div", "popover left", [
            V(VNodeFlags.HtmlElement, "div", "popover-content", query.query),
            arrow
          ])
        ]);
      }
      databases[i] = V(nonKeyedAndElement, "tr", null, children);
    }

    Soot.render(
      V(
        VNodeFlags.HtmlElement,
        "table",
        "table table-striped latest-data",
        V(nonKeyedAndElement, "tbody", null, databases)
      ),
      elem
    );
  }

  function render() {
    var dbs = ENV.generateData(false).toArray();
    perfMonitor.startProfile("view update");
    renderBenchmark(dbs);
    perfMonitor.endProfile("view update");
    setTimeout(render, ENV.timeout);
  }
  render();
})();

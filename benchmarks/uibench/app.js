(function() {
  "use strict";
  var V = Soot.V;
  var linkEvent = Soot.linkEvent;
  var VNodeFlags = SootVNodeFlags.VNodeFlags;
  document.title = "Soot " + Soot.version;
  uibench.init("Soot", Soot.version);

  function TreeLeaf(id) {
    return V(VNodeFlags.HtmlElement, "li", "TreeLeaf", id);
  }

  var shouldDataUpdate = {
    onComponentShouldUpdate: function(lastProps, nextProps) {
      return lastProps !== nextProps;
    }
  };

  function TreeNode(data) {
    var length = data.children.length;
    var children = new Array(length);

    for (var i = 0; i < length; i++) {
      var n = data.children[i];

      if (n.container) {
        children[i] = V(
          VNodeFlags.ComponentFunction,
          TreeNode,
          null,
          null,
          n,
          n.id,
          shouldDataUpdate
        );
      } else {
        children[i] = V(
          VNodeFlags.ComponentFunction,
          TreeLeaf,
          null,
          null,
          n.id,
          n.id,
          shouldDataUpdate
        );
      }
    }
    return V(
      VNodeFlags.HtmlElement | VNodeFlags.HasKeyedChildren,
      "ul",
      "TreeNode",
      children
    );
  }

  var lastTreeData;

  function tree(data) {
    if (data === lastTreeData) {
      return Soot.NO_OP;
    }
    lastTreeData = data;
    return V(
      VNodeFlags.HtmlElement,
      "div",
      "Tree",
      V(
        VNodeFlags.ComponentFunction,
        TreeNode,
        null,
        null,
        data.root,
        null,
        shouldDataUpdate
      )
    );
  }

  function AnimBox(data) {
    var time = data.time % 10;
    var style =
      "border-radius:" +
      time +
      "px;" +
      "background:rgba(0,0,0," +
      (0.5 + time / 10) +
      ")";

    return V(VNodeFlags.HtmlElement, "div", "AnimBox", null, {
      style: style,
      "data-id": data.id
    });
  }

  var lastAnimData;

  function anim(data) {
    if (data === lastAnimData) {
      return Soot.NO_OP;
    }
    lastAnimData = data;
    var items = data.items;
    var length = items.length;
    var children = new Array(length);

    for (var i = 0; i < length; i++) {
      var item = items[i];

      children[i] = V(
        VNodeFlags.ComponentFunction,
        AnimBox,
        null,
        null,
        item,
        item.id,
        shouldDataUpdate
      );
    }
    return V(
      VNodeFlags.HtmlElement | VNodeFlags.HasKeyedChildren,
      "div",
      "Anim",
      children
    );
  }

  function onClick(text, e) {
    console.log("Clicked", text);
    e.stopPropagation();
  }

  function TableCell(text) {
    return V(VNodeFlags.HtmlElement, "td", "TableCell", text, {
      onClick: linkEvent(text, onClick)
    });
  }

  function TableRow(data) {
    var classes = "TableRow";

    if (data.active) {
      classes = "TableRow active";
    }
    var cells = data.props;
    var length = cells.length + 1;
    var children = new Array(length);

    children[0] = V(
      VNodeFlags.ComponentFunction,
      TableCell,
      null,
      null,
      "#" + data.id,
      -1,
      shouldDataUpdate
    );

    for (var i = 1; i < length; i++) {
      children[i] = V(
        VNodeFlags.ComponentFunction,
        TableCell,
        null,
        null,
        cells[i - 1],
        i,
        shouldDataUpdate
      );
    }
    return V(
      VNodeFlags.HtmlElement | VNodeFlags.HasKeyedChildren,
      "tr",
      classes,
      children,
      { "data-id": data.id }
    );
  }

  var lastTableData;

  function table(data) {
    if (data === lastTableData) {
      return Soot.NO_OP;
    }
    lastTableData = data;
    var items = data.items;
    var length = items.length;
    var children = new Array(length);

    for (var i = 0; i < length; i++) {
      var item = items[i];

      children[i] = V(
        VNodeFlags.ComponentFunction,
        TableRow,
        null,
        null,
        item,
        item.id,
        shouldDataUpdate
      );
    }
    return V(
      VNodeFlags.HtmlElement | VNodeFlags.HasKeyedChildren,
      "table",
      "Table",
      children
    );
  }

  var lastMainData;

  function main(data) {
    if (data === lastMainData) {
      return Soot.NO_OP;
    }
    lastMainData = data;
    var location = data.location;
    var section;

    if (location === "table") {
      section = table(data.table);
    } else if (location === "anim") {
      section = anim(data.anim);
    } else if (location === "tree") {
      section = tree(data.tree);
    }
    return V(VNodeFlags.HtmlElement, "div", "Main", section);
  }

  document.addEventListener("DOMContentLoaded", function(e) {
    var container = document.querySelector("#App");

    uibench.run(
      function(state) {
        Soot.render(main(state), container);
      },
      function(samples) {
        Soot.render(
          V(
            VNodeFlags.HtmlElement,
            "pre",
            null,
            JSON.stringify(samples, null, " ")
          ),
          container
        );
      }
    );
  });
})();

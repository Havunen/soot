const { resolve, join } = require("path");
const alias = require("rollup-plugin-alias");

const ROOT = join(__dirname, "../../../");

module.exports = alias({
  soot: resolve(ROOT, "packages/soot/dist/index.es.js"),
  "soot-iv-flags": resolve(ROOT, "packages/soot-iv-flags/dist/index.es.js"),
  "soot-shared": resolve(ROOT, "packages/soot-shared/dist/index.es.js"),
  "soot-utils": resolve(ROOT, "packages/soot-utils/dist/index.es.js"),
  "soot-vnode-flags": resolve(
    ROOT,
    "packages/soot-vnode-flags/dist/index.es.js"
  )
});

const fs = require("fs");
const path = require("path");

module.exports = {
  collectCoverageFrom: [
    "packages/*/src/**/*.ts",
    "!**/*.ts.js",
    "!**/soot-utils/**/*"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["html", "lcov", "text"],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 85
    }
  },
  globals: {
    usingJSDOM: true,
    usingJest: true
  },
  moduleFileExtensions: ["ts", "js", "jsx", "json"],
  moduleNameMapper: {
    "^soot$": "<rootDir>/packages/soot/src",
    "^soot-iv-flags": "<rootDir>/packages/soot-iv-flags/src",
    "^soot-shared": "<rootDir>/packages/soot-shared/src",
    "^soot-utils": "<rootDir>/packages/soot-utils/src",
    "^soot-vnode-flags": "<rootDir>/packages/soot-vnode-flags/src"
  },
  projects: [
    "<rootDir>/packages/soot",
    "<rootDir>/packages/soot-iv-flags",
    "<rootDir>/packages/soot-shared",
    "<rootDir>/packages/soot-utils",
    "<rootDir>/packages/soot-vnode-flags"
  ],
  rootDir: __dirname,
  setupFiles: ["<rootDir>/scripts/test/requestAnimationFrame.ts"],
  testMatch: [
    "<rootDir>/packages/*/__tests__/**/*spec.js?(x)",
    "<rootDir>/packages/*/__tests__/**/*spec.ts?(x)",
    "<rootDir>/packages/*/__tests__/**/*spec.browser.js?(x)",
    "<rootDir>/packages/*/__tests__/**/*spec.browser.ts?(x)"
  ],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.ts?$": "<rootDir>/node_modules/ts-jest/preprocessor.js"
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es)"],

  setupTestFrameworkScriptFile: require.resolve("./JEST-DEBUG.js")
};

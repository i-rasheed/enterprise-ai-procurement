const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

/** @type {import("eslint").Linter.Config[]} */
module.exports = defineConfig([
  globalIgnores(["dist/*", ".expo/*"]),
  expoConfig,
]);

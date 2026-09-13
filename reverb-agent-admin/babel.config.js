// Babel loads this configuration as CommonJS.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const stylexPlugin = require("@stylexjs/babel-plugin");

module.exports = {
  presets: [["next/babel", { "preset-env": { targets: { node: "current" } } }]],
  plugins: [[stylexPlugin, {
    dev: process.env.NODE_ENV !== "production",
    runtimeInjection: false,
    unstable_moduleResolution: { type: "commonJS", rootDir: __dirname },
  }]],
};

/* craco.config.js */
const path = require(`path`);

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
      "@Components": path.resolve(__dirname, "src/components"),
      "@Views": path.resolve(__dirname, "src/views"),
      "@Layouts": path.resolve(__dirname, "src/layouts"),
    },

    plugins: [
      new NodePolyfillPlugin({
        excludeAliases: ["console"],
      }),
    ],
    node: {
      fs: "empty",
    },
  },
};

/* craco.config.js */
const path = require(`path`);

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  webpack: {
    extensions: ["ts", "tsx", "js", "jsx"],
    alias: {
      "@": path.resolve(__dirname, "src/"),
      "@Components": path.resolve(__dirname, "src/components"),
      "@Views": path.resolve(__dirname, "src/views"),
      "@Layouts": path.resolve(__dirname, "src/layouts"),
      "@Utils": path.resolve(__dirname, "src/utils"),
    },

    plugins: [
      new NodePolyfillPlugin({
        excludeAliases: ["console"],
      }),
    ],
    node: {
      fs: "empty",
    },
    eslint: {
      enable: false,
    },

    // https://github.com/dilanx/craco/issues/335
    // This is the config needed for react-scripts v4
    configure: (config) => {
      config.plugins
        .filter(
          (plugin) => plugin.constructor.name === "ForkTsCheckerWebpackPlugin",
        )
        .forEach((plugin) => {
          plugin.options.memoryLimit = plugin.memoryLimit = 4096;
        });
      return config;
    },
  },
};

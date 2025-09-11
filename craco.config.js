const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (config) => {
      // Keep your polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: require.resolve("path-browserify"),
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        process: require.resolve("process/browser.js"),
        vm: require.resolve("vm-browserify"),
      };

      config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
          process: "process/browser.js",
          Buffer: ["buffer", "Buffer"],
        }),
      ];

      // 👇 Fix asset URLs by setting public path
      config.output.publicPath = "/smartsfilter/";

      return config;
    },
  },
};


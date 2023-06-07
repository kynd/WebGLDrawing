const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const outputPath = path.join(__dirname, "dist");

module.exports = merge(common, {
  mode: "development",
  devtool: "eval",
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 500,
    poll: 3000,
  },
  devServer: {
    static: {
      directory: outputPath,
    },
    watchFiles: ["src/**/*.html"],
    hot: "only",
    open: true,
  },
});

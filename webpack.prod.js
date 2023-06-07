const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const ImageminPlugin = require("imagemin-webpack-plugin").default;
const ImageminMozjpeg = require("imagemin-mozjpeg");
const ImageminWebpWebpackPlugin = require("imagemin-webp-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  plugins: [
    new ImageminPlugin({
      test: /\.(jpe?g|png|gif|svg)$/i,
      pngquant: {
        quality: "70-85",
      },
      gifsicle: {
        interlaced: false,
        optimizationLevel: 9,
        colors: 256,
      },
      plugins: [
        ImageminMozjpeg({
          quality: 85,
          progressive: true,
        }),
      ],
      svgo: {},
    })
  ],
});

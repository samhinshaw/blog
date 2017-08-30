const path = require("path");

module.exports = {
  entry: [
    "./js/entry.js",
    // "./css/bulma.css",
    // "./css/style.css",
    "./css/jekyll/poole.css",
    "./css/jekyll/hyde.css",
    "./css/jekyll/syntax.css",
    "./css/jekyll/sam_specific.css"
  ],
  output: {
    path: __dirname,
    filename: "js/bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        // include: /css/,
        loaders: [
          require.resolve("style-loader"),
          require.resolve("css-loader")
        ]
      }
    ]
  }
  // devServer: {
  //   inline: false,
  //   contentBase: "./dist"
  // }
};

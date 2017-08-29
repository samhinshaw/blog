const path = require("path");

module.exports = {
  entry: [
    "./js/entry.js",
    "./node_modules/bulma/bulma.sass",
    "./css/style.css"
  ],
  output: {
    path: __dirname,
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loaders: [
          require.resolve("style-loader"),
          require.resolve("css-loader")
        ]
      },
      {
        test: /\.s[ac]ss$/,
        loaders: [
          require.resolve("style-loader"),
          require.resolve("css-loader"),
          require.resolve("sass-loader")
        ]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".css", ".scss", ".less", ".sass"],
    alias: {
      bulma$: path.resolve(__dirname, "./node_modules/bulma/bulma.sass"),
      customStyle$: path.resolve(__dirname, "./css/style.css")
    }
  },
  devServer: {
    inline: false,
    contentBase: "./dist"
  }
};

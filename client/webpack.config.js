module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js",
    path: __dirname + "/out"
  },

  devtool: "source-map",

  mode: 'development',
  watch: false,
  watchOptions: {
    ignored: '**/node_modules',
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },

  module: {
    rules: [
      {
        test: /.ts$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/typescript', '@babel/preset-env'],
          },
        },
      },
      {
        test: /.tsx$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/typescript', '@babel/preset-react', '@babel/preset-env'],
          },
        },
      },
    ]
  },

  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  }
};
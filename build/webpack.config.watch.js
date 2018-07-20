const path = require('path');
const webpack = require('webpack');
const internalIp = require('internal-ip');

module.exports = {
  mode: 'development',
  entry: './src/watch.js',
  output: {
    filename: './output.js',
    path: path.resolve(__dirname)
  },
  plugins: [new webpack.NamedModulesPlugin()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  serve: {
    host: internalIp.v4.sync()
  }
};

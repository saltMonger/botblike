var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
        app: './src/game.js',
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        libraryTarget: 'var',
        library: 'GameLib' 
    },
    mode: "none",
    module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['env']
              }
            }
          }
        ]
      },
      devServer: {
        clientLogLevel: 'warning',
        open: true,
        overlay: { warnings: false, errors: true },
        quiet: true,
        compress: true,
        watchOptions: {
            poll: true
        },
        publicPath: __dirname,
        contentBase: path.join(__dirname, 'dist'),
        hot: true
      }
}

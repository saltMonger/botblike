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
    module: {
        loaders: [{
            test: /\.css$/,
            loaders: ['style', 'css']
        },{
            test: /\.js$/,
            loaders: ['babel-loader'],
            include: path.join(__dirname, 'src')
        }]
    }
}

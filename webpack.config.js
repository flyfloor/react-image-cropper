var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var NODE_ENV = process.env.NODE_ENV;
var publicPath = NODE_ENV === 'dev' ? '/dist/' : '';

const plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    // new webpack.optimize.UglifyJsPlugin({
    //     sourceMap: false,
    //     mangle: false
    // })
]
if (process.env.NODE_ENV !== 'dev') {
    plugins.push(
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        })
    )
}

module.exports = {

    entry: "./demo/demo.js",
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'app.js',
        publicPath: publicPath,
    },
    plugins: plugins,
    module: {
        loaders: [
            { 
                test: /\.less$/,
                loader: "style!css!less" 
            }, { 
                test: /\.css$/,
                loader: "style!css" 
            },  { 
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel",
                query: {
                    optional: ['runtime'],
                    stage: 0
                }
            }
        ]
    },
    
};
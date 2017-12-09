var webpack = require('webpack');
var path = require('path');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var ForceCaseSensitivityPlugin = require('force-case-sensitivity-webpack-plugin');
var NODE_ENV = process.env.NODE_ENV
var publicPath = '/dist/';

module.exports = {
    plugins: [
        new ProgressBarPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new ForceCaseSensitivityPlugin()
    ],
    resolve: {
        alias: {
            "react": path.resolve('./node_modules/react'),
            "react-router-dom": path.resolve('./node_modules/react-router-dom')
        },
    },
    entry: { 
        app: NODE_ENV === 'dev' ? 
                [
                    "./demo/demo.js", 
                    "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&overlay=false"
                ]
                : './demo/demo.js',
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'app.js',
        publicPath: publicPath,
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'less-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [require('autoprefixer')]
                        }
                    }
                ],
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [require('autoprefixer')]
                        }
                    },
                    'less-loader',
                ],
            },
            {
                test: /\.(png|jpg)$/,
                use: 'url-loader?limit=8192&name=./image/[name].[ext]'
            }, {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: "babel-loader",
            }, {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: 'babel-loader',
            }, {
                test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                use: 'url-loader?limit=10000&name=./font/[name].[ext]'
            }
        ],
    }
};
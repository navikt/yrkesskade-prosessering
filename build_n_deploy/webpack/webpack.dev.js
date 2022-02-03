const path = require('path');
const webpack = require('webpack');
const { mergeWithCustomize } = require('webpack-merge');
const common = require('./webpack.common');

const config = mergeWithCustomize({
    'entry.yrkesskade-prosessering': 'prepend',
    'module.rules': 'append',
})(common, {
    mode: 'development',
    entry: {
        'yrkesskade-prosessering': [
            'babel-polyfill',
            'react-hot-loader/patch',
            'webpack-hot-middleware/client?reload=true',
        ],
    },
    output: {
        path: path.join(__dirname, '../../frontend_development'),
        filename: '[name].[contenthash].js',
        publicPath: '/assets/',
        globalObject: 'this',
    },
    devtool: 'inline-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    module: {
        rules: [
            // would only land a "hot-patch" to react-dom
            {
                test: /\.(js|ts)$/,
                include: /node_modules\/react-dom/,
                use: ['react-hot-loader/webpack'],
            },
        ],
    },
});

module.exports = config;

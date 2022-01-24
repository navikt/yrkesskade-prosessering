const common = require('./webpack.common');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const { mergeWithCustomize } = require('webpack-merge');

const config = mergeWithCustomize({
    'entry.familie-ks-mottak': 'prepend',
    'module.rules': 'append',
})(common, {
    mode: 'production',
    entry: {
        'familie-ks-mottak': ['babel-polyfill'],
    },
    output: {
        path: path.join(__dirname, '../../frontend_production'),
        filename: '[name].[contenthash].js',
        publicPath: '/assets/',
    },
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new MiniCssExtractPlugin({
            filename: 'familie-prosessering.css',
        }),
    ],
    optimization: {
        minimizer: [new TerserPlugin(), new CssMinimizerWebpackPlugin()],
        emitOnErrors: false,
    },
});

module.exports = config;

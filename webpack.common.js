// The path to the CesiumJS source code
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: {
        app: './src/index.ts',
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
        sourcePrefix: '',
    },
    amd: {
        // Enable webpack-friendly use of require in Cesium
        toUrlUndefined: true,
    },
    resolve: {
        alias: {
            cesium: path.resolve(__dirname, cesiumSource),
        },
        mainFiles: ['index', 'Cesium'],
        extensions: ['.tsx', '.ts', '.js'],
        fallback: {
            "stream": require.resolve("stream-browserify"),
            "assert": require.resolve("assert/"),
            "util": require.resolve("util/"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "url": require.resolve("url/"),
            "buffer": require.resolve("buffer")
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|gif|jpg|jpeg|svg|xml)$/,
                use: ['url-loader'],
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            favicon: 'src/favicon.png',
        }),
        // Copy Cesium Assets, Widgets, and Workers to a static directory.
        new CopyWebpackPlugin({
            patterns: [
                { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
                { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
                { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
            ]
        }),
        new webpack.DefinePlugin({
            // Define relative base path in Cesium for loading assets.
            CESIUM_BASE_URL: JSON.stringify('/'),
        }),
        new webpack.DefinePlugin({
            "process.env.NODE_DEBUG": JSON.stringify(process.env.NODE_DEBUG),
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
    ],
};
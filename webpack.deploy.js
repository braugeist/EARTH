const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const contractDir = 'src/contract/build';

module.exports = {
    mode: 'development',
    devtool: 'eval-source-map',
    context: __dirname,
    entry: {
        app: './src/deploy/index.ts',
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'tmp/deploy'),
        sourcePrefix: '',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/deploy/index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: contractDir, to: 'contract' },
            ]
        }),
    ],
};
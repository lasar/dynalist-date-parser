const path = require('path');

const package = require('./package');

module.exports = {
    mode: 'production',
    entry: './src/webpack.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'dynalist-date-parser-' + package.version + '.js'
    },
    resolve: {
        alias: {
            'node_modules': path.join(__dirname, 'node_modules'),
        }
    }
};

const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'react-chess.js',
        globalObject: 'this',
        library: 'useChess',
        libraryExport: 'default',
        libraryTarget: 'umd'
    },
    externals: {
        react: {
            amd: 'react',
            commonjs: 'react',
            commonjs2: 'react',
            root: 'React'
       }
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: true
                    }
                }
            }
        ]
    }
};

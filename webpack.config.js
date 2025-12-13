const path = require('path');

module.exports = {
    entry: './Main.fs.js',
    output: {
        path: path.join(__dirname, './public'),
        filename: 'bundle.js',
    },
    devServer: {
        static: {
            directory: path.join(__dirname, './public')
        },
        port: 8080,
        hot: true
    },
    module: {
        rules: [{
            test: /\.fs(x|proj)?$/,
            use: {
                loader: 'fable-loader',
                options: {
                    babel: {
                        presets: ['@babel/preset-react']
                    }
                }
            }
        }]
    }
};
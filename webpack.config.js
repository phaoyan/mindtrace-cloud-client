// webpack.config.js
module.exports = {
    // ... other config
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    use: [
        {
            loader: 'babel-loader',
        },
        {
            loader: '@svgr/webpack',
            options: {
                babel: false,
                icon: true,
            },
        },
    ],
};
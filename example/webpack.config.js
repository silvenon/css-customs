const HtmlPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src',
  output: {
    path: `${__dirname}/dist`,
    filename: 'bundle.js',
  },
  context: __dirname,
  devServer: {
    open: true,
  },
  plugins: [new HtmlPlugin({ template: 'src/index.html' })],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: `${__dirname}/src`,
        use: ['babel-loader'],
      },
      {
        oneOf: [
          {
            test: /\.module\.css$/,
            include: `${__dirname}/src`,
            use: [
              'style-loader',
              'css-loader?importLoaders=1&modules',
              'postcss-loader',
            ],
          },
          {
            test: /\.css$/,
            include: `${__dirname}/src`,
            use: [
              'style-loader',
              'css-customs-loader',
              'css-loader?importLoaders=1',
              'postcss-loader',
            ],
          },
          {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader?importLoaders=1',
              'postcss-loader',
            ],
          },
        ],
      },
    ],
  },
}

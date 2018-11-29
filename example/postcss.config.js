module.exports = {
  plugins: {
    'postcss-preset-env': {
      importFrom: 'src/global.css',
      features: {
        'custom-properties': true,
        'custom-media-queries': true,
        'custom-selectors': true,
      },
    },
  },
}

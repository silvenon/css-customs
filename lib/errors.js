exports.addBeforeCssLoader = new Error(
  `
css-customs-loader should be added BEFORE css-loader.
  `.trim()
)

exports.usePostcssLoader = new Error(
  `
postcss-loader is missing, you need to use it in order for css-customs-loader to work properly.
  `
)

exports.parseBeforeCssLoader = new Error(
  `
css-customs-loader/parse should added AFTER css-loader. If the order of your loaders is intentional and it works, consider raising an issue to remove this error.
https://github.com/silvenon/css-customs-loader/issues
  `.trim()
)

exports.parseBeforePostcssLoader = new Error(
  `
css-customs-loader/parse should be added AFTER postcss-loader. If the order of your loaders is intentional and it works, consider raising an issue to remove this error.
https://github.com/silvenon/css-customs-loader/issues
  `.trim()
)

exports.exportAfterCssLoader = new Error(
  `
css-customs-loader/export should be added BEFORE css-loader. If the order of your loaders is intentional and it works, consider raising an issue to remove this error.
https://github.com/silvenon/css-customs-loader/issues
  `.trim()
)

exports.noIndexLoader = new Error(
  `
Use css-customs-loader/parse and css-customs-loader/export.
  `.trim()
)

exports.missingPostcssConfig = new Error(
  `
You're using postcss-loader, but css-customs-loader/parse couldn't find a valid PostCSS configuration.
  `.trim()
)

exports.missingParseLoader = new Error(
  `
css-customs-loader/parse loader is missing.
  `.trim()
)

exports.missingCustoms = new Error(
  `
Customs are missing. Maybe you're using a loader between css-customs-loader/parse and css-customs-loader/export that modified metadata and lost them. Please raise an issue providing your webpack configuration.
https://github.com/silvenon/css-customs-loader/issues
  `
)

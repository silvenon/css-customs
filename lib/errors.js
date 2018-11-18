exports.positioningError = new Error(
  `
This loader should added BEFORE css-loader. If your positioning was intentional and it works, consider raising an issue to remove this error.
https://github.com/silvenon/css-custom-globals-loader/issues
`.trim()
)

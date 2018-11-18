const postcss = require('postcss')
const presetEnv = require('postcss-preset-env')
const requireFromString = require('require-from-string')
const { positioningError } = require('./errors')

module.exports = function(content) {
  const nextLoaders = this.loaders.slice(this.loaderIndex + 1)
  if (!nextLoaders.some(loader => loader.path.match(/\bcss-loader\b/))) {
    this.emitError(positioningError)
  }

  const callback = this.async()
  const exported = requireFromString(content, this.resourcePath)
  // eslint-disable-next-line no-unused-vars
  const [_, css] = exported.find(
    e => Array.isArray(e) && e[0] === this.resourcePath
  )

  let globals = {}
  const exportGlobals = () => {
    globals = JSON.stringify(globals)
    callback(
      null,
      `${content.trim()}\n\nexports.locals = Object.assign({}, exports.locals, ${globals});`
    )
  }

  const configuredPresetEnv = presetEnv({
    exportTo: variables => {
      globals = variables
    },
    features: {
      'custom-properties': true,
      'custom-media-queries': true,
      'custom-selectors': true,
    },
  })

  postcss([configuredPresetEnv])
    .process(css, { from: this.resourcePath })
    .then(exportGlobals)
    .catch(error => {
      callback(error)
    })
}

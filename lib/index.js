const postcss = require('postcss')
const presetEnv = require('postcss-preset-env')
const babelParser = require('@babel/parser')
const babelTraverse = require('@babel/traverse').default
const { positioningError, extractCssError } = require('./errors')

module.exports = function(content) {
  const nextLoaders = this.loaders.slice(this.loaderIndex + 1)
  if (!nextLoaders.some(loader => loader.path.match(/\bcss-loader\b/))) {
    this.emitError(positioningError)
  }

  const callback = this.async()

  const ast = babelParser.parse(content)
  let css
  babelTraverse(ast, {
    enter(path) {
      if (
        path.node.type === 'ArrayExpression' &&
        path.node.elements[0].type === 'MemberExpression' &&
        path.node.elements[0].object.name === 'module' &&
        path.node.elements[0].property.name === 'id'
      ) {
        css = path.node.elements[1].value
      }
    },
  })

  if (css == null) {
    this.emitError(extractCssError)
  }

  let customs = {}
  const exportCustoms = () => {
    customs = JSON.stringify(customs)
    callback(
      null,
      `${content.trim()}\n\nexports.locals = Object.assign({}, exports.locals, ${customs});`
    )
  }

  const configuredPresetEnv = presetEnv({
    exportTo: extractedCustoms => {
      customs = extractedCustoms
    },
    features: {
      'custom-properties': true,
      'custom-media-queries': true,
      'custom-selectors': true,
    },
  })

  postcss([configuredPresetEnv])
    .process(css, { from: this.resourcePath })
    .then(exportCustoms)
    .catch(error => {
      callback(error)
    })
}

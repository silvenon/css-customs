const { getOptions } = require('loader-utils')
const postcss = require('postcss')
const postcssrc = require('postcss-load-config')
const parsePostcssLoaderOptions = require('postcss-loader/src/options')
const postcssPresetEnv = require('postcss-preset-env')
const path = require('path')
const { findNextLoader, isLoader, exec } = require('./utils')
const error = require('./errors')

const rawLoader = require.resolve('raw-loader')

module.exports = async function(content, sourceMap, meta) {
  const callback = this.async()
  const loaderOptions = getOptions(this) || { stage: 0 }

  if (findNextLoader(this, 'css-loader') == null) {
    return callback(error.addBeforeCssLoader)
  }

  const postcssLoaderIndex = this.loaders.findIndex(loader =>
    isLoader(loader, 'postcss-loader')
  )
  if (postcssLoaderIndex === -1) {
    return callback(error.usePostcssLoader)
  }

  const additionalLoaders = this.loaders.slice(postcssLoaderIndex + 1)
  const additionalLoadersRequest = [
    rawLoader,
    ...additionalLoaders.map(({ request }) => request),
  ].join('!')
  const request =
    additionalLoadersRequest.length > 0
      ? `!!${additionalLoadersRequest}!${this.resource}`
      : `!!${this.resource}`

  let css
  try {
    css = await new Promise((resolve, reject) => {
      this.loadModule(request, (err, sourceBeforePostcss) => {
        if (err) return reject(err)
        resolve(exec(sourceBeforePostcss, this.resourcePath, this.context))
      })
    })
  } catch (err) {
    return callback(err)
  }

  const postcssLoader = this.loaders[postcssLoaderIndex]
  let postcssPlugins
  let postcssOptions

  if (postcssLoader.options == null) {
    const file = this.resourcePath
    const rc = {
      ctx: {
        cwd: this.context,
        file: {
          extname: path.extname(file),
          dirname: path.dirname(file),
          basename: path.basename(file),
        },
        options: {},
      },
      path: path.dirname(file),
    }

    try {
      const { plugins, options } = await postcssrc(rc.ctx, rc.path)
      postcssPlugins = plugins
      postcssOptions = options
    } catch (err) {
      return callback(err)
    }
  } else {
    const { options, plugins } = await parsePostcssLoaderOptions(
      postcssLoader.options
    )
    postcssOptions = options
    postcssPlugins = plugins
  }

  postcssPlugins = postcssPlugins.map(plugin =>
    plugin.postcssPlugin == null ? plugin() : plugin
  )

  const postcssPresetEnvIndex = postcssPlugins.findIndex(
    ({ postcssPlugin }) => postcssPlugin === 'postcss-preset-env'
  )
  if (postcssPresetEnvIndex === -1) {
    return callback(error.missingPostcssPresetEnv)
  }
  const previousPostcssPlugins = postcssPlugins.slice(0, postcssPresetEnvIndex)

  let customsJSON

  try {
    await postcss([
      ...previousPostcssPlugins,
      postcssPresetEnv({
        ...loaderOptions,
        exportTo: customs => {
          customsJSON = JSON.stringify(customs, null, 2)
        },
      }),
    ]).process(css, {
      ...postcssOptions,
      from: this.resourcePath,
    })

    const exportContent = `exports.locals = Object.assign({}, exports.locals, ${customsJSON})`
    const newContent = `${content.trim()}\n\n${exportContent}`

    callback(null, newContent, sourceMap, meta)
  } catch (err) {
    callback(err)
  }
}

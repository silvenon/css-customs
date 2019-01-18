module.exports.onCreateWebpackConfig = (
  { actions, getConfig, loaders, rules },
  pluginOptions = {}
) => {
  const { cssModules = false } = pluginOptions

  const config = getConfig()
  const cssLoader = loaders.css()
  const plainCssRule = rules.css()
  const cssModulesRule = rules.cssModules()

  const isCssLoader = ({ loader }) => loader === cssLoader.loader
  const isPlainCssRule = rule => (rule.test.source = plainCssRule.test.source)
  const isCssModulesRule = rule =>
    (rule.test.source = cssModulesRule.test.source)
  const isAnyCssRule = rule => isPlainCssRule(rule) || isCssModulesRule(rule)
  const cssRules = config.module.rules.find(
    rule => Array.isArray(rule.oneOf) && rule.oneOf.every(isAnyCssRule)
  )
  const cssCustomsLoader = require.resolve('css-customs-loader')

  cssRules.oneOf
    .filter(cssModules ? isAnyCssRule : isPlainCssRule)
    .forEach(rule => {
      const insertIndex = rule.use.findIndex(isCssLoader)
      if (insertIndex !== -1) {
        rule.use.splice(insertIndex, 0, cssCustomsLoader)
      }
    })

  actions.replaceWebpackConfig(config)
}

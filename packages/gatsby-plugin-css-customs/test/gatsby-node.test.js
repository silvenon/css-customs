const { mockConfig, mockParams } = require('./utils')
const { loaderSerializer } = require('./serializers')

const {
  onCreateWebpackConfig: applyPostcss,
} = require('gatsby-plugin-postcss/gatsby-node')
const {
  onCreateWebpackConfig: applyCssModulesFlowTypes,
} = require('gatsby-plugin-css-modules-flow-types/gatsby-node')
const { onCreateWebpackConfig: applyCssCustoms } = require('../gatsby-node')

const getCssRules = config => config.module.rules.slice(-1)[0].oneOf

expect.addSnapshotSerializer(loaderSerializer)

it('applies the loader', () => {
  let config = mockConfig()
  applyPostcss(...mockParams({ config }))
  applyCssCustoms(...mockParams({ config }))
  const cssRules = getCssRules(config)
  expect(cssRules).toMatchSnapshot()
})

it('composes well with similar plugins', () => {
  let config = mockConfig()
  applyPostcss(...mockParams({ config }))
  applyCssModulesFlowTypes(...mockParams({ config }))
  applyCssCustoms(...mockParams({ config }))
  const cssRules = getCssRules(config)
  expect(cssRules).toMatchSnapshot()
})

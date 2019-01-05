/**
 * Minimally reproduces everything that our dependencies need.
 */

const mockLoaders = () => ({
  null: jest.fn(options => ({
    loader: 'null-loader',
    options: { ...options },
  })),
  js: jest.fn(options => ({
    loader: 'babel-loader',
    options: { ...options },
  })),
  style: jest.fn(options => ({
    loader: 'style-loader',
    options: { ...options },
  })),
  css: jest.fn(options => ({ loader: 'css-loader', options: { ...options } })),
  miniCssExtract: jest.fn(options => ({
    loader: 'mini-css-extract-loader',
    options: { ...options },
  })),
})

const mockRules = () => {
  const loaders = mockLoaders()
  return {
    js: jest.fn(() => ({
      test: /\.js$/,
      use: [loaders.js()],
    })),
    css: jest.fn(() => ({
      test: /\.css$/,
      use: [loaders.style(), loaders.css()],
    })),
    cssModules: jest.fn(() => ({
      test: /\.module\.css$/,
      use: [loaders.style(), loaders.css({ modules: true })],
    })),
  }
}

const mockConfig = () => {
  const rules = mockRules()
  return {
    module: {
      rules: [
        rules.js(),
        {
          oneOf: [rules.cssModules(), rules.css()],
        },
      ],
    },
  }
}

const mockParams = ({ config: prevConfig, pluginOptions = {} }) => [
  {
    stage: 'develop',
    getConfig: jest.fn(() => prevConfig),
    loaders: mockLoaders(),
    rules: mockRules(),
    actions: {
      replaceWebpackConfig: jest.fn(nextConfig => {
        prevConfig = nextConfig
      }),
    },
  },
  pluginOptions,
]

module.exports = {
  mockConfig,
  mockParams,
}

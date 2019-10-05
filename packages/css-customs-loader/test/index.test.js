const path = require('path')
const compile = require('./compile')

const cssCustomsLoader = require.resolve('../')
const getCompiledOutput = ({ stats, entry }) =>
  stats
    .toJson()
    .modules.find(
      ({ name, identifier }) =>
        name.includes(entry) && identifier.includes(cssCustomsLoader)
    )
    // normalize for CI
    .source.replace(
      path.relative(`${__dirname}/fixtures`, process.cwd()),
      '<relative path to CWD>'
    )

describe(`emits an error`, () => {
  test(`when css-customs-loader is placed after css-loader`, async () => {
    await expect(
      compile({
        entry: './fixtures/basic.css',
        rules: [
          {
            test: /\.css$/,
            use: [
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 2,
                },
              },
              cssCustomsLoader,
              'postcss-loader',
            ],
          },
        ],
      })
    ).rejects.toMatchSnapshot()
  })

  test(`when postcss-preset-env is missing`, async () => {
    await expect(
      compile({
        entry: './fixtures/basic.css',
        rules: [
          {
            test: /\.css$/,
            use: [
              cssCustomsLoader,
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  plugins: () => [require('postcss-brand-colors')],
                },
              },
            ],
          },
        ],
      })
    ).rejects.toMatchSnapshot()
  })

  test(`when postcss-loader is missing`, async () => {
    await expect(
      compile({
        entry: './fixtures/basic.css',
        rules: [
          {
            test: /\.css$/,
            use: [cssCustomsLoader, 'css-loader'],
          },
        ],
      })
    ).rejects.toMatchSnapshot()
  })
})

it(`exposes CSS customs in the default export object`, async () => {
  const { stats, entry } = await compile({
    entry: './fixtures/basic.css',
    rules: [
      {
        test: /\.css$/,
        use: [
          cssCustomsLoader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },
    ],
  })
  const output = getCompiledOutput({ stats, entry })
  expect(output).toMatchSnapshot()
})

it(`exposes CSS Modules in the same object as customs`, async () => {
  const { stats, entry } = await compile({
    entry: './fixtures/modules.css',
    rules: [
      {
        test: /\.css$/,
        use: [
          cssCustomsLoader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
          'postcss-loader',
        ],
      },
    ],
  })
  const output = getCompiledOutput({ stats, entry })
  expect(output).toMatchSnapshot()
})

it(`can export only locals`, async () => {
  const { stats, entry } = await compile({
    entry: './fixtures/modules.css',
    rules: [
      {
        test: /\.css$/,
        use: [
          `${cssCustomsLoader}?onlyLocals`,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
              onlyLocals: true,
            },
          },
          'postcss-loader',
        ],
      },
    ],
  })
  const output = getCompiledOutput({ stats, entry })
  expect(output).toMatchSnapshot()
})

it(`supports files with external @imports`, async () => {
  await compile({
    entry: './fixtures/external.css',
    rules: [
      {
        test: /\.css$/,
        include: `${__dirname}/fixtures`,
        use: [
          cssCustomsLoader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              config: { path: __dirname },
            },
          },
        ],
      },
    ],
  })
})

it(`uses PostCSS plugins before postcss-preset-env`, async () => {
  const { stats, entry } = await compile({
    entry: './fixtures/postcss-plugins.css',
    rules: [
      {
        test: /\.css$/,
        use: [
          cssCustomsLoader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                require('postcss-brand-colors'),
                require('postcss-preset-env'),
              ],
            },
          },
        ],
      },
    ],
  })
  const output = getCompiledOutput({ stats, entry })
  expect(output).toMatchSnapshot()
})

it('uses webpack loaders after postcss-loader', async () => {
  const { stats, entry } = await compile({
    entry: './fixtures/loaders.less',
    rules: [
      {
        test: /\.less$/,
        use: [
          cssCustomsLoader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
            },
          },
          'postcss-loader',
          'less-loader',
        ],
      },
    ],
  })
  const output = getCompiledOutput({ stats, entry })
  expect(output).toMatchSnapshot()
})

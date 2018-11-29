const compile = require('./compile')

const cssCustomsLoader = require.resolve('../')

describe(`emits an error`, () => {
  test(`when css-customs-loader is placed after css-loader`, async () => {
    const { stats } = await compile({
      entry: './fixtures/basic.css',
      logErrors: false,
      rules: [
        {
          test: /\.css$/,
          use: [
            'css-loader?importLoaders=2',
            cssCustomsLoader,
            'postcss-loader',
          ],
        },
      ],
    })
    expect(stats.hasErrors()).toBe(true)
  })

  test(`when postcss-preset-env is missing`, async () => {
    const { stats } = await compile({
      entry: './fixtures/basic.css',
      logErrors: false,
      rules: [
        {
          test: /\.css$/,
          use: [
            cssCustomsLoader,
            'css-loader?importLoaders=1',
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
    expect(stats.hasErrors()).toBe(true)
  })

  test(`when postcss-loader is missing`, async () => {
    const { stats } = await compile({
      entry: './fixtures/basic.css',
      logErrors: false,
      rules: [
        {
          test: /\.css$/,
          use: [cssCustomsLoader, 'css-loader'],
        },
      ],
    })
    expect(stats.hasErrors()).toBe(true)
  })
})

it(`exposes CSS customs in the default export object`, async () => {
  const { stats, entry } = await compile({
    entry: './fixtures/basic.css',
    rules: [
      {
        test: /\.css$/,
        use: [cssCustomsLoader, 'css-loader?importLoaders=1', 'postcss-loader'],
      },
    ],
  })
  expect(stats.hasErrors()).toBe(false)
  const output = stats.toJson().modules.find(m => m.name.includes(entry)).source
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
          'css-loader?importLoaders=1&modules',
          'postcss-loader',
        ],
      },
    ],
  })
  expect(stats.hasErrors()).toBe(false)
  const output = stats.toJson().modules.find(m => m.name.includes(entry)).source
  expect(output).toMatchSnapshot()
})

it(`supports files with external @imports`, async () => {
  const { stats } = await compile({
    entry: './fixtures/external.css',
    rules: [
      {
        test: /\.css$/,
        include: `${__dirname}/fixtures`,
        use: [
          cssCustomsLoader,
          'css-loader?importLoaders=1',
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
  expect(stats.hasErrors()).toBe(false)
})

it(`uses PostCSS plugins before postcss-preset-env`, async () => {
  const { stats, entry } = await compile({
    entry: './fixtures/postcss-plugins.css',
    rules: [
      {
        test: /\.css$/,
        use: [
          cssCustomsLoader,
          'css-loader?importLoaders=1',
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
  expect(stats.hasErrors()).toBe(false)
  const output = stats.toJson().modules.find(m => m.name.includes(entry)).source
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
          'css-loader?importLoaders=2',
          'postcss-loader',
          'less-loader',
        ],
      },
    ],
  })
  expect(stats.hasErrors()).toBe(false)
  const output = stats.toJson().modules.find(m => m.name.includes(entry)).source
  expect(output).toMatchSnapshot()
})

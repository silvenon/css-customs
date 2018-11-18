const path = require('path')
const compile = require('./compile')
const cssCustomsLoader = path.resolve(__dirname, '../')

it('emits a warning when not placed before css-loader', async () => {
  const entry = './fixtures/basic.css'
  const stats = await compile(entry, {
    cssRuleUse: ['css-loader', cssCustomsLoader],
  })
  expect(stats.hasErrors()).toBe(true)
})

it('exposes CSS customs in the default export object', async () => {
  const entry = './fixtures/basic.css'
  const stats = await compile(entry, {
    cssRuleUse: [cssCustomsLoader, 'css-loader'],
  })
  expect(stats.hasErrors()).toBe(false)
  const output = stats.toJson().modules.find(m => m.name.includes(entry)).source
  expect(output).toMatchSnapshot()
})

it('exposes CSS Modules in the same object as customs', async () => {
  const entry = './fixtures/modules.css'
  const stats = await compile(entry, {
    cssRuleUse: [cssCustomsLoader, 'css-loader?modules'],
  })
  expect(stats.hasErrors()).toBe(false)
  const output = stats.toJson().modules.find(m => m.name.includes(entry)).source
  expect(output).toMatchSnapshot()
})

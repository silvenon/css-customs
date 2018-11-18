const path = require('path')
const compile = require('./compile')
const cssGlobalsLoader = path.resolve(__dirname, '../')

it('emits a warning when not placed before css-loader', async () => {
  const entry = './fixtures/basic.css'
  const stats = await compile(entry, {
    cssRuleUse: ['css-loader', cssGlobalsLoader],
  })
  expect(stats.hasErrors()).toBe(true)
})

it('exposes CSS globals in the default export object', async () => {
  const entry = './fixtures/basic.css'
  const stats = await compile(entry, {
    cssRuleUse: [cssGlobalsLoader, 'css-loader'],
  })
  expect(stats.hasErrors()).toBe(false)
  const output = stats.toJson().modules.find(m => m.name.includes(entry)).source
  expect(output).toMatchSnapshot()
})

it('exposes CSS Modules in the same object as globals', async () => {
  const entry = './fixtures/modules.css'
  const stats = await compile(entry, {
    cssRuleUse: [cssGlobalsLoader, 'css-loader?modules'],
  })
  expect(stats.hasErrors()).toBe(false)
  const output = stats.toJson().modules.find(m => m.name.includes(entry)).source
  expect(output).toMatchSnapshot()
})

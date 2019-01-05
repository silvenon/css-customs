const Module = require('module')

const isLoader = (loader, loaderName) =>
  loader.path.match(new RegExp(`\\b${loaderName}\\b`))

const findPreviousLoader = (self, loaderName) =>
  self.loaders
    .slice(0, self.loaderIndex)
    .find(loader => isLoader(loader, loaderName))

const findNextLoader = (self, loaderName) =>
  self.loaders
    .slice(self.loaderIndex + 1)
    .find(loader => isLoader(loader, loaderName))

// https://github.com/webpack/webpack.js.org/issues/1268#issuecomment-313513988
const exec = (code, filename, context) => {
  const module = new Module(filename, this)
  module.paths = Module._nodeModulePaths(context)
  module.filename = filename
  module._compile(code, filename)
  return module.exports
}

module.exports = {
  isLoader,
  findPreviousLoader,
  findNextLoader,
  exec,
}

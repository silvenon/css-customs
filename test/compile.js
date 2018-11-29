/* eslint-disable no-console */
const webpack = require('webpack')
const MemoryFs = require('memory-fs')
const path = require('path')

// https://webpack.js.org/contribute/writing-a-loader/#testing

module.exports = ({ entry, logErrors = true, writeToDisk = false, rules }) => {
  const compiler = webpack({
    entry,
    output: {
      path: `${__dirname}/dist`,
      filename: `${path.basename(entry, path.extname(entry))}.bundle.js`,
    },
    context: __dirname,
    mode: 'none',
    target: 'node',
    module: { rules },
  })

  if (!writeToDisk) {
    compiler.outputFileSystem = new MemoryFs()
  }

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err != null) {
        return reject(err)
      }
      if (stats.hasErrors() && logErrors) {
        console.error(stats.toJson().errors.join('\n\n'))
      }
      resolve({ stats, entry })
    })
  })
}

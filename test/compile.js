/* eslint-disable no-console */
const webpack = require('webpack')
const MemoryFs = require('memory-fs')
const path = require('path')

// https://webpack.js.org/contribute/writing-a-loader/#testing

module.exports = (entry, { cssRuleUse, writeToDisk = false }) => {
  const compiler = webpack({
    entry,
    output: {
      path: `${__dirname}/dist`,
      filename: `${path.basename(entry, path.extname(entry))}.bundle.js`,
    },
    context: __dirname,
    mode: 'none',
    module: {
      rules: [
        {
          test: /\.css$/,
          include: `${__dirname}/fixtures`,
          use: cssRuleUse,
        },
      ],
    },
  })

  if (!writeToDisk) {
    compiler.outputFileSystem = new MemoryFs()
  }

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err)
      resolve(stats)
    })
  })
}

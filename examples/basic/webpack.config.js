const path = require('path')
module.exports = {
  entry: './sample-client.js',
  resolve: {
    modules: [
      path.resolve('../../src'),
      path.resolve('../../node_modules')
    ]
  },
  node: {
    setImmediate: false
  },
  output: {
    path: path.join(__dirname, '/public'),
    filename: 'bundledClient.js'
  }
}

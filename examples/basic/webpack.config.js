const path = require('path')
const primusConfig = require('./server-config.json').primus

module.exports = {
  entry: './sample-client.js',
  module: {
    rules: [
      {
        test: require.resolve('../../primus-client-shim.js'),
        use: [
          {
            loader: 'val-loader',
            options: {
              primusConfig: primusConfig
            }
          }
        ]
      }
    ]
  },
  resolve: {
    modules: [
      path.resolve('../../node_modules')
    ]
  },
  node: {
    setImmediate: false
  },
  output: {
    path: path.join(__dirname, '/public'),
    filename: 'bundled-client.js'
  }
}

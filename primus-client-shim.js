const http = require('http').createServer()
const Primus = require('primus')

module.exports = function (options) {
  const primus = new Primus(http, options && options.primusConfig)
  const lib = primus.library()
  primus.destroy()

  return {
    code: lib
  }
}

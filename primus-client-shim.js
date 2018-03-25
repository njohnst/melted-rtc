const http = require('http').createServer()
const Primus = require('primus')

module.exports = function (options) {
  const primus = new Primus(http, options.primusConfig)
  const lib = primus.library()
  primus.destroy()

  return {
    code: lib
  }
}

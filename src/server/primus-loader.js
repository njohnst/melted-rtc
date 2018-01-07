const Primus = require('primus')

module.exports = function (server, config, disableClientSave) {
  const primus = new Primus(server, config)
  if (!disableClientSave) primus.save(__dirname + '/primusClient.js')
  return primus
}

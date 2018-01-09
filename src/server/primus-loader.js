const Primus = require('primus')

module.exports = function (server, config, clientSaveDir) {
  const primus = new Primus(server, config)
  if (clientSaveDir) primus.save(clientSaveDir + '/primusClient.js')
  return primus
}

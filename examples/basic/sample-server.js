const server = require('../../src/server/server') //TODO npm module

const ip = '127.0.0.1'
const ports = {
  tcp: 8080,
  udp: 8080
}
const primusConfig = {
  transformer: 'uws'
}
const simplePeerConfig = {}

server.init(ip, ports, primusConfig, simplePeerConfig)

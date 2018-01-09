const server = require('../../src/server/server') //TODO npm module
const uws = require('uws')

const ip = '127.0.0.1'
const ports = {
  ws: 8080,
  rtc: 8080
}
const primusConfig = {
  transformer: 'uws'
}
const simplePeerConfig = {}

server.start(ip, ports, primusConfig, simplePeerConfig)

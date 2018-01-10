const Melted = require('../../src/server/server') //TODO npm module
const uws = require('uws')

const ip = '127.0.0.1'
const wsPort = 8080
const rtcPort = 8080

const primusConfig = {
  transformer: 'uws'
}
const simplePeerConfig = {}

const server = new Melted (ip, wsPort, rtcPort, primusConfig, simplePeerConfig)
server.start()

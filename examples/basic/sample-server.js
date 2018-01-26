const express = require('express') //TODO...
const app = express()
const httpServer = require('http').createServer(app)
const Melted = require('../../src/server/server') //TODO npm module
const uws = require('uws')

const ip = '127.0.0.1'
const wsPort = 8080
const rtcPort = 8080

const meltedConfig = {
  simplePeer: {
    config: {}
  },
  primus: {
    transformer: 'uws'
  },
  stun: {
    port: 8080
  }
}

const server = new Melted (httpServer, ip, wsPort, rtcPort, meltedConfig)
server.start()

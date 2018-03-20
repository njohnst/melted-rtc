const express = require('express') //TODO...
const app = express()
const httpServer = require('http').createServer(app)
const Melted = require('../../src/server/server') //TODO npm module
const uws = require('uws')

const ip = '127.0.0.1'
const wsPort = 8080

const meltedConfig = {
  simplePeer: {
    config: {
      portRange: {
        min: 8980,
        max: 8980
      }
    },
    channelConfig: {
      ordered: false,
      maxRetransmits: 0
    }
  },
  primus: {
    transformer: 'uws'
  }
}

const server = new Melted (httpServer, ip, wsPort, meltedConfig)
server.start()

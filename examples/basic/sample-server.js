const express = require('express') //TODO...
const app = express()
const httpServer = require('http').createServer(app)
const Melted = require('../../src/server/server') //TODO npm module
const uws = require('uws')

const meltedConfig = {
  wsPort: 8080,
  simplePeer: {
    config: {
      portRange: {
        min: 8980,
        max: 8980
      }
    }
  },
  primus: {
    transformer: 'uws'
  }
}

const server = new Melted (httpServer, meltedConfig)
server.start()

server.on('connect', function (client) {
  client.wsPing().then((rtt) => console.log("ws", rtt))
                 .catch((e) => console.log(`Error: ${e}`))
  client.ping().then((rtt) => console.log("rtc", rtt))
               .catch((e) => console.log(`Error: ${e}`))
})

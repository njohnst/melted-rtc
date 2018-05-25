const express = require('express') //TODO...
const app = express()
const httpServer = require('http').createServer(app)
const Melted = require('../../server')
const uws = require('uws')

const meltedConfig = require('./server-config.json')

const server = new Melted (httpServer, meltedConfig)
server.start()

server.on('connect', function (client) {
  client.wsPing().then((rtt) => console.log("ws", rtt))
                 .catch((e) => console.log(`Error: ${e}`))
  client.ping().then((rtt) => console.log("rtc", rtt))
               .catch((e) => console.log(`Error: ${e}`))
})

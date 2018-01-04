const express = require('express')
const app = express()
const server = require('http').createServer(app)
const Primus = require('primus')

const primus = new Primus(server, {
  transformer: 'uws'
})

//TODO move this to a new file that is included here and in build step
primus.save(__dirname + '/primusClient.js')

const SimplePeer = require('simple-peer')
const wrtc = require('wrtc')

const address = require('address.json')
const iceTransforms = require('ice-transforms')(address.ip, address.port)


//TODO
const rtcServerConfig = require('./config.json').rtc.server
rtcServerConfig.wrtc = wrtc
rtcServerConfig.sdpTransform = iceTransforms.sdp


//HACK - change to `module.exports`
const test = function (port) {

  server.listen(port)
  const rtcServer = new SimplePeer(rtcServerConfig)

  primus.on('connection', function (spark) {

    spark.on('data', function (data) {
      if (data.candidate || data.type === 'offer') {
        rtcServer.signal(data)
      }
    })

    rtcServer.on('signal', function (data) {
      if (data.type === 'answer') {
        data.sdp = iceTransforms.candidate(iceTransforms.sdp(data.sdp))
        console.log(data)
        spark.write(data)
      } else if (data.candidate) {
        data.candidate.candidate = iceTransforms.candidate(data.candidate.candidate)
        console.log(data)
        spark.write(data)
      } else {
        spark.write(data)
      }
    })

    rtcServer.on('connect', function () {
      rtcServer.write('Hello world!')
      console.log(rtcServer)
      //NOTE immutable buffer, see .write vs .send (for simple-peer)
    })

  })
}

test(8080)

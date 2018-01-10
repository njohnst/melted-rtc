const express = require('express')
const app = express()
const server = require('http').createServer(app)

const SimplePeer = require('simple-peer')
const wrtc = require('wrtc')

function Melted (ip, wsPort, rtcPort, primusConfig, simplePeerConfig) {
  this.ip = ip
  this.wsPort = wsPort
  this.rtcPort = rtcPort
  this.primusConfig = primusConfig
  this.simplePeerConfig = simplePeerConfig

  this.start = function () {
    const transformer = require('../ice-transformer')(this.ip, this.rtcPort)
    const primus = require('./primus-loader')(server, this.primusConfig)

    server.listen(this.wsPort)
    //NOTE Client is peer, they are initiator
    this.simplePeerConfig.initiator = false
    if (!this.simplePeerConfig.config) {
      this.simplePeerConfig.config = { iceServers: [] }
    }
    this.simplePeerConfig.wrtc = wrtc
    this.simplePeerConfig.sdpTransform = transformer.sdp
    const rtc = new SimplePeer(this.simplePeerConfig)

    primus.on('connection', function (spark) {

      spark.on('data', function (data) {
        if (data.candidate || data.type === 'offer') {
          rtc.signal(data)
        }
      })

      rtc.on('signal', function (data) {
        if (data.type === 'answer') {
          data.sdp = transformer.candidate(transformer.sdp(data.sdp))
          spark.write(data)
        } else if (data.candidate) {
          data.candidate.candidate = transformer.candidate(data.candidate.candidate)
          console.log(data)
          spark.write(data)
        } else {
          spark.write(data)
        }
      })

      rtc.on('connect', function () {
        rtc.write('Hello world!')
      })

    })
  }
}

module.exports = Melted

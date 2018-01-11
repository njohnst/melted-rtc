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
  const transformer = require('../ice-transformer')(this.ip, this.rtcPort)

  this.simplePeerConfig.initiator = false
  if (!this.simplePeerConfig.config) {
    //Sanity check - if no ICE servers are passed, pass an empty array
    this.simplePeerConfig.config = { iceServers: [] }
  }
  this.simplePeerConfig.wrtc = wrtc
  this.simplePeerConfig.sdpTransform = transformer.sdp

  this.start = function () {
    const primus = require('./primus-loader')(server, this.primusConfig)

    server.listen(this.wsPort)
    //NOTE Client is peer, they are initiator

//XXX
    primus.on('connection', this.peerConnect, this)

  }

  this.peerConnect = function (spark) {
    //TODO
    const rtc = new SimplePeer(this.simplePeerConfig)

    spark.on('data', function (data) {
      if (data.type === 'offer' || data.candidate) {
        rtc.signal(data)
        console.log(data)
      }
    })

    rtc.on('signal', function (data) {
      if (data.type === 'answer') {
        data.sdp = transformer.candidate(transformer.sdp(data.sdp))
        spark.write(data)
      } else if (data.candidate) {
        data.candidate.candidate = transformer.candidate(data.candidate.candidate)
        //console.log(data)
        spark.write(data)
      } else {
        spark.write(data)
      }
    })
  }
}

module.exports = Melted

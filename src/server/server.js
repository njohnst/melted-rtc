module.exports = (function () {
  const express = require('express')
  const app = express()
  const server = require('http').createServer(app)

  const SimplePeer = require('simple-peer')
  const wrtc = require('wrtc')

  const Transformer = require('../ice-transformer')

  return function (ip, wsPort, rtcPort, primusConfig, simplePeerConfig) {
    if (!ip || !wsPort || !rtcPort) {
      throw new Error('Invalid arguments: IP, WS and RTC ports must be provided')
    }
    this.ip = ip
    this.wsPort = wsPort
    this.rtcPort = rtcPort
    this.primusConfig = primusConfig || {}
    this.simplePeerConfig = simplePeerConfig || {}
    transformer = new Transformer(this.ip, this.rtcPort)

    this.simplePeerConfig.initiator = false
    if (!this.simplePeerConfig.config) {
      //Sanity check - if no config is passed, pass an empty array for iceServers
      this.simplePeerConfig.config = { iceServers: [] }
    }
    this.simplePeerConfig.wrtc = wrtc
    if (typeof this.simplePeerConfig.trickle === 'undefined') {
      //Unless otherwise specified, disable trickle
      this.simplePeerConfig.trickle = false
    }
    this.simplePeerConfig.sdpTransform = transformer._sdp

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
          console.log('rem')
          console.log(data)
          rtc.signal(data)
        }
      })

      rtc.on('signal', function (data) {
        if (data.type === 'answer') {
          console.log('locBefore')
          console.log(data)
          data = transformer.answer(data)
          console.log('locAfter')
          console.log(data)
          spark.write(data)
        } else if (data.candidate) {
          console.log('locBefore')
          console.log(data)
          data = transformer.candidate(data)
          console.log('locAfter')
          console.log(data)
          spark.write(data)
        } else {
          spark.write(data)
        }
      })
    }
  }
})()

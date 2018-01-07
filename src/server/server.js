const express = require('express')
const app = express()
const server = require('http').createServer(app)

const SimplePeer = require('simple-peer')
const wrtc = require('wrtc')

module.exports = function (ip, ports, primusConfig, simplePeerConfig) {
  const transformer = require('./ice-transformer')(ip, ports.udp)
  const primus = require('./primus-loader')(server, primusConfig)

  server.listen(ports.tcp)
  simplePeerConfig.wrtc = wrtc
  simplePeerConfig.sdpTransform = transformer.sdp
  const rtc = new SimplePeer(simplePeerConfig)

  primus.on('connection', function (spark) {

    spark.on('data', function (data) {
      if (data.candidate || data.type === 'offer') {
        rtc.signal(data)
      }
    })

    rtc.on('signal', function (data) {
      if (data.type === 'answer') {
        data.sdp = transformer.candidate(transformer.sdp(data.sdp))
        console.log(data)
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
      console.log(rtc)
    })

  })
}

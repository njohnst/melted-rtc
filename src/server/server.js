module.exports = (function () {
  const SimplePeer = require('simple-peer')
  const wrtc = require('wrtc')

  return function (httpServer, hostName, wsPort, rtcPort, config) {
    if (!httpServer || !hostName || !wsPort || !rtcPort) {
      throw new Error(
        'Invalid arguments: HTTP server, IP, WS and RTC ports must be provided'
      )
    }
    this.hostName = hostName
    this.wsPort = wsPort
    this.rtcPort = rtcPort
    this.primusConfig = config && config.primus ? config.primus : {}
    this.simplePeerConfig = config && config.simplePeer ? config.simplePeer : {}

    this.simplePeerConfig.initiator = false
    if (!this.simplePeerConfig.config) {
      //Sanity check - if no config is passed, pass an empty array of iceServers
      this.simplePeerConfig.config = { iceServers: [] }
    }
    this.simplePeerConfig.wrtc = wrtc

    //TODO array for now...
    this.peers = []

    this.start = function () {
      this.primus = require('./primus-loader')(httpServer, this.primusConfig)

      httpServer.listen(this.wsPort)

      //XXX
      this.primus.on('connection', this.peerConnect, this)
    }

    this.peerConnect = function (spark) {
      const peer = new SimplePeer(this.simplePeerConfig)

      //TODO
      this.peers.push(peer)

      spark.on('data', function (data) {
        if (data.sdp || data.candidate) {
          peer.signal(data)
        }
      })

      peer.on('signal', function (data) {
        spark.write(data)
      })
    }

    /**
    @function rtcBroadcast send message to all peers
    @arg msg message
    */
    this.rtcBroadcast = function (msg) {
      //TODO
      this.peers.forEach(peer => peer.send(msg))
    }
  }
})()

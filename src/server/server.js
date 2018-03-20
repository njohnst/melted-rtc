/**
 * @function rtcBroadcast send message to all peers
 * @arg msg message
 */
const rtcBroadcast = function (msg) {
  //TODO
  this.peers.forEach(peer => peer.send(msg))
}

/**
 * @function measureRTT
 * @arg peer
 * @arg timeout optional, amount of milliseconds before timeout
 */
const measureRTT = function (peer, timeout = 1000) {
  return new Promise(function (resolve, reject) {
    const start = Date.now()

    peer.send('ping')
    //TODO! use event emitter system
    peer.on('data', function (data) {
      if (data.toString() === 'pong') {
        resolve(Date.now() - start)
      }
    })

    setTimeout(() => reject(`No response from peer for ${timeout}ms`), timeout)
  })
}

module.exports = (function () {
  const SimplePeer = require('simple-peer')
  const wrtc = require('wrtc')

  return function (httpServer, hostName, wsPort, config) {
    if (!httpServer || !hostName || !wsPort) {
      throw new Error(
        'Invalid arguments: HTTP server, IP, and WS ports must be provided'
      )
    }
    this.hostName = hostName
    this.wsPort = wsPort
    this.primusConfig = config && config.primus ? config.primus : {}
    this.simplePeerConfig = config && config.simplePeer ? config.simplePeer : {}

    this.simplePeerConfig.initiator = false
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

      //TODO
      peer.on('connect', function () {
        peer.send('hello world')

        measureRTT(peer).then(n => console.log(`RTT: ${n}`))
                             .catch(e => console.log(e))
      })
    }
  }
})()

module.exports = (function () {
  const SimplePeer = require('simple-peer')
  const wrtc = require('wrtc')
  const msgpack = require('msgpack-lite')
  const EventEmitter = require('eventemitter3')

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
  const measureRTT = function (client, timeout = 1000) {
    return new Promise(function (resolve, reject) {
      const start = Date.now()

      client.send('ping')
      client.on('pong', () => {
          resolve(Date.now() - start)
      })

      setTimeout(() => reject(`No response from client for ${timeout}ms`), timeout)
    })
  }

  /**
   * @constructor
   * @arg peer simple peer object
   * @arg spark primus connection object
   */
  const RemoteClient = function (peer, spark) {
    Object.assign(this, EventEmitter.prototype)
    EventEmitter.call(this)

    this._peer = peer
    this._spark = spark

    this.send = (type, msg) => {
      this._peer.send(msgpack.encode({ [type] : msg }))
    }

    this._peer.on('data', (data) => {
      const msg = msgpack.decode(data)
      const key = Object.keys(msg)[0]
      this.emit(key, msg[key])
    })
  }

  return function (httpServer, hostName, wsPort, config) {
    if (!httpServer || !hostName || !wsPort) {
      throw new Error(
        'Invalid arguments: HTTP server, IP, and WS ports must be provided'
      )
    }
    Object.assign(this, EventEmitter.prototype)
    EventEmitter.call(this)

    this.hostName = hostName
    this.wsPort = wsPort
    this.primusConfig = config && config.primus ? config.primus : {}
    this.simplePeerConfig = config && config.simplePeer ? config.simplePeer : {}

    this.simplePeerConfig.initiator = false
    this.simplePeerConfig.wrtc = wrtc

    this.clients = []

    this.start = function () {
      this.primus = require('./primus-loader')(httpServer, this.primusConfig)

      httpServer.listen(this.wsPort)

      this.primus.on('connection', this.peerConnect, this)
    }

    this.peerConnect = function (spark) {
      const peer = new SimplePeer(this.simplePeerConfig)
      const client = new RemoteClient(peer, spark)

      this.clients.push(client)

      spark.on('data', (data) => {
        if (data.sdp || data.candidate) {
          peer.signal(data)
        }
      })

      peer.on('signal', (data) => {
        spark.write(data)
      })

      peer.on('connect', () => {
        this.emit('connect', client)
        // TODO: Testing RTT
        measureRTT(client)
        .then((rtt) => console.log(rtt))
        .catch((e) => { throw e })
      })
    }
  }
})()

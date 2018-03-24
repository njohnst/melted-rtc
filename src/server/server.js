module.exports = (function () {
  const SimplePeer = require('simple-peer')
  const wrtc = require('wrtc')
  const msgpack = require('msgpack-lite')
  const EventEmitter = require('eventemitter3')
  const World = require('../synchronization')

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

    this.wsSend = (type, msg) => {
      this._spark.send({ [type] : msg})
    }

    this._spark.on('data', (data) => {
      const key = Object.keys(data)[0]
      this.emit(key, data[key])
    })

    this._peer.on('data', (data) => {
      const msg = msgpack.decode(data)
      const key = Object.keys(msg)[0]
      this.emit(key, msg[key])
    })
  }

  return function (httpServer, config) {
    if (!httpServer) {
      throw new Error(
        'Invalid arguments: httpServer must be provided'
      )
    }
    Object.assign(this, EventEmitter.prototype)
    EventEmitter.call(this)

    this._primusConfig = config && config.primus ? config.primus : {}
    this._simplePeerConfig = config && config.simplePeer ? config.simplePeer : {}

    this._simplePeerConfig.initiator = false
    this._simplePeerConfig.wrtc = wrtc

    this._clients = []

    this.start = function (options) {
      //TODO
      this._world = new World(
        options && options.interval || 50,
        options && options.nSnaps || 10,
        options && options.tickMax || 65535
      )

      this._primus = require('./primus-loader')(httpServer, this._primusConfig)

      httpServer.listen(config && config.wsPort ? config.wsPort : 8080)

      this._primus.on('connection', this._peerConnect, this)
    }

    this.stop = function () {
      //TODO
      this._clients.forEach(c => c.destroy())
      httpServer.close()
      console.log('Server shutting down')
    }

    this._peerConnect = function (spark) {
      const peer = new SimplePeer(this._simplePeerConfig)
      const client = new RemoteClient(peer, spark)

      this._clients.push(client)

      spark.on('data', (data) => {
        if (data.sdp || data.candidate) {
          peer.signal(data)
        } else {
          this.emit()
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

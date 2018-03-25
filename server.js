module.exports = (function () {
  const Primus = require('primus')
  const SimplePeer = require('simple-peer')
  const wrtc = require('wrtc')
  const msgpack = require('msgpack-lite')
  const EventEmitter = require('eventemitter3')
  const World = require('./synchronization')

  /**
   * @function measureRTT
   * @arg {object} peer
   * @arg {number} timeout optional, amount of milliseconds before timeout
   */
  const measureRTT = function (client, timeout = 1000, useWS = false) {
    return new Promise(function (resolve, reject) {
      const start = Date.now()

      if (useWS) {
        client.wsSend('wsPing')
        client.on('wsPong', () => {
            resolve(Date.now() - start)
        })
      } else {
        client.send('ping')
        client.on('pong', () => {
            resolve(Date.now() - start)
        })
      }

      setTimeout(() => reject(`No response from client for ${timeout}ms`), timeout)
    })
  }

  /**
   * @constructor
   * @arg {object} peer simple peer object
   * @arg {object} spark primus connection object
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
      this._spark.write({ [type] : msg})
    }

    this.ping = (timeout) => {
      return measureRTT(this, timeout)
    }

    this.wsPing = (timeout) => {
      return measureRTT(this, timeout, true)
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

  return function MeltedServer (httpServer, config) {
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
    const self = this

    RemoteClient.prototype.broadcast = function (type, msg) {
      self._clients.forEach(client => {
        if (!client == this) client.send(type, msg)
      })
    }

    this.start = function (options) {
      //TODO
      this._world = new World(
        options && options.interval || 50,
        options && options.nSnaps || 10,
        options && options.tickMax || 65535
      )

      this._primus = new Primus(httpServer, this._primusConfig)

      httpServer.listen(config && config.wsPort ? config.wsPort : 8080)

      this._primus.on('connection', this._peerConnect, this)
    }

    this.stop = function () {
      //TODO
      this._clients.forEach(c => c.destroy())
      httpServer.close()
      this._primus.destroy()
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
          const key = Object.keys(data)[0]
          this.emit(key, data[key])
        }
      })

      peer.on('signal', (data) => {
        spark.write(data)
      })

      peer.on('connect', () => {
        this.emit('connect', client)
      })
    }
  }
})()

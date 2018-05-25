module.exports = (function () {
  const Primus = require('primus')
  const SimplePeer = require('simple-peer')
  const wrtc = require('wrtc')
  const msgpack = require('msgpack-lite')
  const EventEmitter = require('eventemitter3')

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

  /**
   * @constructor
   * @arg {number} maxClients maximum concurrent clients
   */
  const Clients = function (maxClients) {
    const self = this

    this._emptySlots = Array(maxClients).fill().map((x, i) => i)
    this._clients = new Map()

    this.forEach = this._clients.forEach
    this.get = this._clients.get
    this.has = this._clients.has

    this.addClient = function (client) {
      if (!self._emptySlots.length) return -1

      const slot = self._emptySlots.shift()

      self._clients.set(slot, client)
      return slot
    }

    this.removeClient = function (slot) {
      if (self._clients.has(slot)) {
        self._clients.delete(slot)
        self._emptySlots.push(slot)
      }
    }

    this.isFull = function () {
      return !this._emptySlots.length
    }
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

    this.clients = new Clients(config && config.maxClients || 1)
    const self = this

    RemoteClient.prototype.broadcast = function (type, msg) {
      self.clients.forEach(client => {
        if (client !== this) client.send(type, msg)
      })
    }

    RemoteClient.prototype.wsBroadcast = function (type, msg) {
      self.clients.forEach(client => {
        if (client !== this) client.wsSend(type, msg)
      })
    }

    this.start = function () {
      this._primus = new Primus(httpServer, this._primusConfig)

      httpServer.listen(config && config.wsPort ? config.wsPort : 8080)

      this._primus.on('connection', this._peerConnect, this)
    }

    this.stop = function () {
      //TODO
      this.clients.forEach(c => c.destroy())
      httpServer.close()
      this._primus.destroy()
      console.log('Server shutting down')
    }

    this.broadcast = function (type, msg) {
      this.clients.forEach((client, uid) => {
        client.send(type, msg)
      })
    }

    this.wsBroadcast = function (type, msg) {
      this.clients.forEach((client, uid) => {
        client.wsSend(type, msg)
      })
    }

    this._peerConnect = function (spark) {
      if (this.clients.isFull()) {
        spark.destroy()
        return; //Server full
      }

      const peer = new SimplePeer(this._simplePeerConfig)
      const client = new RemoteClient(peer, spark)
      const slot = this.clients.addClient(client)

      spark.on('data', (data) => {
        if (data.sdp || data.candidate) {
          peer.signal(data)
        } else {
          const key = Object.keys(data)[0]
          this.emit(key, data[key])
        }
      })

      spark.on('error', (e) => {
        this.clients.removeClient(slot)
        console.log(e)
        this.emit('disconnect', client)
      })

      spark.on('end', () => {
        this.clients.removeClient(slot)
        this.emit('disconnect', client)
      })

      peer.on('signal', (data) => {
        spark.write(data)
      })

      peer.on('connect', () => {
        this.emit('connect', client)
      })

      peer.on('error', (e) => {
        this.clients.removeClient(slot)
        console.log(e)
        this.emit('disconnect', client)
      })

      peer.on('close', () => {
        this.clients.removeClient(slot)
        this.emit('disconnect', client)
      })
    }
  }
})()

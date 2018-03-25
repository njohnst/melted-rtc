/**
 * Melted RTC client module
 * @module melted-client
 */
module.exports = (function () {
  const SimplePeer = require('simple-peer')
  const msgpack = require('msgpack-lite')
  const EventEmitter = require('eventemitter3')

  /**
   * Creates a melted client
   * @constructor
   * @param {object} Primus the generated Primus client library
   * @param {string} url Server URL
   * @param {object} config Optional keys primus, simplePeer with config objects
   * @return {object} The instantiated Melted client
   */
  return function MeltedClient (Primus, url, config) {
    if (url.match(/[\w]+:\/\/.+:\d{1,5}/)) {
      this.url = url
    } else {
      throw new Error(`URL ${url} doesn't follow pattern PROTOCOL://HOST:PORT`)
    }
    Object.assign(this, EventEmitter.prototype)
    EventEmitter.call(this)

    this._simplePeerConfig = config && config.simplePeer || {}
    this._simplePeerConfig.initiator = true
    if (!this._simplePeerConfig.config) {
      this._simplePeerConfig.config = { iceServers: [] }
    }
    this._simplePeerConfig.channelConfig = {
        ordered: false,
        maxRetransmits: 0
    }

    this._primus = new Primus(url, config && config.primus || {})

    this.send = (type, msg) => {
      this._peer.send(msgpack.encode({ [type] : msg }))
    }

    this.wsSend = (type, msg) => {
      this._primus.write({ [type] : msg })
    }

    this.disconnect = () => {
      this._peer.destroy()
      this._primus.destroy()
    }

    if (SimplePeer.WEBRTC_SUPPORT || this._simplePeerConfig.wrtc) {
      this._peer = new SimplePeer(this._simplePeerConfig)

      this._peer.on('signal', (data) => {
        this._primus.write(data)
      })

      this._primus.on('data', (data) => {
        if (data.sdp || data.candidate) {
          this._peer.signal(data)
        } else {
          const key = Object.keys(data)[0]
          this.emit(key, data[key])
        }
      })

      this._peer.on('connect', () => {
        this.emit('connect')
      })

      this._peer.on('data', (data) => {
        const msg = msgpack.decode(data)
        const key = Object.keys(msg)[0]
        this.emit(key, msg[key])
      })

      this.on('ping', () => this.send('pong'))
      this.on('wsPing', () => this.wsSend('wsPong'))
    } else {
      throw new Error(`SimplePeer.WEBRTC_SUPPORT evaluated to false`)
    }
  }
})()

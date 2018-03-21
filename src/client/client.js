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
   * @param {Primus.Client} Primus  Primus client library
   * @param {string} url Server URL
   * @param {object} primusConfig Optional Primus configuration
   * @param {object} simplePeerConfig Optional simple-peer configuration
   * @return {MeltedClient} The instantiated Melted client
   */
  return function MeltedClient (Primus, url, primusConfig, simplePeerConfig) {
    if (url.match(/[\w]+:\/\/.+:\d{1,5}/)) {
      this.url = url
    } else {
      throw new Error(`URL ${url} doesn't follow pattern PROTOCOL://HOST:PORT`)
    }
    Object.assign(this, EventEmitter.prototype)
    EventEmitter.call(this)

    this.primusConfig = primusConfig
    simplePeerConfig.initiator = true //NOTE Server is peer, we initiate
    if (!simplePeerConfig.config) {
      simplePeerConfig.config = { iceServers: [] }
    }
    if (!simplePeerConfig.channelConfig) {
      simplePeerConfig.channelConfig = {
        ordered: false,
        maxRetransmits: 0
      }
    }
    this.simplePeerConfig = simplePeerConfig
    this._primus = new Primus(url, primusConfig)

    this.send = (type, msg) => {
      this._peer.send(msgpack.encode({ [type] : msg }))
    }

    if (SimplePeer.WEBRTC_SUPPORT) {
      this._peer = new SimplePeer(this.simplePeerConfig)

      this._peer.on('signal', (data) => {
        this._primus.write(data)
      })

      this._primus.on('data', (data) => {
        if (data.sdp || data.candidate) {
          this._peer.signal(data)
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

      // TODO: Testing RTT
      this.on('ping', () => this.send('pong'))
    } else {
      throw new Error(`SimplePeer.WEBRTC_SUPPORT evaluated to false`)
    }
  }
})()

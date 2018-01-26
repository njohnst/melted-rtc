/**
 * Melted RTC client module
 * @module melted-client
 */
module.exports = (function () {
  const SimplePeer = require('simple-peer')

  function sendSignal (data) {
    this.primus.write(data)
  }

  function setSignal (data) {
    if (data.sdp || data.candidate) {
      this.rtc.signal(data)
    }
  }

  function addPrimusSignaling (client) {
    client.primus.on('data', setSignal, client)
  }

  function removePrimusSignaling () {
    this.primus.removeListener('data')
  }

  /**
   * Creates a melted client
   * @constructor
   * @param {Primus.Client} Primus  Primus client library
   * @param {string} url Server URL
   * @param {object} primusConfig Optional Primus configuration
   * @param {object} simplePeerConfig Optional simple-peer configuration
   * @return {MeltedClient} The instantiated Melted client
   */
  return function (Primus, url, primusConfig, simplePeerConfig) {
    if (url.match(/[\w]+:\/\/.+:\d{1,5}/)) {
      this.url = url
    } else {
      throw new Error(`URL ${url} doesn't follow pattern PROTOCOL://HOST:PORT`)
    }

    this.primusConfig = primusConfig
    simplePeerConfig.initiator = true //NOTE Server is peer, we initiate
    if (!simplePeerConfig.config) {
      simplePeerConfig.config = {
        iceServers: [{
          url: 'stun:127.0.0.1:8080'
        }]
      }
    }
    this.simplePeerConfig = simplePeerConfig

    this.establishDataChannel = function () {
      if (SimplePeer.WEBRTC_SUPPORT) {
        this.rtc = new SimplePeer(this.simplePeerConfig)
        this.rtc.on('signal', sendSignal.bind(this))

        //Add listeners for RTC signaling, and remove them once connected
        addPrimusSignaling(this)
        this.rtc.on('connect', removePrimusSignaling.bind(this))
      } else {
        throw new Error(`SimplePeer.WEBRTC_SUPPORT evaluated to false`)
      }
    }

    this.primus = new Primus(url, primusConfig)
  }
})()

const SimplePeer = require('simple-peer')
const Primus = require('./primusClient.js')

function sendSignal (data) {
  this.primus.write(data)
}

function setSignal (data) {
  if (data.type === 'answer' || data.candidate) {
    this.rtc.signal(data)
  }
}

function addPrimusSignaling (client) {
  client.primus.on('data', setSignal, client)
}

function removePrimusSignaling () {
  this.primus.removeListener('data')
}

function MeltedClient (url, primusConfig, simplePeerConfig) {
  if (url.match(/[\w]+:\/\/.+:\d{1,5}/)) this.url = url
  else throw new Error(`URL ${url} doesn't follow pattern PROTOCOL://HOST:PORT`)

  this.primusConfig = primusConfig
    simplePeerConfig.initiator = true //NOTE Server is peer, we initiate
    if (!simplePeerConfig.config) {
      simplePeerConfig.config = { iceServers: [] }
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

module.exports = MeltedClient

const SimplePeer = require('simple-peer')
const Primus = require('./primusClient.js')

module.exports = function MeltedClient (url, primusConfig, simplePeerConfig) {
    this.establishDataChannel = function () {
      if (SimplePeer.WEBRTC_SUPPORT) {
        simplePeerConfig.initiator = true //NOTE Server is peer, we initiate
        if(!simplePeerConfig.config) simplePeerConfig.config = { iceServers: [] }
        this.rtc = new SimplePeer(simplePeerConfig)

        this.rtc.on('signal', (data) => {
          //FIXME - how to determine what the message is on server-side?
          this.ws.write(data)
        })

        this.ws.on('data', (data) => {
          //TODO
          if (data.type === 'answer' || data.candidate) {
            this.rtc.signal(data)
          }
        })

        this.rtc.on('data', (data) => {
          console.log(`rtc: ${data}`)
        })
      }

      //If the client does not support WebRTC, fallback to WebSocket
      this.dataChannel = this.rtc || this.ws
    }

    this.ws = new Primus(url, primusConfig)
}

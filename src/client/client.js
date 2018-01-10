const SimplePeer = require('simple-peer')
const Primus = require('./primusClient.js')

function MeltedClient (url, primusConfig, simplePeerConfig) {
    this.establishDataChannel = function () {
      if (SimplePeer.WEBRTC_SUPPORT) {
        simplePeerConfig.initiator = true //NOTE Server is peer, we initiate
        if (!simplePeerConfig.config) {
          simplePeerConfig.config = { iceServers: [] }
        }
        const rtc = new SimplePeer(simplePeerConfig)

        rtc.on('signal', (data) => {
          //FIXME - how to determine what the message is on server-side?
          this.primus.write(data)
        })

        this.primus.on('data', (data) => {
          //TODO
          if (data.type === 'answer' || data.candidate) {
            rtc.signal(data)
          }
        })

        rtc.on('connect', () => {
          console.log(`RTC connected`)
          this.primus.removeListener('data')
        })

        this.rtc = rtc
      }
    }

    this.primus = new Primus(url, primusConfig)
}

module.exports = MeltedClient

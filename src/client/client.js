const SimplePeer = require('simple-peer')
const Primus = require('./primusClient.js')

module.exports = {
  connect: function (host, primusConfig, simplePeerConfig) {
    const primus = new Primus(host, primusConfig)

    primus.on('open', function (e) {
      //TODO session establishment

      if (SimplePeer.WEBRTC_SUPPORT) {
        //NOTE client creates offer
        const rtc = new SimplePeer(simplePeerConfig)

        rtc.on('signal', function (data) {
          //FIXME - how to determine what the message is on server-side?
          primus.write(data)
        })

        primus.on('data', function (data) {
          //TODO
          if (data.type === 'answer' || data.candidate) {
            //console.log(data)
            rtc.signal(data)
          }
        })

        rtc.on('data', function (data) {
          console.log(`rtc: ${data}`)
          console.log(rtc)
        })
      } else {
        //TODO use ws instead
      }
    })
  }
}

const SimplePeer = require('simple-peer')

const Primus = require('./primusClient.js')

const address = require('address.json')
const iceTransforms = require('ice-transforms')(address.ip, address.port)

//TODO
const rtcClientConfig = require('./config.json').rtc.client
rtcClientConfig.initiator = true
rtcClientConfig.sdpTransform = iceTransforms.sdp

//HACK change to `module.exports`
window.melted = function connect (host) {
  const primus = new Primus(host)

  primus.on('open', function (e) {
    //TODO session establishment

    if (SimplePeer.WEBRTC_SUPPORT) {
      //NOTE client creates offer
      const rtcClient = new SimplePeer(rtcClientConfig)

      rtcClient.on('signal', function (data) {
        //FIXME - how to determine what the message is on server-side?
        primus.write(data)
        // if (data.type === 'offer') {
        //   data.sdp = iceTransforms.candidate(iceTransforms.sdp(data.sdp))
        //   console.log(data)
        //   primus.write(data)
        // } else if (data.candidate) {
        //   data.candidate.candidate = iceTransforms.candidate(data.candidate.candidate)
        //   primus.write(data)
        // } else {
        //   primus.write(data)
        // }
      })

      primus.on('data', function (data) {
        //TODO
        if (data.type === 'answer' || data.candidate) {
          //console.log(data)
          rtcClient.signal(data)
        }
      })

      rtcClient.on('data', function (data) {
        console.log(`rtc: ${data}`)
        console.log(rtcClient)
      })
    } else {
      //TODO use ws instead
    }
  })
}

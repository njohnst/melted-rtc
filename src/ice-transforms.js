module.exports = function (ip, port) {
  return {
    sdp: function (sdp) {
      return sdp.replace(/o=(.*)IN.*/, `o=$1IN IP4 ${ip}`)
                .replace(/c=.*/, `c=IN IP4 ${ip}`)
                .replace(/m=.*/, `m=application 9 DTLS/SCTP ${port}`)
                .replace(/a=sctpmap.*/, `a=sctpmap:${port} webrtc-datachannel 1024`)
    },

    candidate: function (o) {
      return o.replace(
        /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) (\d{1,5})/,
        `${ip} ${port}`
      )
    },

    offer: function (offer) {
      return offer
    },

    answer: function (answer) {
      return answer
    }
  }
}

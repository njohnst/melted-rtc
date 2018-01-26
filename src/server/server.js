module.exports = (function () {
  const SimplePeer = require('simple-peer')
  const wrtc = require('wrtc')
  const stun = require('stun')
  const dgram = require('dgram')

  const Transformer = require('../ice-transformer')

  return function (httpServer, hostName, wsPort, rtcPort, config) {
    if (!httpServer || !hostName || !wsPort || !rtcPort) {
      throw new Error(
        'Invalid arguments: HTTP server, IP, WS and RTC ports must be provided'
      )
    }
    this.hostName = hostName
    this.wsPort = wsPort
    this.rtcPort = rtcPort
    this.primusConfig = config && config.primus ? config.primus : {}
    this.simplePeerConfig = config && config.simplePeer ? config.simplePeer : {}

    //Set up STUN if provided in config
    if (config && config.stun && config.stun.port) {
      const stunSocket = dgram.createSocket('udp4')
      this.stun = stun.createServer(
        stunSocket.bind(config.stun.port)
      )
      const { STUN_BINDING_RESPONSE, STUN_ATTR_XOR_MAPPED_ADDRESS, STUN_ATTR_SOFTWARE } = stun.constants
      const ua = `node/${process.version} stun/v1.0.0`

      this.stun.on('bindingRequest', (req, rinfo) => {
        if (req.getAttribute(stun.constants.STUN_ATTR_USERNAME)) return
        const msg = stun.createMessage(stun.constants.STUN_BINDING_RESPONSE)
        msg.addAttribute(
          STUN_ATTR_XOR_MAPPED_ADDRESS,
          rinfo.address,
          rinfo.port
        )
          msg.addAttribute(STUN_ATTR_SOFTWARE, ua)
          //console.log(req._transactionId)
        msg.setTransactionID(req._transactionId)
        this.stun.send(msg, rinfo.port, rinfo.address)
        //console.log(Object.keys(req))
      })
    }

    transformer = new Transformer(this.hostName, this.rtcPort)

    this.simplePeerConfig.initiator = false
    if (!this.simplePeerConfig.config) {
      //Sanity check - if no config is passed, pass an empty array of iceServers
      this.simplePeerConfig.config = { iceServers: [] }
    }
    this.simplePeerConfig.wrtc = wrtc
    this.simplePeerConfig.sdpTransform = transformer._sdp

    this.start = function () {
      const primus = require('./primus-loader')(httpServer, this.primusConfig)

      httpServer.listen(this.wsPort)

      //XXX
      primus.on('connection', this.peerConnect, this)
    }

    this.peerConnect = function (spark) {
      //TODO
      const rtc = new SimplePeer(this.simplePeerConfig)

      spark.on('data', function (data) {
        if (data.sdp || data.candidate) {
          rtc.signal(data)
        }
      })

      rtc.on('signal', function (data) {
        // if (data.candidate) {
        //   data = transformer.candidate(data)
        // }
        console.log(data)
        spark.write(data)
      })
    }
  }
})()

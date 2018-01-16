const Transformer = require('../src/ice-transformer')

test('candidate transform', () => {
  const ip = '127.0.0.1'
  const port = '8080'

  const candidate = {
    candidate: {
      candidate: 'candidate:1234567890 1 udp 0987654321 192.168.0.1 58585 typ host generation 0 ufrag X9X9 network-id 2 network-cost 50',
      sdpMLineIndex: 0,
      sdpMid: 'data'
    }
  }

  const candidateTransformed = {
    candidate: {
      candidate: `candidate:1234567890 1 udp 0987654321 ${ip} ${port} typ host generation 0 ufrag X9X9 network-id 2 network-cost 50`,
      sdpMLineIndex: 0,
      sdpMid: 'data'
    }
  }

  const transformer = new Transformer(ip, port)

  expect(transformer.candidate(candidate)).toEqual(candidateTransformed)
})

test('answer transform', () => {
  const ip = '127.0.0.1'
  const port = '8080'

  const answer = {
    type: 'answer',
    sdp: 'v=0\r\no=- 1234567891234567890 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE data\r\na=msid-semantic: WMS\r\nm=application 9 DTLS/SCTP 5000\r\nc=IN IP4 0.0.0.0\r\nb=AS:30\r\na=ice-ufrag:X9X9\r\na=ice-pwd:1a23b321+q2Q3QWE51234qW2\r\na=fingerprint:sha-256 1A:2B:3C:4D:5E:6F:11:22:33:44:55:66:AA:BB:CC:DD:EE:FF:A1:B2:C3:D4:E5:F6:9F:8E:7D:6C:5B:4A:00:FF\r\na=setup:active\r\na=mid:data\r\na=sctpmap:5000 webrtc-datachannel 1024\r\n'
  }
  const answerTransformed = {
    type: 'answer',
    sdp: `v=0\r\no=- 1234567891234567890 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE data\r\na=msid-semantic: WMS\r\nm=application 9 DTLS/SCTP ${port}\r\nc=IN IP4 0.0.0.0\r\nb=AS:30\r\na=ice-ufrag:X9X9\r\na=ice-pwd:1a23b321+q2Q3QWE51234qW2\r\na=fingerprint:sha-256 1A:2B:3C:4D:5E:6F:11:22:33:44:55:66:AA:BB:CC:DD:EE:FF:A1:B2:C3:D4:E5:F6:9F:8E:7D:6C:5B:4A:00:FF\r\na=setup:active\r\na=mid:data\r\na=sctpmap:${port} webrtc-datachannel 1024\r\n`
  }

  const transformer = new Transformer(ip, port)

  expect(transformer.answer(answer)).toEqual(answerTransformed)
})

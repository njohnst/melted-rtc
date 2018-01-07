const Transformer = require('./src/ice-transformer')

test('sdp transform', () => {
  const ip = '1.1.1.1' //TODO load all of this from JSON?
  const port = '9999'

  const sdp = ''
  const sdpTransformed = ''

  const transformer = new Transformer(ip, port)

  expect(transformer.sdp(sdp)).toMatch(sdpTransformed)
})

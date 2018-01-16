const Server = require('../src/server/server')
const Client = require('../src/client/client')

/*
  N.B. This test suite only covers the localhost scenario,
  end-to-end testing in a real network must be performed manually
*/

test('invalid server', () => {
    expect(Server).toThrow()
})

test('start server', () => {
    const ip = '127.0.0.1'
    const wsPort = 8080
    const rtcPort = 8080
    expect(new Server(ip, wsPort, rtcPort)).not.toBe(false)
})

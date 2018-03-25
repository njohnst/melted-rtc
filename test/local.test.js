require('jest')
const Server = require('../src/server/server')
const Client = require('../src/client/client')
const Primus = require('../src/client/primusClient')

/*
  N.B. This test suite only covers the localhost scenario,
  end-to-end testing in a real network must be performed manually
*/

test('invalid server', () => {
    expect(() => new Server()).toThrow()
})

test('invalid client', () => {
    expect(() => {
      const client = new Client(Primus, 'FALSE')
    }).toThrow()
})

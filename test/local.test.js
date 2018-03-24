require('jest')
const Server = require('../src/server/server')
const Client = require('../src/client/client')

/*
  N.B. This test suite only covers the localhost scenario,
  end-to-end testing in a real network must be performed manually
*/

test('invalid server', () => {
    expect(() => new Server()).toThrow()
})

test('start server', () => {
    const express = require('express') //TODO...
    const app = express()
    const httpServer = require('http').createServer(app)

    const config = {
      wsPort: 8080,
      simplePeerConfig: {
        config: {
          portRange: {
            min: 9000,
            max: 9100
          }
        }
      }
    }
    expect(() => {
      const server = new Server(httpServer, config)
      server.start()
      server.stop()
    }).not.toThrow()
})

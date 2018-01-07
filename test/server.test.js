const Server = require('../src/server')
const Client = require('../src/client')

//Unit tests
test('starts server', () => {
    expect(new Server()).not.toBe(false)
})

//End-to-end tests

const client = require('client/client') //TODO npm package

//NOTE Replace with external IP and forwarded UDP port of server
const host = 'localhost:8080'
const primusConfig = {}
const simplePeerConfig = {}

client.connect(host, primusConfig, simplePeerConfig)

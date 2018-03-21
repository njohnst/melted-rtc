const PrimusClient = require('client/primusClient')
const MeltedClient = require('client/client') //TODO npm package

//NOTE Replace with external IP and forwarded UDP port of server
const url = 'ws://127.0.0.1:8080'
const primusConfig = {}
const simplePeerConfig = {}

//NOTE set as global so we can easily experiment in developer tools
global.client = new MeltedClient(
  PrimusClient,
  url,
  primusConfig,
  simplePeerConfig
)

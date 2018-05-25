# melted-rtc
UDP/TCP game server for Node.js.


## Details

melted-rtc is a facade for WebSockets and WebRTC that utilizes non-standard RTCConfiguration options to specify a fixed range of ports for inbound UDP connections.


# API

## Server

```javascript
var MeltedServer = require('melted-rtc')
```

### `melted = new MeltedServer(httpServer, config)`
`config` object has keys for `wsPort`, `primusConfig` and `simplePeerConfig`.

Note that when using simple-peer with dev versions of `wrtc` plugged in, it is possible to pass a custom parameter `portRange` (keys for `min` and `max` port) to the RTCConfiguration which specify which UDP ports are allowed to be used in the ICE gatherer for UDP/RTC connections.

### `melted.start()`

### `melted.stop()`

### `melted.on('connect', function (client) {})`
Returns an instance of `RemoteClient` when a new client connects to the server.

### `RemoteClient.prototype.send(type, data)`
Takes a string `type` and an object `data`.  Sends an unreliable/unordered UDP message via WebRTC to the client.

### `RemoteClient.prototype.wsSend(type, data)`
Same as `.send`, but uses WebSockets (for reliable/ordered communications).

### `RemoteClient.prototype.on(type, function (data) {})`
Fired when a message of `type` is received from the client (either through RTC or WS).

### `RemoteClient.prototype.ping()`
Returns a native Promise that returns the estimated RTT of the WebRTC connection.

### `RemoteClient.prototype.wsPing()`
Returns a native Promise that returns the estimated RTT of the WS connection.

### `RemoteClient.prototype.broadcast(type, data)`
Sends a message to all clients except for this client using WebRTC.

### `RemoteClient.prototype.broadcast(type, data)`
Sends a message to all clients except this one using WebSockets.


## Client

See the `basic` example for how to use the client (particularly the webpack config).  A shim for the primus client is needed in order to build the client in one step.

```javascript
var MeltedClient = require('melted-rtc/client')
var Primus = require('melted-rtc/primus-client-shim')
```

### `client = new MeltedClient(Primus, url, config)`
`url` is a string of the format `PROTOCOL://ADDRESS:PORT`.
`config` object has keys for `simplePeer` and `primus`

### `client.on('connect', function () {})`
Emitted when WS and RTC connections to server have been established.

### `client.on(type, function (data) {})`
Called when a message of type `type` has been received from the server (either through WS or RTC).

### `client.send(type, data)`
Takes a string `type` and an object `data`.  Sends an unreliable/unordered UDP message via WebRTC to the server.

### `client.wsSend(type, data)`
Same as `.send`, but uses WebSockets (for reliable/ordered communications).

### `client.disconnect()`
Disconnect from the server.


## Dependencies

* [Primus](https://github.com/primus/primus)
* [simple-peer](https://github.com/feross/simple-peer)
* [wrtc](https://github.com/js-platform/node-webrtc)
* [UWS](https://github.com/uNetworking/uWebSockets)


Refer to `examples/basic` for a sample implementation.

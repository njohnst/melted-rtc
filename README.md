# melted-rtc
UDP/TCP game server for Node.js.


## Details

melted-rtc is a facade for WebSockets and WebRTC that provides lag compensation methods, and utilizes non-standard RTCConfiguration options to specify a fixed range of ports for inbound UDP connections.


## Dependencies

* [Primus](https://github.com/primus/primus)
* [simple-peer](https://github.com/feross/simple-peer)
* [wrtc](https://github.com/js-platform/node-webrtc)
* [UWS](https://github.com/uNetworking/uWebSockets).


Refer to `examples/basic` for a sample implementation.

# melted-rtc
Client-server model RTC and signaling library

## Motivation

Note: If you are building a p2p application, this repository isn't intended for you.

For client-server model networking, the NAT traversal features (ICE) of WebRTC are unnecessary (read: port forwarding!).  In my quest to build a networked game, I struggled to find information on how to make WebRTC work in this capacity.

Upon reading the [ICE RFC](https://tools.ietf.org/html/rfc5245), specifically the section about 'peer-reflexive candidates', I found a solution that would allow me to avoid STUN/TURN altogether.

TL;DR:
In a nutshell, this library provides a facade for WebSockets and WebRTC - it handles signaling, and transforms ICE candidates to use preconfigured IP:PORT combinations (port forwarding!) so that the client can initiate WebRTC SCTP/UDP connections with the application server without any other special acronym servers.

This library is heavily opinionated: it relies on [Primus](https://github.com/primus/primus) and [UWS](https://github.com/uNetworking/uWebSockets) for WebSockets, and [simple-peer](https://github.com/feross/simple-peer) for WebRTC.


## Details

The ICE negotiation process starts when two peers (in our case, one peer is the client and the other is the server) generate 'host candidates'.  These candidates are IP:PORT combinations based on the local network interface (and won't work outside the LAN!).

This library modifies the server's `host candidate' to use a different IP:PORT combination (i.e. the public IP address for the server, and a forwarded UDP port).

Transforming the client's host candidate won't work (as we can't use port forwarding on the client side), so we need a different approach. [RFC 5245](https://tools.ietf.org/html/rfc5245) describes host candidates as well as other ICE candidates generated by STUN/TURN (which don't apply in this case).  However, we can use 'peer-reflexive candidates', which are generated later in the process.  
When the client attempts to connect to the server (using the transformed host candidate with the public IP:PORT that we gave it), a 'peer-reflexive candidate' is generated based on the source IP:PORT of the client's message - the client's router remembers this mapping so we can send UDP responses to it.

e.g. 
Server at public IP 1.1.1.1 and with UDP port 9999 open/forwarded
1. Client sends WebRTC offer, and their router modifies the source of the message to a public IP and UDP port (2.2.2.2:12345)
2. Server receives the offer, and generates a 'peer-reflexive candidate' based on the source IP and port
3. Server sends WebRTC offer to the peer-reflexive candidate (2.2.2.2:12345)
4. Client's router allows the message through and forwards the message back to the client's machine as it remembers that the client sent out a UDP message on this port recently
5. WebRTC connection is established! Two fewer fancy acronyms to worry about


## Examples

TODO





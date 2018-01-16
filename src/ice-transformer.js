const Transformer = function (ip, port) {
  this._candidate = function (o) {
    return o.replace
      (
       /candidate:([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)/g,
       `candidate:$1 $2 $3 $4 ${ip} ${port}`
      )
  }

  this._sdp = function (sdp) {
    return sdp.replace(
       /m=application\s([^\s]+)\s([^\s]+)\s([^\s]+)/g,
       `m=application $1 $2 ${port}`
      )
      .replace(
       /a=sctpmap:([^\s]+)\s([^\s]+)\s([^\s]+)/g,
       `a=sctpmap:${port} $2 $3`
      )
      .replace(
       /candidate:([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)/g,
       `candidate:$1 $2 $3 $4 ${ip} ${port}`
      )
  }

  this.candidate = function (c) {
    c.candidate.candidate = this._candidate(c.candidate.candidate)
    return c
  }

  this.offer = function (o) {
    o.sdp = this._sdp(o.sdp)
    return o
  }

  this.answer = function (a) {
    a.sdp = this._sdp(a.sdp)
    return a
  }
}

module.exports = Transformer

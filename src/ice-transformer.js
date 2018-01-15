const Transformer = function (ip, port) {
  this._replace = function (o) {
    return o.replace(
       /m=application\s([^\s]+)\s([^\s]+)\s([^\s]+)/,
       `m=application $1 $2 ${port}`
      )
      .replace(
       /a=sctpmap:([^\s]+)\s([^\s]+)\s([^\s]+)/,
       `a=sctpmap:${port} $2 $3`
      )
      .replace(
       /a=candidate:([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)/,
       `a=candidate:$1 $2 $3 $4 ${ip} ${port}`
      )
  }

  this.candidate = function (c) {
    c.candidate.candidate = this._replace(c.candidate.candidate)
    return c
  }

  this.offer = function (o) {
    o.sdp = this._replace(o.sdp)
    return o
  }

  this.answer = function (a) {
    a.sdp = this._replace(a.sdp)
    return a
  }
}

module.exports = Transformer

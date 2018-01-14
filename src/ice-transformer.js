const Transformer = function (ip, port) {
  this._candidateReplace = function (c) {
      return c.replace(
               /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) (\d{1,5})/,
               `${ip} ${port}`
             )
  }

  this._sdpReplace = function (o) {
    return this._candidateReplace(
             o.replace(/m=application\s([^\s]+)\s([^\s]+)\s([^\s]+)/,
                       `m=application $1 $2 ${port}`)
              .replace(
                /a=sctpmap:([^\s]+)\s([^\s]+)\s([^\s]+)/,
                `a=sctpmap:${port} $2 $3`
              )
           )

  }

  this.candidate = function (c) {
    c.candidate.candidate = this._candidateReplace(c.candidate.candidate)
    return c
  }

  this.offer = function (o) {
    o.sdp = this._sdpReplace(o.sdp)
    return o
  }

  this.answer = function (a) {
    a.sdp = this._sdpReplace(a.sdp)
    return a
  }
}

module.exports = Transformer

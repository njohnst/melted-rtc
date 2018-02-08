/**
@constructor World
@argument tickRate mandatory, number of snapshots to send per second
@argument clockMethod optional, defaults to `Date.now`
@argument nSnapshots optional, number of snapshots to keep, defaults to 1
*/
function World (tickRate, clockMethod, nSnapshots) {
  this._tickRate = tickRate
  this._clockMethod = clockMethod || Data.now
  this._snapshots = []
  this._nSnapshots = nSnapshots || 1
  this._interval = 1000/this._tickRate

  this.createSnapshot = function (data) {
    const time = this.clockMethod()
    this._snapshots.unshift({
      timestamp: time,
      snapshot: data
    })
    if (this._snapshots.length >= this._nSnapshots) this._snapshots.pop()
  }

  this.getSnapshot = function (lookback) {
    return this._snapshots[lookback / this._interval >> 0]
  }
}

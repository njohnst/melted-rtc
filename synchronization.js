/**
@constructor World
@argument interval mandatory, time between sending snapshots
@argument nSnaps optional, number of snapshots to keep, defaults to 1
@argument tickMax optional, value at which tick number wraps around to 0
*/
function World (interval, nSnaps, tickMax) {
  this._interval = interval
  this._nSnaps = nSnaps || 1
  this._tickMax = tickMax || 65535 //default to 65535 (max. for 2 bytes)

  this._snapshots = new Map()
  this._tick = 0

  this.createSnapshot = function (data) {
    this._snapshots.set(this._tick, data)
    this._tick = this.tick < this._tickMax ? this._tick + 1 : 0
    if (this._snapshots.size > this._nSnaps){
      this._snapshots.delete(this._tick - 1 - this_nSnaps)
    }
  }

  this.getSnapshot = function (tickNumber) {
    return this._snapshots.get(tickNumber)
  }

  this.getRecentTick = function () {
    return this._tick - 1
  }
}

module.exports = World

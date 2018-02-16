/**
@constructor World
@argument interval mandatory, time between sending snapshots
@argument clockMethod optional, defaults to `Date.now`
@argument nSnaps optional, number of snapshots to keep, defaults to 1
*/
function World (interval, clockMethod, nSnaps) {
  this._interval = interval
  this._clockMethod = clockMethod || Date.now
  this._nSnaps = nSnaps || 1

  this._snapshots = new Map()
  this._tick = 0

  this.createSnapshot = function (data) {
    this._snapshots.set(this._tick++, data)
    if (this._snapshots.size > this._nSnaps){
      this._snapshots.delete(this._tick - this_nSnaps)
    }
  }

  this.getSnapshot = function (lookback) {
    return this._snapshots.get((lookback / this._interval) >> 0)
  }

  this.getRecent = function () {
    return this._snapshots.get(this._tick)
  }
}

/* TODO
  2. Add convenience methods for:
  a) most recent snapshot
  b) two most recent snapshots / 2 snapshots in general for lerp...
  3. Use clock / setInterval and emit event when snapshot is created, then
     dependents can listen
  __
  4. (In this class/file or different?) Add RTT / latency estimation
  5. (-- different?) Add event listening method / directly invoked method that
     receives packets from client and simulates them (somehow talking to dependents... events?)
*/

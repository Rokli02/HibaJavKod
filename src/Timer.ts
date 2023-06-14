export class Timer {
  private _start: number;
  private _end: number;
  duration: number;

  constructor() {
    this.start();
  }

  start() {
    this._start = Date.now();
    this._end = this._start;
    this.duration = 0;
  }

  stop() {
    this._end = Date.now();
    return this.duration = this._end - this._start;
  }

  stopPrint() {
    console.log(`Runtime: ${this.stop() / 1000} s`)
  }
}
export class LapManager {
  public currentLap: number = 1;
  public totalLaps: number = 3;
  public lapTimes: number[] = [];
  public bestLapTime: number = 0;
  public isFinished: boolean = false;

  constructor(totalLaps: number = 3) {
    this.totalLaps = totalLaps;
  }

  public reset(): void {
    this.currentLap = 1;
    this.lapTimes = [];
    this.bestLapTime = 0;
    this.isFinished = false;
  }

  /**
   * Records completed lap time. Returns true if final lap completed.
   */
  public recordLap(lapTime: number): boolean {
    this.lapTimes.push(lapTime);
    if (this.bestLapTime === 0 || lapTime < this.bestLapTime) {
      this.bestLapTime = lapTime;
    }

    if (this.currentLap >= this.totalLaps) {
      this.isFinished = true;
      return true;
    } else {
      this.currentLap++;
      return false;
    }
  }

  public get lastLapTime(): number {
    return this.lapTimes.length > 0 ? this.lapTimes[this.lapTimes.length - 1] : 0;
  }
}

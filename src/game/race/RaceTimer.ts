export class RaceTimer {
  public raceTime: number = 0;
  public lapTime: number = 0;
  public bestLapTime: number = 0;
  public isRunning: boolean = false;

  public get currentLapTime(): number {
    return this.lapTime;
  }

  public reset(): void {
    this.raceTime = 0;
    this.lapTime = 0;
    this.bestLapTime = 0;
    this.isRunning = false;
  }

  public start(): void {
    this.isRunning = true;
  }

  public stop(): void {
    this.isRunning = false;
  }

  public update(dt: number): void {
    if (!this.isRunning) return;
    this.raceTime += dt;
    this.lapTime += dt;
  }

  public onLapCompleted(): number {
    const completedLapTime = this.lapTime;
    if (this.bestLapTime === 0 || completedLapTime < this.bestLapTime) {
      this.bestLapTime = completedLapTime;
    }
    this.lapTime = 0;
    return completedLapTime;
  }

  public static formatTime(seconds: number): string {
    if (seconds <= 0 || !isFinite(seconds)) return '00:00.000';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    const minStr = mins < 10 ? '0' + mins : mins.toString();
    const secStr = secs < 10 ? '0' + secs : secs.toString();
    const msStr = ms < 10 ? '00' + ms : ms < 100 ? '0' + ms : ms.toString();

    return `${minStr}:${secStr}.${msStr}`;
  }
}

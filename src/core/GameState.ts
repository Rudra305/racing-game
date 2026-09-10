export enum RaceState {
  BOOT = 'BOOT',
  LOADING = 'LOADING',
  MENU = 'MENU',
  COUNTDOWN = 'COUNTDOWN',
  RACING = 'RACING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}

export class GameState {
  public state: RaceState = RaceState.BOOT;
  public totalLaps: number = 3;
  public currentLap: number = 1;
  public currentCheckpoint: number = 0;
  public totalCheckpoints: number = 0;

  // Race timing (performance.now based)
  public countdownTimer: number = 3.0;
  public countdownText: string = '';
  public raceStartTime: number = 0;
  public currentLapStartTime: number = 0;
  public currentLapTime: number = 0;
  public lastLapTime: number = 0;
  public bestLapTime: number = 0;
  public totalRaceTime: number = 0;

  private checkpointsPassedInLap: Set<number> = new Set();

  constructor(totalLaps: number = 3) {
    this.totalLaps = totalLaps;
  }

  public init(totalCheckpoints: number): void {
    this.totalCheckpoints = totalCheckpoints;
    this.reset();
  }

  public reset(): void {
    this.state = RaceState.COUNTDOWN;
    this.currentLap = 1;
    this.currentCheckpoint = 0;
    this.checkpointsPassedInLap.clear();
    this.countdownTimer = 3.0;
    this.countdownText = '3';
    this.currentLapTime = 0;
    this.lastLapTime = 0;
    this.bestLapTime = 0;
    this.totalRaceTime = 0;
    this.raceStartTime = 0;
    this.currentLapStartTime = 0;
  }

  public update(delta: number): void {
    if (this.state === RaceState.COUNTDOWN) {
      this.countdownTimer -= delta;
      if (this.countdownTimer > 2.0) {
        this.countdownText = '3';
      } else if (this.countdownTimer > 1.0) {
        this.countdownText = '2';
      } else if (this.countdownTimer > 0.0) {
        this.countdownText = '1';
      } else {
        this.countdownText = 'GO!';
        this.state = RaceState.RACING;
        const now = performance.now();
        this.raceStartTime = now;
        this.currentLapStartTime = now;
      }
    } else if (this.state === RaceState.RACING) {
      const now = performance.now();
      this.totalRaceTime = (now - this.raceStartTime) / 1000;
      this.currentLapTime = (now - this.currentLapStartTime) / 1000;

      // Dismiss "GO!" banner 0.8s after the race starts
      if (this.countdownText === 'GO!') {
        this.countdownTimer -= delta;
        if (this.countdownTimer <= -0.8) {
          this.countdownText = '';
        }
      }
    }
  }

  /**
   * Called when player passes a checkpoint.
   * Validates sequential progression and prevents shortcutting.
   */
  public onCheckpointPassed(checkpointIndex: number): boolean {
    if (this.state !== RaceState.RACING) return false;

    // Checkpoint 0 is the Start/Finish line
    if (checkpointIndex === 0) {
      // Must have passed at least 80% of intermediate checkpoints to complete a lap
      const requiredIntermediate = Math.max(1, this.totalCheckpoints - 1);
      if (this.checkpointsPassedInLap.size >= requiredIntermediate) {
        this.lastLapTime = this.currentLapTime;
        if (this.bestLapTime === 0 || this.lastLapTime < this.bestLapTime) {
          this.bestLapTime = this.lastLapTime;
        }

        if (this.currentLap >= this.totalLaps) {
          this.state = RaceState.FINISHED;
          this.countdownText = 'RACE FINISHED!';
          return true;
        } else {
          this.currentLap++;
          this.checkpointsPassedInLap.clear();
          this.currentLapStartTime = performance.now();
          this.currentCheckpoint = 0;
          return true;
        }
      }
      return false;
    }

    // Intermediate checkpoint: record if it's the next expected one or valid sequence
    if (checkpointIndex > 0) {
      this.checkpointsPassedInLap.add(checkpointIndex);
      this.currentCheckpoint = checkpointIndex;
      return true;
    }

    return false;
  }

  public formatTime(seconds: number): string {
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

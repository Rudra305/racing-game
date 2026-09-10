import { RaceResults } from './RaceResults';
import { PositionManager } from './PositionManager';

export class FinishSystem {
  public playerFinished: boolean = false;
  public allFinished: boolean = false;
  public finishTimeout: number = 15.0; // Seconds after player finishes before showing results
  private finishTimer: number = 0;
  private results: RaceResults | null = null;

  public reset(): void {
    this.playerFinished = false;
    this.allFinished = false;
    this.finishTimer = 0;
    this.results = null;
  }

  public onPlayerFinished(): void {
    this.playerFinished = true;
    this.finishTimer = 0;
  }

  public update(dt: number, positionManager: PositionManager): boolean {
    if (!this.playerFinished) return false;

    this.finishTimer += dt;

    // Check if all participants finished
    const standings = positionManager.getStandings();
    const allDone = standings.every(s => s.isFinished);

    if (allDone || this.finishTimer >= this.finishTimeout) {
      this.allFinished = true;
      if (!this.results) {
        this.results = RaceResults.build(standings);
      }
      return true;
    }

    return false;
  }

  public getResults(positionManager: PositionManager): RaceResults {
    if (!this.results) {
      this.results = RaceResults.build(positionManager.getStandings());
    }
    return this.results;
  }
}

import { RaceTimer } from './RaceTimer';

export interface DriverResult {
  position: number;
  name: string;
  isPlayer: boolean;
  vehicleModel: string;
  totalTime: number;
  bestLapTime: number;
  formattedTotalTime: string;
  formattedBestLap: string;
  gap: string; // "LEADER" or "+X.XXXs" or "DNF"
}

export class RaceResults {
  public results: DriverResult[] = [];

  public static build(
    standings: Array<{
      position: number;
      name: string;
      isPlayer: boolean;
      totalTime?: number;
      bestLapTime?: number;
      isFinished: boolean;
    }>
  ): RaceResults {
    const res = new RaceResults();
    const leaderTime = standings.length > 0 && standings[0].totalTime ? standings[0].totalTime : 0;

    for (let i = 0; i < standings.length; i++) {
      const s = standings[i];
      const totTime = s.totalTime || 0;
      const bestLap = s.bestLapTime || 0;

      let gap = 'LEADER';
      if (i > 0) {
        if (!s.isFinished) {
          gap = 'DNF';
        } else {
          const diff = Math.max(0, totTime - leaderTime);
          gap = `+${diff.toFixed(3)}s`;
        }
      }

      res.results.push({
        position: s.position,
        name: s.name,
        isPlayer: s.isPlayer,
        vehicleModel: s.isPlayer ? 'Apex GT-R' : 'Veloce AI',
        totalTime: totTime,
        bestLapTime: bestLap,
        formattedTotalTime: s.isFinished ? RaceTimer.formatTime(totTime) : '--:--.---',
        formattedBestLap: bestLap > 0 ? RaceTimer.formatTime(bestLap) : '--:--.---',
        gap
      });
    }

    return res;
  }
}

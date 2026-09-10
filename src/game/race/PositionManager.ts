export interface ParticipantProgress {
  id: string;
  name: string;
  isPlayer: boolean;
  lap: number;
  checkpoint: number;
  distanceAlongTrack: number;
  totalProgress: number; // in meters: (lap - 1) * trackLength + distanceAlongTrack
  position: number;      // 1 to N
  isFinished: boolean;
  finishTime?: number;
  finishPosition?: number;
}

export class PositionManager {
  private trackLength: number;
  private participants: Map<string, ParticipantProgress> = new Map();
  private sortedParticipants: ParticipantProgress[] = [];
  private updateTimer: number = 0;
  private readonly updateInterval: number = 0.08; // ~12.5 Hz update frequency for sorting

  constructor(trackLength: number) {
    this.trackLength = trackLength;
  }

  public reset(): void {
    let initialPos = 1;
    for (const p of this.participants.values()) {
      p.lap = 1;
      p.checkpoint = 0;
      p.distanceAlongTrack = 0;
      p.totalProgress = -initialPos;
      p.position = initialPos;
      p.isFinished = false;
      p.finishTime = undefined;
      p.finishPosition = undefined;
      initialPos++;
    }
    this.updateTimer = 0;
  }

  public registerParticipant(id: string, name: string, isPlayer: boolean): void {
    const initPos = this.participants.size + 1;
    const entry: ParticipantProgress = {
      id,
      name,
      isPlayer,
      lap: 1,
      checkpoint: 0,
      distanceAlongTrack: 0,
      totalProgress: -initPos,
      position: initPos,
      isFinished: false
    };
    this.participants.set(id, entry);
    this.sortedParticipants.push(entry);
  }

  public updateParticipant(
    id: string,
    lap: number,
    checkpoint: number,
    distanceAlongTrack: number,
    isFinished: boolean,
    finishTime?: number
  ): void {
    const p = this.participants.get(id);
    if (!p) return;

    p.lap = lap;
    p.checkpoint = checkpoint;
    p.distanceAlongTrack = distanceAlongTrack;

    // Handle cars behind start line on the starting grid
    let effectiveDist = distanceAlongTrack;
    if (lap === 1 && checkpoint === 0 && distanceAlongTrack > this.trackLength * 0.5) {
      effectiveDist = distanceAlongTrack - this.trackLength;
    }

    p.totalProgress = (lap - 1) * this.trackLength + effectiveDist;

    if (isFinished && !p.isFinished) {
      p.isFinished = true;
      p.finishTime = finishTime;
    }
  }

  public update(dt: number): void {
    this.updateTimer += dt;
    if (this.updateTimer < this.updateInterval) return;
    this.updateTimer = 0;

    // Sort participants by totalProgress descending, finished cars locked by finish time
    this.sortedParticipants.sort((a, b) => {
      if (a.isFinished && b.isFinished) {
        return (a.finishTime || 0) - (b.finishTime || 0);
      }
      if (a.isFinished) return -1;
      if (b.isFinished) return 1;
      return b.totalProgress - a.totalProgress;
    });

    for (let i = 0; i < this.sortedParticipants.length; i++) {
      const p = this.sortedParticipants[i];
      p.position = i + 1;
      if (p.isFinished && p.finishPosition === undefined) {
        p.finishPosition = i + 1;
      }
    }
  }

  public getPlayerPosition(): number {
    for (const p of this.sortedParticipants) {
      if (p.isPlayer) return p.position;
    }
    return 1;
  }

  public getTotalParticipants(): number {
    return this.sortedParticipants.length;
  }

  public getParticipant(id: string): ParticipantProgress | undefined {
    return this.participants.get(id);
  }

  public get standings(): ParticipantProgress[] {
    return this.sortedParticipants;
  }

  public getStandings(): ParticipantProgress[] {
    return this.sortedParticipants;
  }
}

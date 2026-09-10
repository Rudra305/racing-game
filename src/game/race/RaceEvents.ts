export enum RaceEventType {
  RACE_STARTED = 'RACE_STARTED',
  COUNTDOWN_TICK = 'COUNTDOWN_TICK',
  LAP_COMPLETED = 'LAP_COMPLETED',
  CHECKPOINT_PASSED = 'CHECKPOINT_PASSED',
  POSITION_CHANGED = 'POSITION_CHANGED',
  VEHICLE_FINISHED = 'VEHICLE_FINISHED',
  RACE_FINISHED = 'RACE_FINISHED',
  COLLISION = 'COLLISION'
}

export type RaceEventHandler<T = any> = (data: T) => void;

export class RaceEvents {
  private listeners: Map<RaceEventType, Set<RaceEventHandler>> = new Map();

  public on<T = any>(type: RaceEventType, handler: RaceEventHandler<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);

    return () => {
      this.off(type, handler);
    };
  }

  public off(type: RaceEventType, handler: RaceEventHandler): void {
    const set = this.listeners.get(type);
    if (set) {
      set.delete(handler);
    }
  }

  public emit<T = any>(type: RaceEventType, data?: T): void {
    const set = this.listeners.get(type);
    if (set) {
      for (const handler of set) {
        handler(data);
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

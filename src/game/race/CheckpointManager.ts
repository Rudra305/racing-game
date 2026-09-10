import * as THREE from 'three';
import { Checkpoint } from '../../tracks/Checkpoint';

export interface CheckpointValidationResult {
  valid: boolean;
  isLapCompletion: boolean;
  checkpointIndex: number;
}

export class CheckpointManager {
  public currentCheckpoint: number = 0;
  public lastValidCheckpoint: number = 0;
  public totalCheckpoints: number;

  private checkpoints: Checkpoint[];
  private visitedIndices: Set<number> = new Set();

  constructor(checkpoints: Checkpoint[]) {
    this.checkpoints = checkpoints;
    this.totalCheckpoints = checkpoints.length;
  }

  public reset(): void {
    this.currentCheckpoint = 0;
    this.lastValidCheckpoint = 0;
    this.visitedIndices.clear();
  }

  public get nextCheckpoint(): number {
    return (this.currentCheckpoint + 1) % this.totalCheckpoints;
  }

  /**
   * Evaluates vehicle position against checkpoints.
   * Returns validation result if a checkpoint is triggered.
   */
  public updateVehiclePosition(position: THREE.Vector3): CheckpointValidationResult {
    for (let i = 0; i < this.checkpoints.length; i++) {
      const cp = this.checkpoints[i];
      if (cp.isPassedByVehicle(position)) {
        return this.onPassed(i);
      }
    }

    return { valid: false, isLapCompletion: false, checkpointIndex: -1 };
  }

  private onPassed(index: number): CheckpointValidationResult {
    // Checkpoint 0 is Start/Finish line
    if (index === 0) {
      // Must have passed at least 80% of intermediate checkpoints to validate a lap
      const requiredIntermediate = Math.max(1, Math.floor((this.totalCheckpoints - 1) * 0.8));
      if (this.visitedIndices.size >= requiredIntermediate) {
        this.visitedIndices.clear();
        this.lastValidCheckpoint = 0;
        this.currentCheckpoint = 0;
        return { valid: true, isLapCompletion: true, checkpointIndex: 0 };
      }
      return { valid: false, isLapCompletion: false, checkpointIndex: 0 };
    }

    // Intermediate checkpoint
    this.visitedIndices.add(index);
    this.lastValidCheckpoint = index;
    this.currentCheckpoint = index;
    return { valid: true, isLapCompletion: false, checkpointIndex: index };
  }
}

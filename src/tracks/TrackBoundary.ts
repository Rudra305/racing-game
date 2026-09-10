import * as THREE from 'three';
import { TrackBoundaryDefinition } from './TrackTypes';
import { TrackSampler, TrackSample } from './TrackSampler';

export interface BoundaryCheckResult {
  isOffRoad: boolean;
  isOffPlayable: boolean;
  isBeyondReset: boolean;
  collidedWithBarrier: boolean;
  barrierNormal: THREE.Vector3;
  penetration: number;
  lateralDistance: number;
}

export class TrackBoundary {
  public readonly definitions: TrackBoundaryDefinition[];
  public readonly sampler: TrackSampler;

  public roadLimit: number = 7.0;
  private playableLimit: number = 22.0;
  private resetLimit: number = 55.0;

  private hasPhysicalBarriers: boolean = true;
  private barrierHeight: number = 1.2;
  private barrierWidth: number = 0.8;

  // Zero-allocation scratch objects
  private readonly _toCar: THREE.Vector3 = new THREE.Vector3();
  private readonly _result: BoundaryCheckResult = {
    isOffRoad: false,
    isOffPlayable: false,
    isBeyondReset: false,
    collidedWithBarrier: false,
    barrierNormal: new THREE.Vector3(),
    penetration: 0,
    lateralDistance: 0
  };

  constructor(sampler: TrackSampler, definitions: TrackBoundaryDefinition[]) {
    this.sampler = sampler;
    this.definitions = definitions;
    this.parseDefinitions();
  }

  private parseDefinitions(): void {
    for (const def of this.definitions) {
      if (def.type === 'ROAD') {
        this.roadLimit = def.lateralDistance;
      } else if (def.type === 'PLAYABLE') {
        this.playableLimit = def.lateralDistance;
      } else if (def.type === 'RESET') {
        this.resetLimit = def.lateralDistance;
      }

      if (def.hasPhysicalBarrier !== undefined) {
        this.hasPhysicalBarriers = def.hasPhysicalBarrier;
      }
      if (def.barrierHeight !== undefined) {
        this.barrierHeight = def.barrierHeight;
      }
      if (def.barrierWidth !== undefined) {
        this.barrierWidth = def.barrierWidth;
      }
    }
  }

  /**
   * Evaluates vehicle position relative to logical and physical track boundaries.
   */
  public evaluate(position: THREE.Vector3, closestSample: TrackSample, carHalfWidth: number = 0.95): BoundaryCheckResult {
    // Vector from sample center to car
    this._toCar.subVectors(position, closestSample.position);

    // Distance along banked right vector (lateral across road surface)
    const lateralDist = this._toCar.dot(closestSample.bankedRight);
    const absLat = Math.abs(lateralDist);
    this._result.lateralDistance = lateralDist;

    // 1. Road Boundary
    const localRoadHalf = closestSample.width * 0.5;
    this._result.isOffRoad = absLat > localRoadHalf;

    // 2. Playable Boundary (Shoulder + Runoff)
    this._result.isOffPlayable = absLat > this.playableLimit;

    // 3. Reset Boundary (Far off track)
    this._result.isBeyondReset = absLat > this.resetLimit;

    // 4. Physical Barrier Collision Check
    // Barriers are placed on the outer edge of the kerb (road edge + kerb width 0.9m)
    const barrierOffset = this.hasPhysicalBarriers ? (localRoadHalf + 0.9) : this.playableLimit;
    const collisionMargin = barrierOffset - carHalfWidth;

    if (this.hasPhysicalBarriers && absLat > collisionMargin) {
      this._result.collidedWithBarrier = true;
      // Clamp penetration to prevent extreme ejection impulses
      this._result.penetration = Math.min(0.35, absLat - collisionMargin);

      // Barrier normal points inward toward track center
      if (lateralDist > 0) {
        this._result.barrierNormal.copy(closestSample.bankedRight).negate();
      } else {
        this._result.barrierNormal.copy(closestSample.bankedRight);
      }
    } else {
      this._result.collidedWithBarrier = false;
      this._result.penetration = 0;
    }

    return this._result;
  }

  public get physicalBarrierHeight(): number {
    return this.barrierHeight;
  }

  public get physicalBarrierWidth(): number {
    return this.barrierWidth;
  }

  public get hasBarriers(): boolean {
    return this.hasPhysicalBarriers;
  }
}

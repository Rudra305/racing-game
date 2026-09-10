import * as THREE from 'three';
import { TrackConfig, TrackGenerator, GeneratedTrackData } from './TrackGenerator';
import { Checkpoint } from './Checkpoint';

export interface CollisionResult {
  collided: boolean;
  normal: THREE.Vector3;
  penetration: number;
}

export class Track {
  public readonly group: THREE.Group;
  public readonly checkpoints: Checkpoint[] = [];
  public readonly spawnPosition: THREE.Vector3;
  public readonly spawnHeading: number;

  private readonly config: TrackConfig;
  private readonly trackData: GeneratedTrackData;

  private checkpointDebugGroup: THREE.Group = new THREE.Group();
  private areCheckpointsVisible: boolean = false;

  public lastLateralDistance: number = 0;
  public get halfRoadWidth(): number {
    return this.config.width * 0.5;
  }

  // Localized segment search cache to guarantee O(1) collision checking
  private lastClosestSegment: number = 0;

  // Pre-allocated scratch objects for zero-allocation collision checks
  private readonly _collisionResult: CollisionResult = {
    collided: false,
    normal: new THREE.Vector3(),
    penetration: 0
  };
  private readonly _toCar: THREE.Vector3 = new THREE.Vector3();

  constructor(config: TrackConfig) {
    this.config = config;
    this.group = new THREE.Group();

    this.trackData = TrackGenerator.generate(config);
    this.spawnPosition = this.trackData.spawnPosition;
    this.spawnHeading = this.trackData.spawnHeading;
    this.checkpoints = this.trackData.checkpoints;

    this.buildSceneNodes();
  }

  private buildSceneNodes(): void {
    this.group.add(this.trackData.roadMesh);
    this.group.add(this.trackData.barrierMesh);
    this.group.add(this.trackData.kerbMesh);
    this.group.add(this.trackData.finishLineMesh);

    // Build debug checkpoint arches
    for (const cp of this.checkpoints) {
      const arch = cp.createDebugMesh();
      this.checkpointDebugGroup.add(arch);
    }
    this.checkpointDebugGroup.visible = false;
    this.group.add(this.checkpointDebugGroup);
  }

  public toggleCheckpointDebug(): boolean {
    this.areCheckpointsVisible = !this.areCheckpointsVisible;
    this.checkpointDebugGroup.visible = this.areCheckpointsVisible;
    return this.areCheckpointsVisible;
  }

  /**
   * Fast, zero-allocation boundary collision check.
   * Finds the closest track centerline point in a localized window around the car
   * and computes penetration against track barrier margins.
   */
  public checkBoundaryCollision(carPosition: THREE.Vector3, carHalfWidth: number = 0.95): CollisionResult {
    const centers = this.trackData.sampledCenters;
    const normals = this.trackData.sampledNormals;
    const totalSegs = this.config.segments;
    const halfRoadWidth = this.config.width * 0.5;

    // Search window of +- 20 segments around last known closest segment
    let bestDistSq = Infinity;
    let closestIndex = this.lastClosestSegment;
    const windowSize = 25;

    for (let offset = -windowSize; offset <= windowSize; offset++) {
      let idx = (this.lastClosestSegment + offset) % totalSegs;
      if (idx < 0) idx += totalSegs;

      const c = centers[idx];
      const dx = carPosition.x - c.x;
      const dz = carPosition.z - c.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        closestIndex = idx;
      }
    }

    this.lastClosestSegment = closestIndex;

    const center = centers[closestIndex];
    const normal = normals[closestIndex];

    // Vector from track center to car
    this._toCar.set(carPosition.x - center.x, 0, carPosition.z - center.z);

    // Distance along track normal (across track width)
    const lateralDist = this._toCar.dot(normal);
    this.lastLateralDistance = lateralDist;
    const absLateralDist = Math.abs(lateralDist);

    const collisionLimit = halfRoadWidth - carHalfWidth;

    if (absLateralDist > collisionLimit) {
      const penetration = absLateralDist - collisionLimit;

      // Normal points inward toward the track center
      if (lateralDist > 0) {
        // Car hit the right barrier -> push left (-normal)
        this._collisionResult.normal.set(-normal.x, 0, -normal.z);
      } else {
        // Car hit the left barrier -> push right (+normal)
        this._collisionResult.normal.set(normal.x, 0, normal.z);
      }

      this._collisionResult.collided = true;
      this._collisionResult.penetration = penetration;
      return this._collisionResult;
    }

    this._collisionResult.collided = false;
    this._collisionResult.penetration = 0;
    return this._collisionResult;
  }
}

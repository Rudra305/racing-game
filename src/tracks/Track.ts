import * as THREE from 'three';
import { TrackDefinition } from './TrackTypes';
import { TrackSpline } from './TrackSpline';
import { TrackSampler } from './TrackSampler';
import { TrackBoundary, BoundaryCheckResult } from './TrackBoundary';
import { StartGrid } from './StartGrid';
import { Checkpoint } from './Checkpoint';
import { TrackGenerator, GeneratedTrackMeshes } from './TrackGenerator';
import { Terrain } from '../terrain/Terrain';
import { SurfaceType, SurfaceProperties, SURFACE_PROPERTIES } from '../terrain/TerrainSurface';
import { GroundElevationResult } from '../terrain/TerrainTypes';

export class Track {
  public readonly definition: TrackDefinition;
  public readonly group: THREE.Group;

  public readonly spline: TrackSpline;
  public readonly sampler: TrackSampler;
  public readonly boundary: TrackBoundary;
  public readonly startGrid: StartGrid;
  public readonly checkpoints: Checkpoint[] = [];
  public readonly terrain: Terrain;
  public readonly meshes: GeneratedTrackMeshes;

  public readonly spawnPosition: THREE.Vector3;
  public readonly spawnHeading: number;

  public lastLateralDistance: number = 0;
  public halfRoadWidth: number = 7.0;

  private checkpointDebugGroup: THREE.Group = new THREE.Group();
  private areCheckpointsVisible: boolean = false;

  // Runtime hint cache for O(1) query performance
  private vehicleClosestSampleIndex: number = 0;
  private cameraClosestSampleIndex: number = 0;

  // Zero-allocation scratch vectors
  private readonly _toCar: THREE.Vector3 = new THREE.Vector3();
  private readonly _groundNormal: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
  private readonly _interpPos: THREE.Vector3 = new THREE.Vector3();
  private readonly _interpRight: THREE.Vector3 = new THREE.Vector3();
  private readonly _interpNormal: THREE.Vector3 = new THREE.Vector3();

  constructor(definition: TrackDefinition) {
    this.definition = definition;
    this.group = new THREE.Group();

    // 1. 3D Spline & Sampler
    this.spline = new TrackSpline(definition.spline);
    this.sampler = new TrackSampler(this.spline, definition.spline.segments);

    // 2. Logical & Physical Boundaries
    this.boundary = new TrackBoundary(this.sampler, definition.boundaries);

    // 3. Staggered Multi-car Start Grid
    this.startGrid = new StartGrid(this.sampler, definition.startGrid);
    const p1 = this.startGrid.getPlayerSlot();
    this.spawnPosition = p1.position.clone();
    this.spawnHeading = p1.heading;

    // 4. Procedural Checkpoints along arc-length
    const numCheckpoints = 12;
    for (let k = 0; k < numCheckpoints; k++) {
      const dist = (k / numCheckpoints) * this.sampler.totalLength;
      const sample = this.sampler.getSampleAtDistance(dist);
      const cp = Checkpoint.fromSample(k, sample);
      this.checkpoints.push(cp);

      const debugMesh = cp.createDebugMesh();
      this.checkpointDebugGroup.add(debugMesh);
    }
    this.checkpointDebugGroup.visible = false;
    this.group.add(this.checkpointDebugGroup);

    // 5. Procedural Road Geometry (Elevation, Banking, Kerbs, Barriers, Finish line)
    this.meshes = TrackGenerator.generateMeshes(definition, this.sampler, this.boundary);
    this.group.add(this.meshes.roadMesh);
    this.group.add(this.meshes.kerbMesh);
    if (this.meshes.barrierMesh) {
      this.group.add(this.meshes.barrierMesh);
    }
    this.group.add(this.meshes.finishLineMesh);

    // 6. Procedural Terrain with Road Corridor
    this.terrain = new Terrain(definition.terrain, this.sampler);
    this.group.add(this.terrain.mesh);
  }

  /**
   * Evaluates exact ground elevation, surface normal, and slope at vehicle or camera position.
   * Performs smooth longitudinal spline interpolation between adjacent samples to eliminate
   * discrete height steps and suspension bouncing.
   */
  public queryGroundElevation(
    position: THREE.Vector3,
    isCamera: boolean = false,
    hintIndex?: number
  ): GroundElevationResult {
    const count = this.sampler.totalSamples;
    const hint = hintIndex !== undefined
      ? hintIndex
      : (isCamera ? this.cameraClosestSampleIndex : this.vehicleClosestSampleIndex);
    const sampleA = this.sampler.findClosestSample(position, hint);
    if (isCamera) {
      this.cameraClosestSampleIndex = sampleA.index;
    } else if (hintIndex === undefined) {
      this.vehicleClosestSampleIndex = sampleA.index;
    }

    const idxA = sampleA.index;
    this._toCar.subVectors(position, sampleA.position);
    const tangentOffset = this._toCar.dot(sampleA.tangent);

    let s0 = sampleA;
    let s1 = sampleA;
    let alpha = 0;

    if (tangentOffset >= 0) {
      // Position is ahead of sampleA, between sampleA and sampleA+1
      s0 = sampleA;
      const nextIdx = (idxA + 1) % count;
      s1 = this.sampler.samples[nextIdx];
      let segDist = s1.distance - s0.distance;
      if (segDist < 0) segDist += this.sampler.totalLength;
      alpha = segDist > 0.001 ? Math.max(0, Math.min(1, tangentOffset / segDist)) : 0;
    } else {
      // Position is behind sampleA, between sampleA-1 and sampleA
      const prevIdx = (idxA - 1 + count) % count;
      s0 = this.sampler.samples[prevIdx];
      s1 = sampleA;
      let segDist = s1.distance - s0.distance;
      if (segDist < 0) segDist += this.sampler.totalLength;
      const offsetFromS0 = segDist + tangentOffset;
      alpha = segDist > 0.001 ? Math.max(0, Math.min(1, offsetFromS0 / segDist)) : 0;
    }

    // Smoothly interpolate centerline position
    this._interpPos.lerpVectors(s0.position, s1.position, alpha);

    // Smoothly interpolate right & normal vectors
    this._interpRight.lerpVectors(s0.bankedRight, s1.bankedRight, alpha).normalize();
    this._interpNormal.lerpVectors(s0.surfaceNormal, s1.surfaceNormal, alpha).normalize();

    // Smoothly interpolate scalar attributes
    const roadHalf = THREE.MathUtils.lerp(s0.width, s1.width, alpha) * 0.5;
    const banking = THREE.MathUtils.lerp(s0.banking, s1.banking, alpha);
    const gradient = THREE.MathUtils.lerp(s0.gradient, s1.gradient, alpha);

    let segLen = s1.distance - s0.distance;
    if (segLen < 0) segLen += this.sampler.totalLength;
    let distAlong = s0.distance + alpha * segLen;
    if (distAlong >= this.sampler.totalLength) distAlong -= this.sampler.totalLength;

    // Lateral distance from interpolated centerline
    this._toCar.subVectors(position, this._interpPos);
    const lateralDist = this._toCar.dot(this._interpRight);
    const absLat = Math.abs(lateralDist);

    if (!isCamera) {
      this.lastLateralDistance = lateralDist;
      this.halfRoadWidth = roadHalf;
    }

    let height: number;
    let normal: THREE.Vector3;
    let surface: SurfaceProperties;
    let isRoad: boolean;
    let bankAngle: number = 0;
    let pitchAngle: number = 0;

    if (absLat <= roadHalf) {
      // Vehicle is on the elevated, banked asphalt road surface
      isRoad = true;
      const bankOffset = lateralDist * this._interpRight.y;
      height = this._interpPos.y + bankOffset + 0.04;
      normal = this._interpNormal;
      surface = SURFACE_PROPERTIES[SurfaceType.ASPHALT];
      bankAngle = banking;
      pitchAngle = Math.atan2(gradient, 1.0);
    } else if (absLat <= roadHalf + 0.9) {
      // Vehicle is on the rumble kerb
      isRoad = true;
      const bankOffset = lateralDist * this._interpRight.y;
      height = this._interpPos.y + bankOffset + 0.08;
      normal = this._interpNormal;
      surface = SURFACE_PROPERTIES[SurfaceType.KERB];
      bankAngle = banking;
      pitchAngle = Math.atan2(gradient, 1.0);
    } else {
      // Vehicle is off-road on the procedural terrain
      isRoad = false;
      height = this.terrain.getHeightAt(position.x, position.z);
      surface = this.terrain.getSurfaceAt(position.x, position.z);
      normal = this._groundNormal;
    }

    return {
      height,
      normal,
      surface,
      isRoad,
      bankAngle,
      pitchAngle,
      distance: distAlong,
      closestSampleIndex: sampleA.index,
      lateralDistance: lateralDist,
      halfRoadWidth: roadHalf
    };
  }

  /**
   * Surface property query for vehicle physics.
   */
  public querySurface(position: THREE.Vector3): SurfaceProperties {
    return this.queryGroundElevation(position, false).surface;
  }

  /**
   * Checks vehicle against track boundaries and physical barriers.
   */
  public checkBoundary(position: THREE.Vector3, carHalfWidth: number = 0.95, hintIndex?: number): BoundaryCheckResult {
    const hint = hintIndex !== undefined ? hintIndex : this.vehicleClosestSampleIndex;
    const sample = this.sampler.findClosestSample(position, hint);
    if (hintIndex === undefined) {
      this.vehicleClosestSampleIndex = sample.index;
    }
    return this.boundary.evaluate(position, sample, carHalfWidth);
  }

  /**
   * Collision check helper returning collided, normal, and penetration.
   */
  public checkBoundaryCollision(
    position: THREE.Vector3,
    carHalfWidth: number = 0.95,
    hintIndex?: number
  ): { collided: boolean; normal: THREE.Vector3; penetration: number } {
    const res = this.checkBoundary(position, carHalfWidth, hintIndex);
    return {
      collided: res.collidedWithBarrier,
      normal: res.barrierNormal,
      penetration: res.penetration
    };
  }

  /**
   * Approximate track distance in meters.
   */
  public getDistanceAlongTrack(position: THREE.Vector3): number {
    return this.sampler.getDistanceAlongTrack(position, this.vehicleClosestSampleIndex);
  }

  public toggleCheckpointDebug(): boolean {
    this.areCheckpointsVisible = !this.areCheckpointsVisible;
    this.checkpointDebugGroup.visible = this.areCheckpointsVisible;
    return this.areCheckpointsVisible;
  }

  /**
   * Comprehensive WebGL resource disposal.
   */
  public dispose(): void {
    // Road
    this.meshes.roadMesh.geometry.dispose();
    (this.meshes.roadMesh.material as THREE.Material).dispose();

    // Kerb
    this.meshes.kerbMesh.geometry.dispose();
    (this.meshes.kerbMesh.material as THREE.Material).dispose();

    // Barriers
    if (this.meshes.barrierMesh) {
      this.meshes.barrierMesh.geometry.dispose();
      (this.meshes.barrierMesh.material as THREE.Material).dispose();
    }

    // Finish line
    this.meshes.finishLineMesh.geometry.dispose();
    (this.meshes.finishLineMesh.material as THREE.Material).dispose();

    // Terrain
    this.terrain.dispose();

    // Remove all children
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
  }
}

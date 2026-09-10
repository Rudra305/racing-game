import * as THREE from 'three';
import { TrackSpline } from './TrackSpline';

export interface TrackSample {
  index: number;
  t: number;
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  normal: THREE.Vector3;
  surfaceNormal: THREE.Vector3;
  bankedRight: THREE.Vector3;
  distance: number;
  gradient: number;
  curvature: number;
  width: number;
  banking: number;
  elevation: number;
}

export class TrackSampler {
  public readonly spline: TrackSpline;
  public readonly samples: TrackSample[] = [];
  public readonly totalSamples: number;
  public readonly totalLength: number;

  private readonly _scratchVec: THREE.Vector3 = new THREE.Vector3();

  constructor(spline: TrackSpline, sampleCount: number) {
    this.spline = spline;
    this.totalSamples = sampleCount;
    this.totalLength = spline.totalLength;
    this.precomputeSamples();
  }

  private precomputeSamples(): void {
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < this.totalSamples; i++) {
      const t = i / this.totalSamples;

      const position = this.spline.getPoint(t);
      const tangent = this.spline.getTangent(t);
      const normal = this.spline.getNormal(t);
      const surfaceNormal = this.spline.getSurfaceNormal(t);
      const banking = this.spline.getBanking(t);
      const width = this.spline.getWidth(t);
      const gradient = this.spline.getGradient(t);
      const curvature = this.spline.getCurvature(t);
      const distance = t * this.totalLength;

      // Banked right vector
      const bankedRight = new THREE.Vector3()
        .copy(normal)
        .multiplyScalar(Math.cos(banking))
        .addScaledVector(up, Math.sin(banking))
        .normalize();

      this.samples.push({
        index: i,
        t,
        position,
        tangent,
        normal,
        surfaceNormal,
        bankedRight,
        distance,
        gradient,
        curvature,
        width,
        banking,
        elevation: position.y
      });
    }
  }

  /**
   * Fast, localized search for closest track sample.
   * Runs in O(1) when given a recent hint index.
   */
  public findClosestSample(
    position: THREE.Vector3,
    hintIndex: number = 0,
    windowSize: number = 30
  ): TrackSample {
    const count = this.totalSamples;
    let bestDistSq = Infinity;
    let bestIndex = hintIndex % count;
    if (bestIndex < 0) bestIndex += count;

    for (let offset = -windowSize; offset <= windowSize; offset++) {
      let idx = (hintIndex + offset) % count;
      if (idx < 0) idx += count;

      const pos = this.samples[idx].position;
      const dx = position.x - pos.x;
      const dy = position.y - pos.y;
      const dz = position.z - pos.z;
      // Downweight vertical distance so road segment directly below/above vehicle is correctly matched
      const distSq = dx * dx + 0.08 * dy * dy + dz * dz;

      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        bestIndex = idx;
      }
    }

    // If closest in window is still far (> 20m), fall back to global search
    if (bestDistSq > 400) {
      return this.findClosestSampleGlobal(position);
    }

    return this.samples[bestIndex];
  }

  /**
   * Global search across all samples (used for initialization and jump/teleport fallback).
   */
  public findClosestSampleGlobal(position: THREE.Vector3): TrackSample {
    let bestDistSq = Infinity;
    let bestIndex = 0;

    for (let i = 0; i < this.totalSamples; i++) {
      const pos = this.samples[i].position;
      const dx = position.x - pos.x;
      const dy = position.y - pos.y;
      const dz = position.z - pos.z;
      const distSq = dx * dx + 0.08 * dy * dy + dz * dz;

      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        bestIndex = i;
      }
    }

    return this.samples[bestIndex];
  }

  /**
   * Returns approximate arc-length distance along track in meters.
   */
  public getDistanceAlongTrack(position: THREE.Vector3, hintIndex?: number): number {
    const sample = hintIndex !== undefined
      ? this.findClosestSample(position, hintIndex)
      : this.findClosestSampleGlobal(position);

    // Fine-tune distance projection along the sample tangent
    this._scratchVec.subVectors(position, sample.position);
    const tangentialOffset = this._scratchVec.dot(sample.tangent);

    let finalDist = sample.distance + tangentialOffset;
    if (finalDist < 0) finalDist += this.totalLength;
    if (finalDist >= this.totalLength) finalDist -= this.totalLength;

    return finalDist;
  }

  /**
   * Sample at specific distance (meters) along track.
   */
  public getSampleAtDistance(distanceMeters: number): TrackSample {
    const wrappedDist = ((distanceMeters % this.totalLength) + this.totalLength) % this.totalLength;
    const progress = wrappedDist / this.totalLength;
    const index = Math.round(progress * this.totalSamples) % this.totalSamples;
    return this.samples[index];
  }
}

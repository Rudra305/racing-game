import * as THREE from 'three';
import { TrackSampler } from '../../tracks/TrackSampler';

export interface AIRacingPoint {
  index: number;
  distance: number;
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  normal: THREE.Vector3;
  curvature: number;
  width: number;
  targetSpeed: number; // m/s
}

export class AIRacingLine {
  public readonly points: AIRacingPoint[] = [];
  public readonly totalLength: number;
  public readonly totalPoints: number;

  constructor(sampler: TrackSampler) {
    this.totalLength = sampler.totalLength;
    this.totalPoints = sampler.totalSamples;
    this.computeRacingLine(sampler);
  }

  private computeRacingLine(sampler: TrackSampler): void {
    const maxSpeed = 58.0;     // ~209 km/h top speed on straight
    const minCornerSpeed = 8.5;// ~31 km/h hairpin minimum
    const maxLatAccel = 9.2;   // m/s² lateral grip capability
    const maxBrakeAccel = 6.8; // m/s² braking capability for anticipation

    // 1. First pass: compute target speed strictly from local curvature
    for (let i = 0; i < sampler.totalSamples; i++) {
      const s = sampler.samples[i];
      const curv = Math.max(0.0001, s.curvature);

      // Theoretical max cornering speed v = sqrt(a_lat / curvature)
      const rawCornerSpeed = Math.sqrt(maxLatAccel / curv);
      const cornerSpeed = Math.max(minCornerSpeed, Math.min(maxSpeed, rawCornerSpeed));

      this.points.push({
        index: i,
        distance: s.distance,
        position: s.position.clone(),
        tangent: s.tangent.clone(),
        normal: s.normal.clone(),
        curvature: curv,
        width: s.width,
        targetSpeed: cornerSpeed
      });
    }

    // 2. Backward pass: braking anticipation so cars brake before entering corners
    const count = this.points.length;
    // Iterate twice around loop to ensure smooth cyclic boundary conditions
    for (let pass = 0; pass < 2; pass++) {
      for (let i = count - 1; i >= 0; i--) {
        const nextIdx = (i + 1) % count;
        const current = this.points[i];
        const next = this.points[nextIdx];

        let ds = next.distance - current.distance;
        if (ds < 0) ds += this.totalLength;

        // v_i <= sqrt(v_{i+1}^2 + 2 * a_brake * ds)
        const maxEntrySpeed = Math.sqrt(next.targetSpeed * next.targetSpeed + 2.0 * maxBrakeAccel * ds);
        if (maxEntrySpeed < current.targetSpeed) {
          current.targetSpeed = maxEntrySpeed;
        }
      }
    }
  }

  /**
   * Samples racing line at exact distance along track in O(1).
   */
  public getPointAtDistance(distance: number): AIRacingPoint {
    const wrapped = ((distance % this.totalLength) + this.totalLength) % this.totalLength;
    const progress = wrapped / this.totalLength;
    const idx = Math.round(progress * this.totalPoints) % this.totalPoints;
    return this.points[idx];
  }
}

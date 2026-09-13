import * as THREE from 'three';
import { TrackSampler } from '../../tracks/TrackSampler';

export interface AIRacingPoint {
  index: number;
  distance: number;
  position: THREE.Vector3;       // 3D position on optimized racing line
  centerPosition: THREE.Vector3; // 3D position on track centerline
  tangent: THREE.Vector3;        // Tangent along racing line
  normal: THREE.Vector3;         // Banked right / normal
  lateralOffset: number;         // Signed offset from centerline (meters)
  curvature: number;             // Effective curvature along racing line
  width: number;                 // Track road width
  targetSpeed: number;           // Optimal cornering / straight target speed (m/s)
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
    const count = sampler.totalSamples;
    const rawOffsets: number[] = new Array(count).fill(0);

    // 1. First pass: Determine signed curvature and apex offsets (Outside -> Inside -> Outside)
    for (let i = 0; i < count; i++) {
      const curr = sampler.samples[i];
      const next = sampler.samples[(i + 1) % count];

      // Cross product of horizontal tangents to detect left (+) vs right (-) turn
      const crossY = curr.tangent.z * next.tangent.x - curr.tangent.x * next.tangent.z;
      const signedCurv = crossY * 45.0; // Positive = left turn, Negative = right turn

      const roadHalf = (curr.width * 0.5) - 1.2; // Safe asphalt margin
      const maxOffset = Math.max(1.0, Math.min(3.8, roadHalf * 0.70));

      // Check upcoming curvature ~20-30m ahead for corner entry positioning
      const lookIdx = (i + Math.round(count * 0.035)) % count;
      const lookSample = sampler.samples[lookIdx];
      const lookCrossY = curr.tangent.z * lookSample.tangent.x - curr.tangent.x * lookSample.tangent.z;

      let targetOffset = 0;
      if (Math.abs(curr.curvature) > 0.012) {
        // At corner apex: hug inside of the turn
        // Left turn (crossY > 0) -> hug left (-bankedRight)
        // Right turn (crossY < 0) -> hug right (+bankedRight)
        targetOffset = signedCurv > 0 ? -maxOffset * 0.85 : maxOffset * 0.85;
      } else if (Math.abs(lookCrossY) > 0.015) {
        // On approach to corner: position on outside of upcoming turn
        targetOffset = lookCrossY > 0 ? maxOffset * 0.75 : -maxOffset * 0.75;
      }

      rawOffsets[i] = Math.max(-roadHalf, Math.min(roadHalf, targetOffset));
    }

    // 2. Cyclic Gaussian Smoothing Filter over racing line lateral offsets
    const smoothedOffsets: number[] = new Array(count).fill(0);
    const kernelRadius = 14;
    for (let i = 0; i < count; i++) {
      let sum = 0;
      let weightSum = 0;
      for (let k = -kernelRadius; k <= kernelRadius; k++) {
        const idx = (i + k + count) % count;
        // Gaussian weight
        const w = Math.exp(-(k * k) / (2 * 5.0 * 5.0));
        sum += rawOffsets[idx] * w;
        weightSum += w;
      }
      const roadHalf = (sampler.samples[i].width * 0.5) - 1.1;
      smoothedOffsets[i] = Math.max(-roadHalf, Math.min(roadHalf, sum / weightSum));
    }

    // 3. Compute 3D racing line positions, tangents, and effective curvatures
    const maxSpeed = 86.0;       // ~310 km/h top straight speed
    const minCornerSpeed = 16.0; // ~58 km/h hairpin minimum
    const baseLatAccel = 14.8;   // m/s² base mechanical tire grip (~1.51G)

    for (let i = 0; i < count; i++) {
      const s = sampler.samples[i];
      const lat = smoothedOffsets[i];

      // Position shifted along bankedRight
      const racingPos = new THREE.Vector3()
        .copy(s.position)
        .addScaledVector(s.bankedRight, lat);

      // Compute smoothed tangent along racing line
      const nextIdx = (i + 1) % count;
      const prevIdx = (i - 1 + count) % count;
      const nextSample = sampler.samples[nextIdx];
      const prevSample = sampler.samples[prevIdx];

      const nextPos = new THREE.Vector3().copy(nextSample.position).addScaledVector(nextSample.bankedRight, smoothedOffsets[nextIdx]);
      const prevPos = new THREE.Vector3().copy(prevSample.position).addScaledVector(prevSample.bankedRight, smoothedOffsets[prevIdx]);

      const racingTan = new THREE.Vector3().subVectors(nextPos, prevPos).normalize();
      if (racingTan.lengthSq() < 0.001) {
        racingTan.copy(s.tangent);
      }

      // Curvature along optimized line is reduced by wider radius
      const effCurv = Math.max(0.00008, s.curvature * 0.68);
      // Aerodynamic downforce adds lateral grip in high-speed sweepers (up to 18.5 m/s² / 1.88G)
      const aeroGripBonus = Math.min(3.8, 3.8 / (effCurv * 80.0 + 1.0));
      const totalLatAccel = baseLatAccel + aeroGripBonus;

      const rawCornerSpeed = Math.sqrt(totalLatAccel / effCurv);
      const cornerSpeed = Math.max(minCornerSpeed, Math.min(maxSpeed, rawCornerSpeed));

      this.points.push({
        index: i,
        distance: s.distance,
        position: racingPos,
        centerPosition: s.position.clone(),
        tangent: racingTan,
        normal: s.bankedRight.clone(),
        lateralOffset: lat,
        curvature: effCurv,
        width: s.width,
        targetSpeed: cornerSpeed
      });
    }

    // 4. Backward pass: carbon-ceramic threshold braking anticipation (12.8 m/s² / 1.30G)
    const maxBrakeAccel = 12.8;
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

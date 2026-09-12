import * as THREE from 'three';
import { AIRacingLine, AIRacingPoint } from './AIRacingLine';

export interface AITarget {
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  lookAheadDistance: number;
  targetSpeed: number;
}

export class AITargeting {
  private baseLookAhead: number = 8.0;
  private speedFactor: number = 0.35;
  private minLookAhead: number = 9.0;
  private maxLookAhead: number = 42.0;

  private _scratchTarget: THREE.Vector3 = new THREE.Vector3();

  public getTarget(
    racingLine: AIRacingLine,
    currentDistance: number,
    forwardSpeed: number,
    lateralOffset: number = 0,
    difficultyLookAheadFactor: number = 1.0
  ): AITarget {
    // 1. Dynamic Look-ahead Distance based on speed and upcoming track curvature
    const baseSpeedL = (this.baseLookAhead + Math.max(0, forwardSpeed) * this.speedFactor) * difficultyLookAheadFactor;

    // Sample local and upcoming curvature along track
    const localPoint = racingLine.getPointAtDistance(currentDistance);
    const probeDist = currentDistance + baseSpeedL * 0.65;
    const probePoint = racingLine.getPointAtDistance(probeDist);
    const maxUpcomingCurvature = Math.max(localPoint.curvature, probePoint.curvature);

    // Tight corners (high curvature) reduce look-ahead so AI adheres to apex rather than cutting early
    const curvatureFactor = 1.0 / (1.0 + maxUpcomingCurvature * 28.0);
    const rawL = baseSpeedL * curvatureFactor;
    const effectiveMin = Math.max(5.5, this.minLookAhead * curvatureFactor);
    const lookAheadDistance = Math.max(effectiveMin, Math.min(this.maxLookAhead, rawL));

    // 2. Query racing point at look-ahead distance
    const targetPoint: AIRacingPoint = racingLine.getPointAtDistance(currentDistance + lookAheadDistance);

    // 3. Apply lateral offset (driver preference + collision avoidance) perpendicular to track tangent
    this._scratchTarget.copy(targetPoint.position);
    if (Math.abs(lateralOffset) > 0.01) {
      // Perpendicular vector to tangent in horizontal plane
      const rightX = -targetPoint.tangent.z;
      const rightZ = targetPoint.tangent.x;
      this._scratchTarget.x += rightX * lateralOffset;
      this._scratchTarget.z += rightZ * lateralOffset;
    }

    return {
      position: this._scratchTarget.clone(),
      tangent: targetPoint.tangent,
      lookAheadDistance,
      targetSpeed: targetPoint.targetSpeed
    };
  }
}

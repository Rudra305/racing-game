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
    // 1. Dynamic Look-ahead Distance based on speed
    const rawL = (this.baseLookAhead + Math.max(0, forwardSpeed) * this.speedFactor) * difficultyLookAheadFactor;
    const lookAheadDistance = Math.max(this.minLookAhead, Math.min(this.maxLookAhead, rawL));

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

import * as THREE from 'three';
import { AIRacingLine, AIRacingPoint } from './AIRacingLine';

export interface AITarget {
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  normal: THREE.Vector3;
  lookAheadDistance: number;
  targetSpeed: number;
}

export class AITargeting {
  private baseLookAhead: number = 12.0;
  private speedFactor: number = 0.45;
  private minLookAhead: number = 12.0;
  private maxLookAhead: number = 48.0;

  private _scratchTarget: THREE.Vector3 = new THREE.Vector3();
  private readonly _targetResult: AITarget = {
    position: new THREE.Vector3(),
    tangent: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    lookAheadDistance: 12.0,
    targetSpeed: 0
  };

  public getTarget(
    racingLine: AIRacingLine,
    currentDistance: number,
    forwardSpeed: number,
    lateralOffset: number = 0,
    difficultyLookAheadFactor: number = 1.0
  ): AITarget {
    // 1. Dynamic Look-ahead Distance scaled to current speed and upcoming track curvature
    const baseSpeedL = (this.baseLookAhead + Math.max(0, forwardSpeed) * this.speedFactor) * difficultyLookAheadFactor;

    // Sample local and upcoming curvature along track
    const localPoint = racingLine.getPointAtDistance(currentDistance);
    const probeDist = currentDistance + baseSpeedL * 0.65;
    const probePoint = racingLine.getPointAtDistance(probeDist);
    const maxUpcomingCurvature = Math.max(localPoint.curvature, probePoint.curvature);

    // Tight corners gently tighten look-ahead so AI adheres to apex rather than cutting early,
    // but never collapse below minLookAhead (12m) to prevent high-speed twitchiness.
    const curvatureFactor = 1.0 / (1.0 + maxUpcomingCurvature * 14.0);
    const rawL = baseSpeedL * curvatureFactor;
    const lookAheadDistance = Math.max(this.minLookAhead, Math.min(this.maxLookAhead, rawL));

    // 2. Query racing point at look-ahead distance
    const targetPoint: AIRacingPoint = racingLine.getPointAtDistance(currentDistance + lookAheadDistance);

    // 3. Apply lateral offset (driver style + collision avoidance) along the track's normal (bankedRight)
    this._scratchTarget.copy(targetPoint.position);
    if (Math.abs(lateralOffset) > 0.01) {
      this._scratchTarget.addScaledVector(targetPoint.normal, lateralOffset);
    }

    this._targetResult.position.copy(this._scratchTarget);
    this._targetResult.tangent = targetPoint.tangent;
    this._targetResult.normal = targetPoint.normal;
    this._targetResult.lookAheadDistance = lookAheadDistance;
    this._targetResult.targetSpeed = targetPoint.targetSpeed;
    return this._targetResult;
  }
}

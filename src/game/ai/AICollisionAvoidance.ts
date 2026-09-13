import * as THREE from 'three';

export interface NearbyVehicleInfo {
  position: THREE.Vector3;
  forwardSpeed: number;
  distanceAlongTrack: number;
  lateralDist: number;
}

export interface AvoidanceOutput {
  lateralOffset: number;
  speedMultiplier: number;
}

export class AICollisionAvoidance {
  private smoothedOffset: number = 0;

  public reset(): void {
    this.smoothedOffset = 0;
  }

  public computeAvoidance(
    _myPos: THREE.Vector3,
    myDistance: number,
    myLateralDist: number,
    trackHalfWidth: number,
    trackLength: number,
    otherVehicles: NearbyVehicleInfo[],
    overtakeAggression: number = 0.7,
    dt: number = 0.06
  ): AvoidanceOutput {
    let targetOffset = 0;
    let speedMultiplier = 1.0;

    // Usable road boundaries leaving safety margin from kerbs/barriers
    const safeMargin = 1.35;
    const maxAllowedLateral = Math.max(1.0, trackHalfWidth - safeMargin);

    for (const other of otherVehicles) {
      // Longitudinal distance ahead along the circuit
      let distAhead = other.distanceAlongTrack - myDistance;
      if (distAhead < -trackLength * 0.5) distAhead += trackLength;
      if (distAhead > trackLength * 0.5) distAhead -= trackLength;

      // 1. Forward radar: vehicle ahead in braking / drafting zone (1.0m to 22.0m)
      if (distAhead > 0.8 && distAhead < 22.0) {
        const lateralDelta = other.lateralDist - myLateralDist;
        const inCorridor = Math.abs(lateralDelta) < 2.5;

        if (inCorridor) {
          // Speed matching: smoothly match speed if closing in too quickly
          const safeSpeedRatio = Math.max(0.65, distAhead / 18.0);
          speedMultiplier = Math.min(speedMultiplier, safeSpeedRatio);

          // Evaluate which side has more clear asphalt to pass
          const spaceLeft = myLateralDist - (-maxAllowedLateral);
          const spaceRight = maxAllowedLateral - myLateralDist;

          // Higher overtakeAggression prioritizes passing over cautious following
          const passOffset = 1.8 * Math.min(1.2, 0.6 + overtakeAggression * 0.6);
          if (spaceRight > spaceLeft && spaceRight > 1.8) {
            targetOffset += passOffset;
          } else if (spaceLeft > 1.8) {
            targetOffset -= passOffset;
          } else {
            // Narrow section: stay behind and slipstream safely
            targetOffset += spaceRight > spaceLeft ? 0.8 : -0.8;
          }
        }
      }

      // 2. Side-by-side radar: vehicles abreast (-3.5m to +3.5m)
      if (Math.abs(distAhead) < 4.0) {
        const sideDelta = other.lateralDist - myLateralDist;
        if (Math.abs(sideDelta) < 2.8) {
          // Gentle lateral cushion away from adjacent car
          const cushion = (2.8 - Math.abs(sideDelta)) * 0.75;
          targetOffset += sideDelta > 0 ? -cushion : cushion;
        }
      }
    }

    // 3. Absolute boundary clamping: NEVER allow avoidance to push car into a wall
    const projectedLateral = myLateralDist + targetOffset;
    if (projectedLateral > maxAllowedLateral) {
      targetOffset = maxAllowedLateral - myLateralDist;
    } else if (projectedLateral < -maxAllowedLateral) {
      targetOffset = -maxAllowedLateral - myLateralDist;
    }

    // Clamp total dynamic offset range
    targetOffset = Math.max(-2.6, Math.min(2.6, targetOffset));

    // 4. Smooth temporal filter (3.8 rad/s) prevents jerky steering oscillation
    const blend = 1.0 - Math.exp(-4.2 * dt);
    this.smoothedOffset += (targetOffset - this.smoothedOffset) * blend;

    return {
      lateralOffset: this.smoothedOffset,
      speedMultiplier
    };
  }
}

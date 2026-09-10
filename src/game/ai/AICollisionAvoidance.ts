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
  public computeAvoidance(
    _myPos: THREE.Vector3,
    myDistance: number,
    myLateralDist: number,
    trackLength: number,
    otherVehicles: NearbyVehicleInfo[]
  ): AvoidanceOutput {
    let desiredOffset = 0;
    let speedMultiplier = 1.0;

    for (const other of otherVehicles) {
      // Longitudinal distance ahead
      let distAhead = other.distanceAlongTrack - myDistance;
      if (distAhead < -trackLength * 0.5) distAhead += trackLength;
      if (distAhead > trackLength * 0.5) distAhead -= trackLength;

      // 1. Vehicle directly ahead in braking/following zone (0m to 14m)
      if (distAhead > 0.8 && distAhead < 14.0) {
        const lateralDelta = other.lateralDist - myLateralDist;
        if (Math.abs(lateralDelta) < 2.4) {
          // In our path: slow down and plan pass to the more open side
          speedMultiplier = Math.min(speedMultiplier, Math.max(0.4, distAhead / 14.0));
          // Steer away from other car
          desiredOffset += lateralDelta > 0 ? -1.4 : 1.4;
        }
      }

      // 2. Vehicle abreast / side-by-side (-3.0m to +3.0m)
      if (Math.abs(distAhead) < 3.8) {
        const sideDelta = other.lateralDist - myLateralDist;
        if (Math.abs(sideDelta) < 2.6) {
          // Push slightly away
          desiredOffset += sideDelta > 0 ? -1.0 : 1.0;
        }
      }
    }

    return {
      lateralOffset: Math.max(-2.5, Math.min(2.5, desiredOffset)),
      speedMultiplier
    };
  }
}

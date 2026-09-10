import * as THREE from 'three';

export class AISteering {
  private currentSteer: number = 0;

  public reset(): void {
    this.currentSteer = 0;
  }

  /**
   * Computes steering input [-1.0 (right) to +1.0 (left)] toward look-ahead target.
   */
  public computeSteering(
    carPosition: THREE.Vector3,
    carHeading: number,
    targetPosition: THREE.Vector3,
    smoothingFactor: number,
    dt: number
  ): number {
    // 1. Vector from car to look-ahead target in horizontal plane
    const dx = targetPosition.x - carPosition.x;
    const dz = targetPosition.z - carPosition.z;

    if (dx * dx + dz * dz < 0.25) {
      return this.currentSteer;
    }

    // 2. Desired heading angle in world space (yaw angle where 0 = +Z, PI/2 = +X)
    const desiredHeading = Math.atan2(dx, dz);

    // 3. Smallest signed angle difference in [-PI, PI]
    let headingError = desiredHeading - carHeading;
    while (headingError > Math.PI) headingError -= Math.PI * 2;
    while (headingError < -Math.PI) headingError += Math.PI * 2;

    // Note: In our vehicle physics, positive steerInput steers LEFT (+yaw), negative steers RIGHT (-yaw)
    // Positive headingError means target is to our left -> steer positive
    const pGain = 2.2;
    const rawTargetSteer = Math.max(-1.0, Math.min(1.0, headingError * pGain));

    // 4. Rate limiting / smoothing to prevent oscillation
    const blend = Math.min(1.0, dt * smoothingFactor);
    this.currentSteer += (rawTargetSteer - this.currentSteer) * blend;

    return this.currentSteer;
  }
}

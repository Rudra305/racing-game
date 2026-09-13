import * as THREE from 'three';

export interface AISteeringParams {
  pGain: number;
  dGain: number;
  crossTrackGain: number;
  smoothingRate: number;
}

export class AISteering {
  private currentSteer: number = 0;

  public reset(): void {
    this.currentSteer = 0;
  }

  /**
   * Stanley Path Tracking Controller with Cross-Track Error & Yaw-Rate Damping.
   *
   * Formulated specifically for our vehicle physics coordinate system:
   * - Positive steer input (+yaw) steers LEFT.
   * - Negative steer input (-yaw) steers RIGHT.
   * - Yaw rate is in rad/s (+yaw rate is turning left).
   */
  public computeSteering(
    carPosition: THREE.Vector3,
    carHeading: number,
    carForwardSpeed: number,
    carYawRate: number,
    targetPosition: THREE.Vector3,
    _targetTangent: THREE.Vector3,
    targetNormal: THREE.Vector3,
    params: AISteeringParams,
    dt: number
  ): number {
    // 1. Vector from car to look-ahead target in horizontal plane
    const dx = targetPosition.x - carPosition.x;
    const dz = targetPosition.z - carPosition.z;
    const distSq = dx * dx + dz * dz;

    if (distSq < 0.09) {
      return this.currentSteer;
    }

    // 2. Heading alignment to target direction
    const desiredHeading = Math.atan2(dx, dz);
    let headingError = desiredHeading - carHeading;
    while (headingError > Math.PI) headingError -= Math.PI * 2;
    while (headingError < -Math.PI) headingError += Math.PI * 2;

    // 3. Cross-Track Error (lateral distance from vehicle to racing line)
    // Vector from target to car:
    const toCarX = carPosition.x - targetPosition.x;
    const toCarZ = carPosition.z - targetPosition.z;
    // Dot with targetNormal (bankedRight)
    const crossTrackError = toCarX * targetNormal.x + toCarZ * targetNormal.z;

    // Stanley non-linear lateral correction:
    // If car is to the right of racing line (crossTrackError > 0), steer left (+);
    // If car is to the left (crossTrackError < 0), steer right (-).
    const speed = Math.max(0.5, Math.abs(carForwardSpeed));
    const crossTrackCorrection = Math.atan2(
      -crossTrackError * params.crossTrackGain,
      speed + 3.0
    );

    // 4. Combined Stanley control law:
    // P-term on heading error + cross-track correction - D-term on vehicle yaw rate
    const pTerm = headingError * params.pGain;
    const dTerm = carYawRate * params.dGain; // Damps rapid spinning and fishtailing

    let rawSteer = pTerm + crossTrackCorrection - dTerm;

    // Clamp to valid physical steering input range [-1.0, 1.0]
    rawSteer = Math.max(-1.0, Math.min(1.0, rawSteer));

    // 5. Rate-limiting exponential filter to model steering rack inertia
    const rate = Math.max(6.0, params.smoothingRate);
    const blend = 1.0 - Math.exp(-rate * dt);
    this.currentSteer += (rawSteer - this.currentSteer) * blend;

    // Clean zero snap when centering on straight
    if (Math.abs(this.currentSteer) < 0.001 && Math.abs(rawSteer) < 0.005) {
      this.currentSteer = 0;
    }

    return this.currentSteer;
  }
}

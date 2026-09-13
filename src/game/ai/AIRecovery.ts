import { TrackSampler, TrackSample } from '../../tracks/TrackSampler';
import { VehiclePhysics } from '../../physics/VehiclePhysics';

export enum AIRecoveryState {
  NONE = 'NONE',
  REVERSING = 'REVERSING',
  REALIGNING = 'REALIGNING'
}

export class AIRecovery {
  public state: AIRecoveryState = AIRecoveryState.NONE;
  private stuckTimer: number = 0;
  private recoveryDuration: number = 0;
  private totalStuckDuration: number = 0;

  public reset(): void {
    this.state = AIRecoveryState.NONE;
    this.stuckTimer = 0;
    this.recoveryDuration = 0;
    this.totalStuckDuration = 0;
  }

  public update(
    physics: VehiclePhysics,
    sampler: TrackSampler,
    recoverySpeedFactor: number = 1.0,
    dt: number = 0.06
  ): { isRecovering: boolean; throttle: number; brake: number; steer: number } {
    const speed = Math.abs(physics.forwardSpeed);
    const pos = physics.position;

    // 1. Closest track sample and tangent
    const closestSample: TrackSample = sampler.findClosestSample(pos, physics.closestSampleIndex);
    const trackTangent = closestSample.tangent;
    const carHeading = physics.heading;

    // Alignment with track flow (dot product of forward vectors)
    const carForwardX = Math.sin(carHeading);
    const carForwardZ = Math.cos(carHeading);
    const alignment = carForwardX * trackTangent.x + carForwardZ * trackTangent.z;

    const isFacingBackwards = alignment < -0.15; // Angle > 98 degrees from track direction
    const isStalled = speed < 1.4;
    const isOffTrack = Math.abs(physics.trackLateralDist) > (physics.trackHalfWidth + 1.8);

    // Track heading in radians
    const trackAngle = Math.atan2(trackTangent.x, trackTangent.z);
    let headingError = trackAngle - carHeading;
    while (headingError > Math.PI) headingError -= Math.PI * 2;
    while (headingError < -Math.PI) headingError += Math.PI * 2;

    // Fail-safe: If trapped in geometry or off-track for > 5.0 seconds, smoothly reset to track centerline
    if (isStalled && (isOffTrack || isFacingBackwards)) {
      this.totalStuckDuration += dt;
      if (this.totalStuckDuration > 4.8) {
        // Reset directly onto track centerline with forward orientation
        const safeRespawnPos = closestSample.position.clone();
        safeRespawnPos.y += 0.25;
        physics.setSpawn(safeRespawnPos, trackAngle);
        physics.forwardSpeed = 8.0; // Rolling restart
        this.reset();
        return { isRecovering: false, throttle: 0.8, brake: 0, steer: 0 };
      }
    } else {
      this.totalStuckDuration = Math.max(0, this.totalStuckDuration - dt * 1.5);
    }

    if (this.state === AIRecoveryState.NONE) {
      if ((isStalled && isFacingBackwards) || (isStalled && isOffTrack && this.stuckTimer > 1.2)) {
        this.stuckTimer += dt;
        if (this.stuckTimer > 1.4) {
          this.state = AIRecoveryState.REVERSING;
          this.recoveryDuration = 1.0 / recoverySpeedFactor;
        }
      } else if (isStalled) {
        this.stuckTimer += dt;
      } else {
        this.stuckTimer = Math.max(0, this.stuckTimer - dt * 2.5);
      }

      return { isRecovering: false, throttle: 0, brake: 0, steer: 0 };
    }

    // 2. Active Recovery State Machine
    this.recoveryDuration -= dt;

    if (this.state === AIRecoveryState.REVERSING) {
      if (this.recoveryDuration <= 0 || alignment > 0.3) {
        this.state = AIRecoveryState.REALIGNING;
        this.recoveryDuration = 1.2 / recoverySpeedFactor;
      }

      // In reverse, steering opposite to headingError rotates car nose toward the track heading
      const reverseSteer = headingError > 0 ? -0.85 : 0.85;

      return {
        isRecovering: true,
        throttle: 0,
        brake: 0.85, // S/Brake engages reverse when stationary
        steer: reverseSteer
      };
    }

    if (this.state === AIRecoveryState.REALIGNING) {
      if (this.recoveryDuration <= 0 || (alignment > 0.75 && !isOffTrack)) {
        this.state = AIRecoveryState.NONE;
        this.stuckTimer = 0;
      }

      // Drive forward, steering directly toward track flow and centerline
      const toCenterX = closestSample.position.x - pos.x;
      const toCenterZ = closestSample.position.z - pos.z;
      const targetAngle = Math.atan2(
        trackTangent.x * 8.0 + toCenterX,
        trackTangent.z * 8.0 + toCenterZ
      );

      let realignError = targetAngle - carHeading;
      while (realignError > Math.PI) realignError -= Math.PI * 2;
      while (realignError < -Math.PI) realignError += Math.PI * 2;

      const steer = Math.max(-1.0, Math.min(1.0, realignError * 2.2));

      return {
        isRecovering: true,
        throttle: 0.65 * recoverySpeedFactor,
        brake: 0,
        steer
      };
    }

    return { isRecovering: false, throttle: 0, brake: 0, steer: 0 };
  }
}

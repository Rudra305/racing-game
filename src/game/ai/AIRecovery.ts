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

  public reset(): void {
    this.state = AIRecoveryState.NONE;
    this.stuckTimer = 0;
    this.recoveryDuration = 0;
  }

  public update(
    physics: VehiclePhysics,
    sampler: TrackSampler,
    dt: number
  ): { isRecovering: boolean; throttle: number; brake: number; steer: number } {
    const speed = Math.abs(physics.forwardSpeed);
    const pos = physics.position;

    // 1. Detect if vehicle is stuck or facing backwards
    const closestSample: TrackSample = sampler.findClosestSample(pos);
    const trackTangent = closestSample.tangent;
    const carHeading = physics.heading;

    // Car forward vector
    const carForwardX = Math.sin(carHeading);
    const carForwardZ = Math.cos(carHeading);
    const alignment = carForwardX * trackTangent.x + carForwardZ * trackTangent.z;

    const isFacingBackwards = alignment < -0.2; // Angle > 100 degrees from track direction
    const isStalled = speed < 1.8;
    const isVeryFarOff = Math.abs(physics.trackLateralDist) > (physics.trackHalfWidth + 12.0);

    if (this.state === AIRecoveryState.NONE) {
      if ((isStalled && (isFacingBackwards || isVeryFarOff)) || (isStalled && this.stuckTimer > 2.2)) {
        this.stuckTimer += dt;
        if (this.stuckTimer > 2.5) {
          // Enter reverse recovery phase
          this.state = AIRecoveryState.REVERSING;
          this.recoveryDuration = 1.4;
        }
      } else if (isStalled) {
        this.stuckTimer += dt;
      } else {
        this.stuckTimer = Math.max(0, this.stuckTimer - dt * 2.0);
      }

      return { isRecovering: false, throttle: 0, brake: 0, steer: 0 };
    }

    // 2. Active Recovery State Machine
    this.recoveryDuration -= dt;

    if (this.state === AIRecoveryState.REVERSING) {
      if (this.recoveryDuration <= 0) {
        this.state = AIRecoveryState.REALIGNING;
        this.recoveryDuration = 1.2;
      }

      // Reverse with opposite steer
      return {
        isRecovering: true,
        throttle: 0,
        brake: 0.85, // S/Brake acts as reverse when stationary in drivetrain
        steer: alignment < 0 ? 0.7 : -0.7
      };
    }

    if (this.state === AIRecoveryState.REALIGNING) {
      if (this.recoveryDuration <= 0 || alignment > 0.5) {
        this.state = AIRecoveryState.NONE;
        this.stuckTimer = 0;
      }

      // Drive forward toward track tangent
      return {
        isRecovering: true,
        throttle: 0.6,
        brake: 0,
        steer: 0
      };
    }

    return { isRecovering: false, throttle: 0, brake: 0, steer: 0 };
  }
}

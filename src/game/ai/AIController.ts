import { AIRacingLine } from './AIRacingLine';
import { AITargeting } from './AITargeting';
import { AISteering } from './AISteering';
import { AISpeedController } from './AISpeedController';
import { AIRecovery } from './AIRecovery';
import { AICollisionAvoidance, NearbyVehicleInfo } from './AICollisionAvoidance';
import { AIDifficultyProfile } from './AIDifficulty';
import { VehiclePhysics } from '../../physics/VehiclePhysics';
import { TrackSampler } from '../../tracks/TrackSampler';

export class AIController {
  private targeting: AITargeting = new AITargeting();
  private steering: AISteering = new AISteering();
  private speedController: AISpeedController = new AISpeedController();
  private recovery: AIRecovery = new AIRecovery();
  private avoidance: AICollisionAvoidance = new AICollisionAvoidance();

  // Driver personalized line preference
  public driverLineOffset: number = 0;
  private isEnabled: boolean = false;

  constructor(lineOffset: number = 0) {
    this.driverLineOffset = lineOffset;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public reset(): void {
    this.steering.reset();
    this.speedController.reset();
    this.recovery.reset();
  }

  /**
   * Evaluates AI decisions and sets throttle, brake, steer inputs on the vehicle physics.
   */
  public updateDecision(
    physics: VehiclePhysics,
    racingLine: AIRacingLine,
    sampler: TrackSampler,
    profile: AIDifficultyProfile,
    nearbyVehicles: NearbyVehicleInfo[],
    dt: number
  ): void {
    if (!this.isEnabled) {
      physics.setInputs(0, 0, 0, false);
      return;
    }

    // 1. Check recovery state
    const recoveryResult = this.recovery.update(physics, sampler, dt);
    if (recoveryResult.isRecovering) {
      physics.setInputs(
        recoveryResult.throttle,
        recoveryResult.brake,
        recoveryResult.steer,
        false
      );
      return;
    }

    // 2. Collision avoidance
    const avoidanceOut = this.avoidance.computeAvoidance(
      physics.position,
      physics.trackDistance,
      physics.trackLateralDist,
      sampler.totalLength,
      nearbyVehicles
    );

    // 3. Look-ahead targeting
    const totalLateralOffset = (this.driverLineOffset * profile.lineOffsetMax) + avoidanceOut.lateralOffset;
    const target = this.targeting.getTarget(
      racingLine,
      physics.trackDistance,
      physics.forwardSpeed,
      totalLateralOffset,
      profile.lookAheadFactor
    );

    // 4. Steering computation
    const steer = this.steering.computeSteering(
      physics.position,
      physics.heading,
      target.position,
      profile.steeringSmoothing,
      dt
    );

    // 5. Speed computation with anticipatory corner braking
    const localPoint = racingLine.getPointAtDistance(physics.trackDistance);
    // Take minimum of local envelope speed (anticipates upcoming braking points) and look-ahead speed
    const safeTargetSpeed = Math.min(localPoint.targetSpeed, target.targetSpeed);
    const adjustedTargetSpeed = safeTargetSpeed * profile.targetSpeedFactor * avoidanceOut.speedMultiplier;
    const speedControls = this.speedController.computeControls(
      physics.forwardSpeed,
      adjustedTargetSpeed,
      profile.brakingAggression,
      physics.isOffRoad,
      dt
    );

    // Modulate corner exit throttle: smoothly ramp throttle as wheel straightens
    let finalThrottle = speedControls.throttle;
    if (Math.abs(steer) > 0.48 && physics.forwardSpeed > 14.0) {
      finalThrottle *= 0.82; // Balance car mid-corner
    } else if (Math.abs(steer) < 0.22 && speedControls.throttle > 0.15) {
      finalThrottle = Math.min(1.0, finalThrottle * profile.cornerExitAggression);
    }

    // 6. Set inputs directly on existing VehiclePhysics
    physics.setInputs(
      finalThrottle,
      speedControls.brake,
      steer,
      false
    );
  }
}

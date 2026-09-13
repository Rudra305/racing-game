import { AIRacingLine } from './AIRacingLine';
import { AITargeting } from './AITargeting';
import { AISteering, AISteeringParams } from './AISteering';
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
  private errorTimer: number = 0;
  private currentError: number = 0;

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
    this.avoidance.reset();
    this.errorTimer = 0;
    this.currentError = 0;
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

    // 2. Collision avoidance with road boundary protection
    const avoidanceOut = this.avoidance.computeAvoidance(
      physics.position,
      physics.trackDistance,
      physics.trackLateralDist,
      physics.trackHalfWidth,
      sampler.totalLength,
      nearbyVehicles,
      profile.overtakeAggression,
      dt
    );

    // 3. Subtle human variance error model (active on easier difficulties)
    this.errorTimer += dt;
    if (this.errorTimer > 1.2) {
      this.errorTimer = 0;
      if (Math.random() < profile.errorProbability) {
        this.currentError = (Math.random() * 2.0 - 1.0) * profile.errorIntensity;
      } else {
        this.currentError *= 0.5;
      }
    }

    // 4. Look-ahead targeting along optimized racing line
    const driverOffset = (this.driverLineOffset * profile.lineOffsetMax * (1.0 - profile.apexStrictness * 0.5));
    const totalLateralOffset = driverOffset + avoidanceOut.lateralOffset + this.currentError;

    const target = this.targeting.getTarget(
      racingLine,
      physics.trackDistance,
      physics.forwardSpeed,
      totalLateralOffset,
      profile.lookAheadFactor
    );

    // 5. Stanley path tracking steering with yaw damping
    const steerParams: AISteeringParams = {
      pGain: profile.steeringP,
      dGain: profile.steeringD,
      crossTrackGain: profile.crossTrackK,
      smoothingRate: profile.steeringSmoothing
    };

    const steer = this.steering.computeSteering(
      physics.position,
      physics.heading,
      physics.forwardSpeed,
      physics.yawRate,
      target.position,
      target.tangent,
      target.normal,
      steerParams,
      dt
    );

    // 6. Dynamic speed control along racing line scaled with vehicle's actual grip physics
    const localPoint = racingLine.getPointAtDistance(physics.trackDistance);
    const carGripRatio = (physics.config.handling?.baseGrip ?? 28.0) / 28.0;
    let envelopeSpeed = localPoint.targetSpeed * Math.sqrt(carGripRatio);

    // Driver skill braking anticipation:
    // Earlier braking anticipation on easier difficulties; threshold braking on Hard/Expert
    if (profile.brakingDistanceMultiplier > 1.0) {
      const marginDist = Math.min(24.0, Math.abs(physics.forwardSpeed) * 0.45 * (profile.brakingDistanceMultiplier - 1.0));
      const lookaheadPoint = racingLine.getPointAtDistance(physics.trackDistance + marginDist);
      envelopeSpeed = Math.min(envelopeSpeed, lookaheadPoint.targetSpeed * Math.sqrt(carGripRatio));
    }

    const targetSpeed = envelopeSpeed * profile.targetSpeedFactor * avoidanceOut.speedMultiplier;

    const speedControls = this.speedController.computeControls(
      physics.forwardSpeed,
      targetSpeed,
      profile.brakingAggression,
      physics.isOffRoad,
      dt
    );

    // 7. Modulate corner exit throttle: full commitment on exit
    let finalThrottle = speedControls.throttle;
    const isExtremeSlide = Math.abs(physics.lateralG) > 1.6 && Math.abs(steer) > 0.55;
    if (isExtremeSlide && physics.forwardSpeed > 20.0) {
      finalThrottle *= 0.85; // Modulate only during excessive lateral slip to avoid spinout
    } else if (Math.abs(steer) < 0.35 && speedControls.throttle > 0.10) {
      finalThrottle = Math.min(1.0, finalThrottle * profile.cornerExitAggression * 1.15);
    }

    // 8. Set inputs directly on existing VehiclePhysics
    physics.setInputs(
      finalThrottle,
      speedControls.brake,
      steer,
      false
    );
  }
}

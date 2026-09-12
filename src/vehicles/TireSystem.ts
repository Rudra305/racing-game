import { VehicleConfig } from './VehicleConfig';
import { WheelSuspensionState } from './SuspensionSystem';

export interface TireForces {
  totalDriveForce: number;
  totalBrakeForce: number;
  lateralForce: number;
  aligningTorque: number;
  slipAngle: number;
  isDrifting: boolean;
}

export class TireSystem {
  private config: VehicleConfig;

  // Drift State
  public isDrifting: boolean = false;
  public driftAngle: number = 0; // degrees
  public driftTime: number = 0;

  constructor(config: VehicleConfig) {
    this.config = config;
  }

  public setConfig(config: VehicleConfig): void {
    this.config = config;
    this.reset();
  }

  public reset(): void {
    this.isDrifting = false;
    this.driftAngle = 0;
    this.driftTime = 0;
  }

  /**
   * Computes tire forces using a simplified Pacejka-inspired friction ellipse model.
   */
  public calculateTireForces(
    dt: number,
    forwardSpeed: number,
    lateralSpeed: number,
    yawRate: number,
    steerAngle: number,
    requestedDriveForce: number,
    brakeInput: number,
    handbrake: boolean,
    surfaceGrip: number,
    suspensionWheels: WheelSuspensionState[]
  ): TireForces {
    const cfg = this.config;
    const absSpeed = Math.abs(forwardSpeed);

    // 1. Slip Angles (Front & Rear)
    const Lf = cfg.dimensions.wheelBase * 0.5;
    const Lr = cfg.dimensions.wheelBase * 0.5;

    // Front tire lateral velocity includes yaw rotation & steer angle
    const vLatFront = lateralSpeed + yawRate * Lf;
    const vLatRear = lateralSpeed - yawRate * Lr;

    // Slip angle alpha = atan(vLat / vLong) - steerAngle
    const safeLongSpeed = Math.max(1.0, absSpeed);
    const alphaFront = Math.atan2(vLatFront, safeLongSpeed) - steerAngle;
    const alphaRear = Math.atan2(vLatRear, safeLongSpeed);

    // Average body slip angle for telemetry and drift detection
    const overallSlipAngle = Math.atan2(lateralSpeed, safeLongSpeed);
    this.driftAngle = Math.abs(overallSlipAngle * (180 / Math.PI));

    // 2. Normal Loads from Suspension (Front & Rear)
    const fzFront = (suspensionWheels[0].normalForce + suspensionWheels[1].normalForce);
    const fzRear = (suspensionWheels[2].normalForce + suspensionWheels[3].normalForce);
    const fzTotal = fzFront + fzRear;

    // 3. Longitudinal Drive & Brake Distribution
    let driveForce = requestedDriveForce;
    let brakeForce = 0;

    // Normal load with baseline static vehicle weight
    const baseWeight = cfg.mass * 9.81;
    const effectiveNormalLoad = Math.max(fzTotal, baseWeight);

    // Friction coefficient scaled with vehicle handling grip tier
    const muBraking = (cfg.handling.baseGrip / 26.0) * 1.15;
    const maxBrakingTraction = effectiveNormalLoad * muBraking * surfaceGrip;

    if (brakeInput > 0) {
      const demandedBrake = brakeInput * cfg.braking.brakePower * 220.0;
      brakeForce = Math.min(maxBrakingTraction, demandedBrake);
    }

    // 4. Lateral Grip & Cornering Stiffness
    let frontGripFactor = cfg.handling.baseGrip * surfaceGrip;
    let rearGripFactor = cfg.handling.baseGrip * surfaceGrip;

    // Handbrake: dramatically reduces rear lateral grip to provoke controlled oversteer
    if (handbrake) {
      rearGripFactor = cfg.handling.driftGrip * surfaceGrip * 0.45;
      const handbrakeLimit = effectiveNormalLoad * 0.55 * muBraking * surfaceGrip;
      brakeForce += Math.min(handbrakeLimit, cfg.braking.handbrakePower * 180.0);
    }

    // If airborne or completely unweighted, zero out drive and brake forces applied to ground
    if (fzTotal <= 1.0) {
      driveForce = 0;
      brakeForce = 0;
    }

    // Drift Detection & Sustained Drift Handling
    if (this.driftAngle > 12.0 && absSpeed > 10.0 && fzTotal > 1.0) {
      this.isDrifting = true;
      this.driftTime += dt;
      // In drift: rear grip remains partially reduced for smooth slide continuation
      rearGripFactor = Math.min(rearGripFactor, cfg.handling.driftGrip * surfaceGrip * 1.1);
    } else {
      this.isDrifting = false;
      this.driftTime = 0;
    }

    // Linear-to-saturation tire cornering forces
    // Guard against division-by-zero when wheels are airborne/unweighted (fzTotal <= 1.0)
    const muTire = 1.15;
    let maxLatFront = 0;
    let maxLatRear = 0;

    if (fzTotal > 1.0) {
      maxLatFront = (fzFront / fzTotal) * (cfg.mass * 9.81 * muTire * surfaceGrip);
      maxLatRear = (fzRear / fzTotal) * (cfg.mass * 9.81 * muTire * surfaceGrip);
    }

    const latForceFront = -Math.sign(alphaFront) * Math.min(maxLatFront, Math.abs(alphaFront) * frontGripFactor * 450);
    const latForceRear = -Math.sign(alphaRear) * Math.min(maxLatRear, Math.abs(alphaRear) * rearGripFactor * 450);

    const totalLateralForce = latForceFront + latForceRear;

    // Self-aligning torque on front axle (gives realistic steering wheel centering)
    const aligningTorque = -latForceFront * 0.35;

    return {
      totalDriveForce: driveForce,
      totalBrakeForce: brakeForce,
      lateralForce: totalLateralForce,
      aligningTorque,
      slipAngle: overallSlipAngle,
      isDrifting: this.isDrifting
    };
  }
}

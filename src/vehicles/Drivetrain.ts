import { VehicleConfig } from './VehicleConfig';

export class Drivetrain {
  private config: VehicleConfig;

  // State
  public currentGear: number = 1; // -1 = Reverse, 0 = Neutral, 1..N = Forward
  public currentRPM: number = 1000;
  public isShifting: boolean = false;
  private shiftTimer: number = 0;
  private isReverseActive: boolean = false;

  constructor(config: VehicleConfig) {
    this.config = config;
    this.currentRPM = config.engine.idleRPM;
  }

  public setConfig(config: VehicleConfig): void {
    this.config = config;
    this.reset();
  }

  public reset(): void {
    this.currentGear = 1;
    this.currentRPM = this.config.engine.idleRPM;
    this.isShifting = false;
    this.shiftTimer = 0;
    this.isReverseActive = false;
  }

  public setReverse(active: boolean): void {
    if (this.isReverseActive !== active) {
      this.isReverseActive = active;
      this.currentGear = active ? -1 : 1;
      this.isShifting = false;
      this.shiftTimer = 0;
    }
  }

  /**
   * Minimum speed in m/s before allowing upshift from the specified gear
   */
  private getMinSpeedForGear(gear: number): number {
    const trans = this.config.transmission;
    const wheelRadius = this.config.dimensions.wheelRadius;
    if (gear <= 0 || gear > trans.gears) return 0;
    const ratio = trans.gearRatios[gear - 1];
    const shiftRPM = trans.shiftUpRPM;
    const maxWheelSpeed = (shiftRPM * 2 * Math.PI * wheelRadius) / (60 * ratio * trans.finalDrive);
    return maxWheelSpeed * 0.68;
  }

  /**
   * Updates RPM, automatic gear shifting, and computes drive force.
   */
  public update(dt: number, throttle: number, forwardSpeed: number): number {
    const eng = this.config.engine;
    const trans = this.config.transmission;
    const wheelRadius = this.config.dimensions.wheelRadius;

    // Handle shifting timer
    if (this.isShifting) {
      this.shiftTimer -= dt;
      if (this.shiftTimer <= 0) {
        this.isShifting = false;
      }
    }

    const absSpeed = Math.abs(forwardSpeed);

    // 1. Calculate Target RPM from Wheel Speed and Gear Ratio
    let gearRatio = 1.0;
    if (this.currentGear === -1) {
      gearRatio = trans.reverseRatio;
    } else if (this.currentGear > 0 && this.currentGear <= trans.gears) {
      gearRatio = trans.gearRatios[this.currentGear - 1];
    }

    // Wheel angular speed in rad/s
    const wheelAngSpeed = absSpeed / wheelRadius;
    // Engine RPM matching wheel rotation through drivetrain
    const mechanicalRPM = (wheelAngSpeed * gearRatio * trans.finalDrive * 60) / (2 * Math.PI);

    let targetRPM = mechanicalRPM;
    if (absSpeed < 3.5) {
      // Clutch slip zone: engine revs up into powerband based on throttle
      const clutchSlipRPM = eng.idleRPM + throttle * (3800 - eng.idleRPM);
      targetRPM = Math.max(mechanicalRPM, clutchSlipRPM);
    } else if (this.isShifting) {
      targetRPM = mechanicalRPM * 0.85;
    } else {
      targetRPM = Math.max(eng.idleRPM, mechanicalRPM);
    }

    // Smooth RPM interpolation
    const rpmBlendRate = 16.0;
    this.currentRPM += (targetRPM - this.currentRPM) * Math.min(1.0, rpmBlendRate * dt);
    this.currentRPM = Math.max(eng.idleRPM, Math.min(eng.maxRPM, this.currentRPM));

    // 2. Automatic Gear Shifting Logic (Forward Gears only)
    if (!this.isShifting && this.currentGear > 0) {
      const minUpshiftSpeed = this.getMinSpeedForGear(this.currentGear);

      // Upshift check: must have high RPM AND adequate speed for the gear
      if (
        this.currentRPM >= trans.shiftUpRPM &&
        absSpeed >= minUpshiftSpeed &&
        this.currentGear < trans.gears &&
        throttle > 0.2
      ) {
        this.currentGear++;
        this.isShifting = true;
        this.shiftTimer = trans.shiftTime;
        // Drop RPM after upshift
        this.currentRPM *= 0.74;
      }
      // Downshift check
      else if (
        this.currentRPM <= trans.shiftDownRPM &&
        this.currentGear > 1
      ) {
        const lowerGearMinSpeed = this.getMinSpeedForGear(this.currentGear - 1);
        if (absSpeed <= lowerGearMinSpeed * 1.1) {
          this.currentGear--;
          this.isShifting = true;
          this.shiftTimer = trans.shiftTime * 0.75;
          // Blip RPM on downshift
          this.currentRPM = Math.min(eng.maxRPM, this.currentRPM * 1.30);
        }
      }
    }

    // 3. Compute Normalized Torque from Engine RPM Curve
    const rpmNorm = (this.currentRPM - eng.idleRPM) / (eng.maxRPM - eng.idleRPM);
    let torqueFactor = 0.55 + 0.45 * Math.sin(Math.max(0, Math.min(1, rpmNorm)) * Math.PI);
    if (this.currentRPM >= eng.redlineRPM) {
      // Rev limiter torque dropoff
      torqueFactor *= Math.max(0.15, 1.0 - ((this.currentRPM - eng.redlineRPM) / (eng.maxRPM - eng.redlineRPM)) * 0.85);
    }

    // 4. Compute Wheel Drive Force
    if (this.isShifting || throttle <= 0.001) {
      return 0; // Clutch open during shift or coasting
    }

    const engineTorque = eng.peakTorque * torqueFactor * throttle;
    const totalReduction = gearRatio * trans.finalDrive;
    const efficiency = 0.88;
    let driveForce = ((engineTorque * totalReduction) / wheelRadius) * efficiency;

    // Clamp drive force by max longitudinal tire traction limit based on driven axle layout
    let drivenAxleWeightRatio = 1.0;
    if (trans.driveType === 'RWD') {
      drivenAxleWeightRatio = 0.65; // Rear drive wheels with acceleration squat weight transfer
    } else if (trans.driveType === 'FWD') {
      drivenAxleWeightRatio = 0.45; // Front drive wheels with squat unweighting
    } else {
      drivenAxleWeightRatio = 1.0;  // AWD: all 4 wheels deliver longitudinal thrust
    }

    const muTraction = (this.config.handling.baseGrip / 26.0) * 1.18;
    const maxTraction = this.config.mass * 9.81 * drivenAxleWeightRatio * muTraction;
    driveForce = Math.min(maxTraction, driveForce);

    return driveForce;
  }

  public get gearDisplay(): string {
    if (this.currentGear === -1) return 'R';
    if (this.currentGear === 0) return 'N';
    return this.currentGear.toString();
  }

  public get rpmRatio(): number {
    return (this.currentRPM - this.config.engine.idleRPM) /
      (this.config.engine.maxRPM - this.config.engine.idleRPM);
  }
}

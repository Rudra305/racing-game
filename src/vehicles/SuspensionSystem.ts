import { VehicleConfig } from './VehicleConfig';

export interface WheelSuspensionState {
  displacement: number; // in meters (from rest height)
  compression: number;  // 0.0 to 1.0
  normalForce: number;  // Normal vertical load in Newtons
  velocity: number;     // Vertical travel velocity
}

export class SuspensionSystem {
  private config: VehicleConfig;

  // 4 Wheels: 0=FL, 1=FR, 2=RL, 3=RR
  public wheels: WheelSuspensionState[] = [];

  // Body visual dynamic angles
  public bodyPitch: number = 0; // Dive/Squat (radians)
  public bodyRoll: number = 0;  // Cornering lean (radians)
  public curbVibration: number = 0;

  private curbVibePhase: number = 0;

  constructor(config: VehicleConfig) {
    this.config = config;
    for (let i = 0; i < 4; i++) {
      this.wheels.push({
        displacement: 0,
        compression: 0.5,
        normalForce: (config.mass * 9.81) / 4,
        velocity: 0
      });
    }
  }

  public setConfig(config: VehicleConfig): void {
    this.config = config;
    this.reset();
  }

  public reset(): void {
    const baseLoad = (this.config.mass * 9.81) / 4;
    for (let i = 0; i < 4; i++) {
      this.wheels[i].displacement = 0;
      this.wheels[i].compression = 0.5;
      this.wheels[i].normalForce = baseLoad;
      this.wheels[i].velocity = 0;
    }
    this.bodyPitch = 0;
    this.bodyRoll = 0;
    this.curbVibration = 0;
  }

  /**
   * Updates spring-damper dynamics, longitudinal/lateral weight transfer, and curb rumble.
   */
  public update(
    dt: number,
    acceleration: number,
    lateralG: number,
    speedKmH: number,
    onCurb: boolean,
    isAirborne: boolean
  ): void {
    const cfg = this.config;
    const susp = cfg.suspension;
    const totalMass = cfg.mass;
    const g = 9.81;
    const baseWheelLoad = (totalMass * g) / 4;

    if (isAirborne) {
      // Vehicle in air: suspension extends toward rest limits, load goes to zero
      for (let i = 0; i < 4; i++) {
        const w = this.wheels[i];
        w.displacement += (-susp.maxTravel - w.displacement) * 8.0 * dt;
        w.compression = 0;
        w.normalForce = 0;
      }
      this.bodyPitch *= Math.exp(-2.0 * dt);
      this.bodyRoll *= Math.exp(-2.0 * dt);
      return;
    }

    // 1. Weight Transfer Calculations
    const cogHeight = cfg.dimensions.height * 0.42;
    const wheelBase = cfg.dimensions.wheelBase;
    const trackWidth = cfg.dimensions.trackWidth;

    // Longitudinal transfer: Acceleration unloads front, loads rear; braking does opposite
    // deltaF_long = (m * a * h_cog) / (2 * wheelbase)
    const deltaF_long = (totalMass * acceleration * cogHeight) / (2 * wheelBase);

    // Lateral transfer: Centripetal force unloads inside wheels, loads outside wheels
    // deltaF_lat = (m * lateralG * g * h_cog) / (2 * trackWidth)
    const deltaF_lat = (totalMass * (lateralG * g) * cogHeight) / (2 * trackWidth);

    // Dynamic wheel loads:
    // FL (0): front, left  (-long, -lat)
    // FR (1): front, right (-long, +lat)
    // RL (2): rear, left   (+long, -lat)
    // RR (3): rear, right  (+long, +lat)
    const loads = [
      Math.max(100, baseWheelLoad - deltaF_long - deltaF_lat),
      Math.max(100, baseWheelLoad - deltaF_long + deltaF_lat),
      Math.max(100, baseWheelLoad + deltaF_long - deltaF_lat),
      Math.max(100, baseWheelLoad + deltaF_long + deltaF_lat)
    ];

    // 2. Curb Vibration Rumble
    let curbOffset = 0;
    if (onCurb && speedKmH > 10) {
      this.curbVibePhase += dt * (speedKmH * 0.8);
      curbOffset = Math.sin(this.curbVibePhase) * 0.022;
      this.curbVibration = Math.abs(curbOffset);
    } else {
      this.curbVibration = 0;
    }

    // 3. Spring-Damper Simulation per Wheel
    for (let i = 0; i < 4; i++) {
      const w = this.wheels[i];
      w.normalForce = loads[i];

      // Target displacement based on load vs spring stiffness
      const targetDisp = -((loads[i] - baseWheelLoad) / (susp.stiffness * 800)) + (i % 2 === 0 ? curbOffset : -curbOffset);
      const clampedTarget = Math.max(-susp.maxTravel, Math.min(susp.maxTravel, targetDisp));

      // Damped harmonic tracking
      const springForce = (clampedTarget - w.displacement) * susp.stiffness * 1.5;
      const dampingForce = -w.velocity * susp.damping;
      const vertAcc = springForce + dampingForce;

      w.velocity += vertAcc * dt;
      w.displacement += w.velocity * dt;
      w.displacement = Math.max(-susp.maxTravel, Math.min(susp.maxTravel, w.displacement));

      w.compression = (w.displacement + susp.maxTravel) / (2 * susp.maxTravel);
    }

    // 4. Visual Body Pitch and Roll Angles (radians)
    // Pitch: front vs rear average displacement
    const frontDisp = (this.wheels[0].displacement + this.wheels[1].displacement) * 0.5;
    const rearDisp = (this.wheels[2].displacement + this.wheels[3].displacement) * 0.5;
    const targetPitch = (frontDisp - rearDisp) / wheelBase;

    // Roll: left vs right average displacement
    const leftDisp = (this.wheels[0].displacement + this.wheels[2].displacement) * 0.5;
    const rightDisp = (this.wheels[1].displacement + this.wheels[3].displacement) * 0.5;
    const targetRoll = (leftDisp - rightDisp) / trackWidth;

    // Smooth body motion to avoid high-frequency jitter
    const bodyDamp = 14.0;
    this.bodyPitch += (targetPitch - this.bodyPitch) * Math.min(1.0, bodyDamp * dt);
    this.bodyRoll += (targetRoll - this.bodyRoll) * Math.min(1.0, bodyDamp * dt);
  }
}

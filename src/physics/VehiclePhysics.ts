import * as THREE from 'three';
import { VehicleConfig, DEFAULT_VEHICLE_CONFIG } from '../vehicles/VehicleConfig';
import { Drivetrain } from '../vehicles/Drivetrain';
import { SteeringSystem } from '../vehicles/SteeringSystem';
import { SuspensionSystem } from '../vehicles/SuspensionSystem';
import { TireSystem } from '../vehicles/TireSystem';
import { SurfaceSystem, SurfaceType } from './SurfaceSystem';

export interface VehicleTelemetry {
  speedKmH: number;
  rpm: number;
  gear: string;
  rpmRatio: number;
  throttle: number;
  brake: number;
  steering: number;
  slipAngle: number;
  lateralVelocity: number;
  longitudinalVelocity: number;
  acceleration: number;
  surface: SurfaceType;
  lateralG: number;
  isDrifting: boolean;
  driftAngle: number;
  isAirborne: boolean;
  curbVibration: number;
  elevation: number;
  gradient: number;
  banking: number;
  trackDistance: number;
  handbrake: boolean;
}

export class VehiclePhysics {
  // Configuration
  public config: VehicleConfig;

  // Subsystems
  public readonly drivetrain: Drivetrain;
  public readonly steeringSystem: SteeringSystem;
  public readonly suspensionSystem: SuspensionSystem;
  public readonly tireSystem: TireSystem;
  public readonly surfaceSystem: SurfaceSystem;

  // Kinematic State
  public readonly position: THREE.Vector3 = new THREE.Vector3();
  public heading: number = 0; // Yaw angle in radians
  public yawRate: number = 0; // rad/s
  public forwardSpeed: number = 0; // m/s
  public lateralSpeed: number = 0; // m/s
  public verticalSpeed: number = 0; // m/s for jumps/airborne
  public acceleration: number = 0; // m/s^2
  public lateralG: number = 0;
  public wheelRotation: number = 0;
  public isAirborne: boolean = false;

  // Previous State Buffers for Fixed-Timestep Render Interpolation
  public readonly previousPosition: THREE.Vector3 = new THREE.Vector3();
  public previousHeading: number = 0;
  public previousRoadPitchAngle: number = 0;
  public previousRoadBankAngle: number = 0;

  // Active Inputs
  private throttleInput: number = 0;
  private brakeInput: number = 0;
  private steerInput: number = 0;
  private handbrakeInput: boolean = false;

  // 3D Terrain & Road State
  public groundElevation: number = 0;
  public roadBankAngle: number = 0;  // radians
  public roadPitchAngle: number = 0; // radians
  public trackDistance: number = 0;
  public isOffRoad: boolean = false;

  // Track metrics
  public trackLateralDist: number = 0;
  public trackHalfWidth: number = 7.0;
  public closestSampleIndex: number = 0;

  // Pre-allocated scratch objects for zero-allocation performance
  private readonly _forward: THREE.Vector3 = new THREE.Vector3();
  private readonly _right: THREE.Vector3 = new THREE.Vector3();
  private readonly _telemetry: VehicleTelemetry = {
    speedKmH: 0,
    rpm: 800,
    gear: 'N',
    rpmRatio: 0,
    throttle: 0,
    brake: 0,
    steering: 0,
    slipAngle: 0,
    lateralVelocity: 0,
    longitudinalVelocity: 0,
    acceleration: 0,
    surface: SurfaceType.ASPHALT,
    lateralG: 0,
    isDrifting: false,
    driftAngle: 0,
    isAirborne: false,
    curbVibration: 0,
    elevation: 0,
    gradient: 0,
    banking: 0,
    trackDistance: 0,
    handbrake: false
  };

  constructor(config: VehicleConfig = DEFAULT_VEHICLE_CONFIG) {
    this.config = config;
    this.drivetrain = new Drivetrain(config);
    this.steeringSystem = new SteeringSystem(config.handling.maxSteerAngle);
    this.suspensionSystem = new SuspensionSystem(config);
    this.tireSystem = new TireSystem(config);
    this.surfaceSystem = new SurfaceSystem();
  }

  public setConfig(config: VehicleConfig): void {
    this.config = config;
    this.drivetrain.setConfig(config);
    this.steeringSystem.setMaxAngle(config.handling.maxSteerAngle);
    this.suspensionSystem.setConfig(config);
    this.tireSystem.setConfig(config);
  }

  public setSpawn(position: THREE.Vector3, heading: number): void {
    this.position.copy(position);
    this.heading = heading;
    this.yawRate = 0;
    this.forwardSpeed = 0;
    this.lateralSpeed = 0;
    this.verticalSpeed = 0;
    this.acceleration = 0;
    this.lateralG = 0;
    this.wheelRotation = 0;
    this.isAirborne = false;
    this.closestSampleIndex = 0;
    this.roadBankAngle = 0;
    this.roadPitchAngle = 0;

    // Synchronize previous state buffers
    this.previousPosition.copy(position);
    this.previousHeading = heading;
    this.previousRoadPitchAngle = 0;
    this.previousRoadBankAngle = 0;

    this.drivetrain.reset();
    this.steeringSystem.reset();
    this.suspensionSystem.reset();
    this.tireSystem.reset();
    this.surfaceSystem.reset();

    this.setInputs(0, 0, 0, false);
  }

  public setInputs(throttle: number, brake: number, steer: number, handbrake: boolean): void {
    this.throttleInput = Math.max(0, Math.min(1, throttle));
    this.brakeInput = Math.max(0, Math.min(1, brake));
    this.steerInput = Math.max(-1, Math.min(1, steer));
    this.handbrakeInput = handbrake;
  }

  public setTrackMetrics(lateralDist: number, halfWidth: number): void {
    this.trackLateralDist = lateralDist;
    this.trackHalfWidth = halfWidth;
  }

  public setGroundMetrics(
    elevation: number,
    bankAngle: number,
    pitchAngle: number,
    surfaceProps?: any,
    isOffRoad: boolean = false,
    trackDistance: number = 0
  ): void {
    this.groundElevation = elevation;
    // Smooth road bank and pitch angles to eliminate high-speed micro-jitter across segments
    const angleSmooth = 0.35;
    this.roadBankAngle += (bankAngle - this.roadBankAngle) * angleSmooth;
    this.roadPitchAngle += (pitchAngle - this.roadPitchAngle) * angleSmooth;
    this.isOffRoad = isOffRoad;
    this.trackDistance = trackDistance;
    if (surfaceProps) {
      this.surfaceSystem.updateWithProperties(surfaceProps);
    }
  }

  /**
   * Fixed Timestep Physics Simulation Step (60 Hz)
   */
  public step(dt: number): void {
    // Record previous state for render transform interpolation
    this.previousPosition.copy(this.position);
    this.previousHeading = this.heading;
    this.previousRoadPitchAngle = this.roadPitchAngle;
    this.previousRoadBankAngle = this.roadBankAngle;

    const cfg = this.config;
    const speedKmH = this.speedKmH;

    // 1. Surface Evaluation
    const surfaceProps = {
      type: this.surfaceSystem.currentSurface,
      grip: this.surfaceSystem.effectiveGrip,
      rollingResistance: this.surfaceSystem.effectiveRollingResistance,
      accelerationModifier: this.surfaceSystem.accelerationModifier,
      brakingModifier: this.surfaceSystem.brakingModifier
    };

    // 2. Reverse Gear Detection: only engage reverse when vehicle is virtually stopped
    if (Math.abs(this.forwardSpeed) < 0.2 && this.brakeInput > 0.2 && this.throttleInput < 0.05) {
      this.drivetrain.setReverse(true);
    } else if (this.drivetrain.currentGear === -1 && this.throttleInput > 0.1) {
      this.drivetrain.setReverse(false);
    }

    // 3. Steering Pipeline
    const steerAngle = this.steeringSystem.update(dt, this.steerInput, speedKmH, this.lateralSpeed);

    // 4. Drivetrain & Engine Force
    let effectiveThrottle = this.throttleInput;
    if (this.drivetrain.currentGear === -1) {
      // In reverse, brake pedal acts as reverse throttle
      effectiveThrottle = this.brakeInput;
    }
    const requestedDriveForce = this.drivetrain.update(dt, effectiveThrottle, this.forwardSpeed);

    // 5. Tire Forces (Longitudinal & Lateral Friction Ellipse)
    let effectiveBrakeInput = this.brakeInput;
    if (this.drivetrain.currentGear === -1) {
      // In reverse, throttle pedal acts as brake
      effectiveBrakeInput = this.throttleInput;
    }

    const tireForces = this.tireSystem.calculateTireForces(
      dt,
      this.forwardSpeed,
      this.lateralSpeed,
      this.yawRate,
      steerAngle,
      requestedDriveForce,
      effectiveBrakeInput,
      this.handbrakeInput,
      surfaceProps.grip,
      this.suspensionSystem.wheels
    );

    // 6. Aerodynamic Drag & Downforce
    const airDensity = 1.225;
    const frontalArea = cfg.aerodynamics.frontalArea;
    const dragCoeff = cfg.aerodynamics.dragCoefficient;
    const aeroDrag = 0.5 * airDensity * dragCoeff * frontalArea * this.forwardSpeed * Math.abs(this.forwardSpeed);

    // Rolling Resistance on active surface
    const crr = 0.015 * surfaceProps.rollingResistance;
    const rollingResistance = crr * cfg.mass * 9.81 * Math.sign(this.forwardSpeed);

    // 7. Longitudinal Motion Integration
    let netLongForce = 0;
    if (this.drivetrain.currentGear === -1) {
      // Reversing: drive force pushes backward, brake force pushes forward toward stop
      const maxBrakeToStop = (Math.max(0, -this.forwardSpeed) * cfg.mass) / dt;
      const appliedBrake = Math.min(tireForces.totalBrakeForce, maxBrakeToStop);
      netLongForce = -tireForces.totalDriveForce + appliedBrake - aeroDrag - rollingResistance;
    } else {
      // Forward driving: drive force pushes forward, brake force opposes motion up to stop
      const maxBrakeToStop = (Math.max(0, this.forwardSpeed) * cfg.mass) / dt;
      const appliedBrake = Math.min(tireForces.totalBrakeForce, maxBrakeToStop);
      netLongForce = tireForces.totalDriveForce - appliedBrake - aeroDrag - rollingResistance;
    }

    // Slope Gravity Force: opposes climbing, aids descent
    const slopeGravity = -cfg.mass * 9.81 * Math.sin(this.roadPitchAngle);
    netLongForce += slopeGravity;

    this.acceleration = netLongForce / cfg.mass;
    this.forwardSpeed += this.acceleration * dt;

    // Threshold to full stop
    if (Math.abs(this.forwardSpeed) < 0.08 && this.throttleInput === 0 && this.brakeInput === 0) {
      this.forwardSpeed = 0;
      this.acceleration = 0;
    }

    // 8. Lateral Motion & Yaw Kinematics
    if (Math.abs(this.forwardSpeed) > 0.08) {
      const wheelBase = cfg.dimensions.wheelBase;
      // Kinematic bicycle model base turn rate
      const kinematicYawRate = (this.forwardSpeed / wheelBase) * Math.sin(steerAngle);

      // Blend kinematic turn with tire drift slip for high speed stability
      const driftBlend = Math.min(1.0, this.tireSystem.driftAngle / 25.0);
      const targetYawRate = kinematicYawRate * (1.0 - driftBlend * 0.4) + (this.handbrakeInput ? kinematicYawRate * 1.5 : 0);

      this.yawRate += (targetYawRate - this.yawRate) * Math.min(1.0, 16.0 * dt);
      this.heading += this.yawRate * dt;

      // Wrap heading between [-PI, PI]
      if (this.heading > Math.PI) this.heading -= Math.PI * 2;
      if (this.heading < -Math.PI) this.heading += Math.PI * 2;
    } else {
      this.yawRate = 0;
    }

    // Lateral acceleration & damping
    const netLatForce = tireForces.lateralForce;
    const latAccel = netLatForce / cfg.mass;
    this.lateralSpeed += latAccel * dt;
    this.lateralG = (this.yawRate * this.forwardSpeed) / 9.81;

    // Lateral drift velocity decays based on tire grip
    const latDecay = Math.exp(-cfg.handling.baseGrip * surfaceProps.grip * (this.handbrakeInput ? 0.35 : 0.85) * dt);
    this.lateralSpeed *= latDecay;

    // 9. Suspension Dynamics & Weight Transfer
    this.suspensionSystem.update(
      dt,
      this.acceleration,
      this.lateralG,
      speedKmH,
      surfaceProps.type === SurfaceType.KERB,
      this.isAirborne
    );

    // 10. Airborne & Vertical Dynamics
    if (this.isAirborne) {
      // Enhanced downward pull combining gravity + aero downforce at speed
      // Prevents floaty "moon-gravity" jumps where cars hang in the air
      const aeroDownforceAcc = Math.min(24.0, (this.forwardSpeed * this.forwardSpeed) * 0.009);
      const totalGravity = 9.81 + aeroDownforceAcc;
      this.verticalSpeed -= totalGravity * dt;
      this.position.y += this.verticalSpeed * dt;

      // Ground contact check
      if (this.position.y <= this.groundElevation) {
        this.position.y = this.groundElevation;
        this.verticalSpeed = 0;
        this.isAirborne = false;
      }
    } else {
      // Check crest takeoff: only launch on major cliffs/crests at high speed
      const drop = this.position.y - this.groundElevation;
      if (drop > 1.4 && Math.abs(this.forwardSpeed) > 28.0) {
        this.isAirborne = true;
        this.verticalSpeed = 0;
      } else {
        // Firmly track ground elevation with high-frequency critical damping (35 rad/s)
        // Absorbs road spline segment transitions and eliminates 60Hz vertical jitter
        const vertDiff = this.groundElevation - this.position.y;
        this.position.y += vertDiff * Math.min(1.0, 35.0 * dt);
      }
    }

    // 11. World Transform Integration
    this._forward.set(Math.sin(this.heading), 0, Math.cos(this.heading));
    this._right.set(Math.cos(this.heading), 0, -Math.sin(this.heading));

    const vx = this.forwardSpeed * this._forward.x + this.lateralSpeed * this._right.x;
    const vz = this.forwardSpeed * this._forward.z + this.lateralSpeed * this._right.z;

    this.position.x += vx * dt;
    this.position.z += vz * dt;

    // 12. Wheel Axle Rotation (Spin)
    this.wheelRotation += (this.forwardSpeed / cfg.dimensions.wheelRadius) * dt;
  }

  public get speedKmH(): number {
    return Math.round(Math.abs(this.forwardSpeed) * 3.6);
  }

  public get normalizedSpeed(): number {
    const maxKmh = 260;
    return Math.min(1.0, this.speedKmH / maxKmh);
  }

  public get steerAngle(): number {
    return this.steeringSystem.currentSteerAngle;
  }

  public get telemetry(): VehicleTelemetry {
    this._telemetry.speedKmH = this.speedKmH;
    this._telemetry.rpm = Math.round(this.drivetrain.currentRPM);
    this._telemetry.gear = this.drivetrain.gearDisplay;
    this._telemetry.rpmRatio = this.drivetrain.rpmRatio;
    this._telemetry.throttle = this.throttleInput;
    this._telemetry.brake = this.brakeInput;
    this._telemetry.steering = this.steerInput;
    this._telemetry.slipAngle = this.tireSystem.driftAngle;
    this._telemetry.lateralVelocity = this.lateralSpeed;
    this._telemetry.longitudinalVelocity = this.forwardSpeed;
    this._telemetry.acceleration = this.acceleration;
    this._telemetry.surface = this.surfaceSystem.currentSurface;
    this._telemetry.lateralG = this.lateralG;
    this._telemetry.isDrifting = this.tireSystem.isDrifting;
    this._telemetry.driftAngle = this.tireSystem.driftAngle;
    this._telemetry.isAirborne = this.isAirborne;
    this._telemetry.curbVibration = this.suspensionSystem.curbVibration;
    this._telemetry.elevation = this.groundElevation;
    this._telemetry.gradient = Math.tan(this.roadPitchAngle) * 100;
    this._telemetry.banking = THREE.MathUtils.radToDeg(this.roadBankAngle);
    this._telemetry.trackDistance = this.trackDistance;
    this._telemetry.handbrake = this.handbrakeInput;
    return this._telemetry;
  }

  /**
   * Collision response with track boundaries.
   * Damps momentum cleanly and nudges out of penetration.
   */
  public applyCollisionImpulse(normal: THREE.Vector3, penetration: number): void {
    // Eject vehicle out of barrier penetration
    const safePen = Math.min(0.35, Math.max(0.02, penetration));
    this.position.x += normal.x * (safePen + 0.04);
    this.position.z += normal.z * (safePen + 0.04);

    const speed = Math.abs(this.forwardSpeed);
    if (speed < 12.0) {
      // Low-speed bump: elastic rebound
      this.forwardSpeed *= 0.75;
      this.lateralSpeed *= 0.5;
    } else {
      // High-speed collision: damp momentum cleanly
      this.forwardSpeed *= 0.65;
      this.lateralSpeed *= 0.4;
    }
  }

  /**
   * Launch car into air for jump testing
   */
  public triggerJump(upwardVelocity: number = 4.5): void {
    this.isAirborne = true;
    this.verticalSpeed = upwardVelocity;
  }

  /**
   * Computes the smoothly interpolated 3D position between previous and current physics ticks.
   */
  public getInterpolatedPosition(alpha: number, out: THREE.Vector3): THREE.Vector3 {
    return out.lerpVectors(this.previousPosition, this.position, alpha);
  }

  /**
   * Computes the shortest-arc interpolated heading angle (radians).
   */
  public getInterpolatedHeading(alpha: number): number {
    let diff = this.heading - this.previousHeading;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    return this.previousHeading + diff * alpha;
  }

  /**
   * Computes the smoothly interpolated road pitch angle.
   */
  public getInterpolatedRoadPitch(alpha: number): number {
    return THREE.MathUtils.lerp(this.previousRoadPitchAngle, this.roadPitchAngle, alpha);
  }

  /**
   * Computes the smoothly interpolated road bank angle.
   */
  public getInterpolatedRoadBank(alpha: number): number {
    return THREE.MathUtils.lerp(this.previousRoadBankAngle, this.roadBankAngle, alpha);
  }
}

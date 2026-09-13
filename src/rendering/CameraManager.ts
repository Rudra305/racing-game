import * as THREE from 'three';

export interface CameraConfig {
  distance: number;
  height: number;
  lookAhead: number;
  positionDamping: number;
  rotationDamping: number;
  minFov: number;
  maxFov: number;
}

export class CameraManager {
  public readonly camera: THREE.PerspectiveCamera;
  private config: CameraConfig;

  // Persistent camera targets for smooth interpolation
  private currentLookAt: THREE.Vector3 = new THREE.Vector3();
  private isInitialized: boolean = false;

  // Dynamic feedback parameters
  private shakeIntensity: number = 0;
  private shakePhase: number = 0;
  private smoothedAccel: number = 0;
  private smoothedVehicleY: number = 0;

  // Zero runtime allocation scratch objects
  private readonly _idealPosition: THREE.Vector3 = new THREE.Vector3();
  private readonly _idealLookAt: THREE.Vector3 = new THREE.Vector3();
  private readonly _forward: THREE.Vector3 = new THREE.Vector3();
  private readonly _right: THREE.Vector3 = new THREE.Vector3();

  constructor(config: CameraConfig) {
    this.config = config;
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(config.minFov, aspect, 0.1, 1000);
    this.camera.position.set(0, config.height, config.distance);
  }

  public resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  public addShake(intensity: number = 0.4): void {
    this.shakeIntensity = Math.min(1.0, this.shakeIntensity + intensity);
  }

  /**
   * Updates camera position with smooth follow lag, horizontal-only acceleration reaction,
   * lateral impact feedback, and speed-adaptive FOV.
   * Completely eliminates vertical procedural movement, suspension bob, curb shaking, and height kicks.
   */
  public update(
    delta: number,
    vehiclePosition: THREE.Vector3,
    vehicleHeading: number,
    speedNorm: number,
    acceleration: number,
    _curbVibration: number,
    minGroundY: number = 0
  ): void {
    // Forward & right unit vectors
    this._forward.set(Math.sin(vehicleHeading), 0, Math.cos(vehicleHeading));
    this._right.set(Math.cos(vehicleHeading), 0, -Math.sin(vehicleHeading));

    // 1. Dynamic Distance (Purely Horizontal Acceleration Setback / Forward Braking Push)
    // Zero vertical displacement: strictly along forward vector
    this.smoothedAccel += (acceleration - this.smoothedAccel) * Math.min(1.0, 8.0 * delta);
    const accelSetback = Math.max(-0.35, Math.min(0.45, this.smoothedAccel * 0.022));
    const effectiveDistance = this.config.distance + accelSetback;
    const effectiveHeight = this.config.height;

    // First frame initialization
    if (!this.isInitialized) {
      this.smoothedVehicleY = vehiclePosition.y;
      this._idealPosition.set(
        vehiclePosition.x - this._forward.x * effectiveDistance,
        this.smoothedVehicleY + effectiveHeight,
        vehiclePosition.z - this._forward.z * effectiveDistance
      );
      this._idealLookAt.set(
        vehiclePosition.x + this._forward.x * this.config.lookAhead,
        this.smoothedVehicleY + 0.85,
        vehiclePosition.z + this._forward.z * this.config.lookAhead
      );
      this.camera.position.copy(this._idealPosition);
      this.currentLookAt.copy(this._idealLookAt);
      this.camera.lookAt(this.currentLookAt);
      this.isInitialized = true;
      return;
    }

    // 2. Heavily Damped Macro Altitude Tracking
    // Isolates camera completely from high-frequency road bumps, curbs, squat, and suspension dive.
    // Follows long-range hill gradients smoothly at ~2.8/s without any vertical bobbing.
    const yBlend = 1.0 - Math.exp(-2.8 * delta);
    this.smoothedVehicleY += (vehiclePosition.y - this.smoothedVehicleY) * yBlend;

    // 3. Compute Ideal Camera Position & Look-At (Stable Constant Height)
    this._idealPosition.set(
      vehiclePosition.x - this._forward.x * effectiveDistance,
      this.smoothedVehicleY + effectiveHeight,
      vehiclePosition.z - this._forward.z * effectiveDistance
    );

    this._idealLookAt.set(
      vehiclePosition.x + this._forward.x * this.config.lookAhead,
      this.smoothedVehicleY + 0.85,
      vehiclePosition.z + this._forward.z * this.config.lookAhead
    );

    // 4. Exponential Damping (Smooth follow without jitter)
    const posAlpha = 1 - Math.exp(-this.config.positionDamping * delta);
    const lookAlpha = 1 - Math.exp(-this.config.rotationDamping * delta);

    this.camera.position.lerp(this._idealPosition, posAlpha);
    this.currentLookAt.lerp(this._idealLookAt, lookAlpha);

    // 5. Impact Feedback (Strictly Lateral Horizontal Only — ZERO Vertical Displacement)
    if (this.shakeIntensity > 0.01) {
      this.shakePhase += delta * 22.0;
      const shakeH = Math.sin(this.shakePhase) * this.shakeIntensity * 0.030;
      this.camera.position.x += this._right.x * shakeH;
      this.camera.position.z += this._right.z * shakeH;
      // Absolute invariant: camera.position.y is NEVER perturbed by shake or rumble
    }

    // Decay impact shake
    this.shakeIntensity *= Math.exp(-6.5 * delta);

    // 6. Camera Collision & Ground Clipping Prevention (Smooth Soft-Floor Clamping)
    const safetyFloor = minGroundY + 0.75;
    if (this.camera.position.y < safetyFloor) {
      const floorBlend = 1.0 - Math.exp(-5.0 * delta);
      this.camera.position.y += (safetyFloor - this.camera.position.y) * floorBlend;
    }

    this.camera.lookAt(this.currentLookAt);

    // 7. Dynamic Speed-Dependent Field of View
    const targetFov = THREE.MathUtils.lerp(this.config.minFov, this.config.maxFov, Math.min(1, Math.max(0, speedNorm)));
    if (Math.abs(this.camera.fov - targetFov) > 0.05) {
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, 0.12);
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Resets camera instantaneously behind vehicle (e.g. on respawn or race start)
   */
  public resetToVehicle(vehiclePosition: THREE.Vector3, vehicleHeading: number): void {
    this._forward.set(Math.sin(vehicleHeading), 0, Math.cos(vehicleHeading));
    this.smoothedVehicleY = vehiclePosition.y;

    this.camera.position.set(
      vehiclePosition.x - this._forward.x * this.config.distance,
      this.smoothedVehicleY + this.config.height,
      vehiclePosition.z - this._forward.z * this.config.distance
    );

    this.currentLookAt.set(
      vehiclePosition.x + this._forward.x * this.config.lookAhead,
      this.smoothedVehicleY + 0.85,
      vehiclePosition.z + this._forward.z * this.config.lookAhead
    );

    this.camera.lookAt(this.currentLookAt);
    this.camera.fov = this.config.minFov;
    this.camera.updateProjectionMatrix();
    this.shakeIntensity = 0;
    this.isInitialized = true;
  }
}

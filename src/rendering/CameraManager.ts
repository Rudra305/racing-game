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
   * Updates camera position with follow lag, acceleration reaction, curb rumble,
   * impact shake, and speed-adaptive FOV. Zero allocations.
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

    // 1. Dynamic Distance (Smoothed Horizontal Acceleration Setback / Forward Braking Push)
    // Stable horizontal camera lag without modifying vertical height
    this.smoothedAccel += (acceleration - this.smoothedAccel) * Math.min(1.0, 10.0 * delta);
    const accelSetback = Math.max(-0.40, Math.min(0.55, this.smoothedAccel * 0.025));
    const effectiveDistance = this.config.distance + accelSetback;
    // Strict constant vertical height relative to vehicle: NO acceleration-driven vertical displacement
    const effectiveHeight = this.config.height;

    // 2. Compute Ideal Camera Position (Stable Height)
    this._idealPosition.copy(vehiclePosition);
    this._idealPosition.x -= this._forward.x * effectiveDistance;
    this._idealPosition.z -= this._forward.z * effectiveDistance;
    this._idealPosition.y += effectiveHeight;

    // 3. Compute Ideal Look-At Point (Ahead over the vehicle hood at constant relative elevation)
    this._idealLookAt.copy(vehiclePosition);
    this._idealLookAt.x += this._forward.x * this.config.lookAhead;
    this._idealLookAt.z += this._forward.z * this.config.lookAhead;
    this._idealLookAt.y += 0.85;

    // First frame initialization
    if (!this.isInitialized) {
      this.camera.position.copy(this._idealPosition);
      this.currentLookAt.copy(this._idealLookAt);
      this.camera.lookAt(this.currentLookAt);
      this.isInitialized = true;
      return;
    }

    // 4. Exponential Damping (Smooth follow without jitter)
    const posAlpha = 1 - Math.exp(-this.config.positionDamping * delta);
    const lookAlpha = 1 - Math.exp(-this.config.rotationDamping * delta);

    this.camera.position.lerp(this._idealPosition, posAlpha);
    this.currentLookAt.lerp(this._idealLookAt, lookAlpha);

    // 5. Impact Feedback (Horizontal Only — ZERO Vertical Shake)
    // Curbs and vehicle bounce produce NO camera shake; impact shake is purely lateral
    if (this.shakeIntensity > 0.01) {
      this.shakePhase += delta * 24.0;
      const shakeH = Math.sin(this.shakePhase) * this.shakeIntensity * 0.035;
      this.camera.position.x += this._right.x * shakeH;
      this.camera.position.z += this._right.z * shakeH;
      // Absolute rule: NEVER modify camera.position.y with shake or curb vibration
    }

    // Decay impact shake
    this.shakeIntensity *= Math.exp(-6.5 * delta);

    // 6. Camera Collision & Ground Clipping Prevention
    const safetyFloor = minGroundY + 0.8;
    if (this.camera.position.y < safetyFloor) {
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, safetyFloor, 0.25);
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
   * Resets camera instantaneously behind vehicle (e.g. on respawn)
   */
  public resetToVehicle(vehiclePosition: THREE.Vector3, vehicleHeading: number): void {
    this._forward.set(Math.sin(vehicleHeading), 0, Math.cos(vehicleHeading));

    this.camera.position.copy(vehiclePosition);
    this.camera.position.x -= this._forward.x * this.config.distance;
    this.camera.position.z -= this._forward.z * this.config.distance;
    this.camera.position.y += this.config.height;

    this.currentLookAt.copy(vehiclePosition);
    this.currentLookAt.x += this._forward.x * this.config.lookAhead;
    this.currentLookAt.z += this._forward.z * this.config.lookAhead;
    this.currentLookAt.y += 0.85;

    this.camera.lookAt(this.currentLookAt);
    this.camera.fov = this.config.minFov;
    this.camera.updateProjectionMatrix();
    this.shakeIntensity = 0;
    this.isInitialized = true;
  }
}

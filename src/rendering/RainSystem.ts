import * as THREE from 'three';

export class RainSystem {
  public readonly points: THREE.Points;
  private readonly maxParticles: number;
  private readonly positions: Float32Array;
  private readonly velocities: Float32Array;
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.PointsMaterial;

  private readonly boxSize: THREE.Vector3 = new THREE.Vector3(70, 38, 70);
  private intensity: number = 0; // 0.0 to 1.0
  private activeCount: number = 0;

  constructor(maxParticles: number = 3500) {
    this.maxParticles = maxParticles;
    this.positions = new Float32Array(maxParticles * 3);
    this.velocities = new Float32Array(maxParticles * 3);

    // Populate initial random particle positions inside volume
    for (let i = 0; i < maxParticles; i++) {
      const idx = i * 3;
      this.positions[idx] = (Math.random() - 0.5) * this.boxSize.x;
      this.positions[idx + 1] = Math.random() * this.boxSize.y;
      this.positions[idx + 2] = (Math.random() - 0.5) * this.boxSize.z;

      // Vertical speed with slight random variation (~28 to 38 m/s downpour speed)
      this.velocities[idx] = (Math.random() - 0.5) * 1.5;
      this.velocities[idx + 1] = -(28.0 + Math.random() * 10.0);
      this.velocities[idx + 2] = (Math.random() - 0.5) * 1.5;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    // Semi-transparent elongated misty raindrop point texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(8, 0, 8, 64);
    grad.addColorStop(0, 'rgba(215, 230, 255, 0.0)');
    grad.addColorStop(0.3, 'rgba(215, 230, 255, 0.45)');
    grad.addColorStop(0.8, 'rgba(240, 248, 255, 0.95)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(6, 0, 4, 64);

    const texture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      size: 0.85,
      map: texture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.NormalBlending,
      depthWrite: false,
      color: 0xd4e4f7
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.visible = false;
    this.points.frustumCulled = false; // Always around player camera
  }

  public setIntensity(intensity: number, targetCount?: number): void {
    this.intensity = Math.max(0, Math.min(1.0, intensity));
    const desired = targetCount !== undefined ? targetCount : Math.round(this.intensity * this.maxParticles);
    this.activeCount = Math.min(this.maxParticles, desired);

    if (this.intensity < 0.01 || this.activeCount === 0) {
      this.points.visible = false;
    } else {
      this.points.visible = true;
      this.material.opacity = 0.35 + this.intensity * 0.45;
      this.geometry.setDrawRange(0, this.activeCount);
    }
  }

  /**
   * Updates raindrop particle positions around camera origin, accounting for vehicle speed.
   */
  public update(dt: number, cameraPosition: THREE.Vector3, forwardSpeedMs: number = 0): void {
    if (!this.points.visible || this.activeCount === 0) return;

    // Wind / speed slant: vehicle forward motion adds apparent headwind
    const headwindZ = -forwardSpeedMs * 0.55;

    const halfX = this.boxSize.x * 0.5;
    const halfZ = this.boxSize.z * 0.5;
    const boxY = this.boxSize.y;

    for (let i = 0; i < this.activeCount; i++) {
      const idx = i * 3;

      // Update position
      this.positions[idx] += this.velocities[idx] * dt;
      this.positions[idx + 1] += this.velocities[idx + 1] * dt;
      this.positions[idx + 2] += (this.velocities[idx + 2] + headwindZ) * dt;

      // Wrap-around camera-centric bounding box
      const relX = this.positions[idx] - cameraPosition.x;
      const relY = this.positions[idx] - cameraPosition.y;
      const relZ = this.positions[idx] - cameraPosition.z;

      if (relY < -4.0) {
        this.positions[idx + 1] = cameraPosition.y + boxY * 0.85 + Math.random() * 4.0;
        this.positions[idx] = cameraPosition.x + (Math.random() - 0.5) * this.boxSize.x;
        this.positions[idx + 2] = cameraPosition.z + (Math.random() - 0.5) * this.boxSize.z;
      } else if (relY > boxY) {
        this.positions[idx + 1] = cameraPosition.y;
      }

      if (relX < -halfX) this.positions[idx] += this.boxSize.x;
      else if (relX > halfX) this.positions[idx] -= this.boxSize.x;

      if (relZ < -halfZ) this.positions[idx + 2] += this.boxSize.z;
      else if (relZ > halfZ) this.positions[idx + 2] -= this.boxSize.z;
    }

    (this.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

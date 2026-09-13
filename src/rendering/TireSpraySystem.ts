import * as THREE from 'three';
import { VehiclePhysics } from '../physics/VehiclePhysics';

interface SprayParticle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

export class TireSpraySystem {
  public readonly points: THREE.Points;
  private readonly maxParticles: number;
  private readonly particles: SprayParticle[];
  private readonly positions: Float32Array;
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.PointsMaterial;

  private nextParticleIndex: number = 0;
  private spawnTimer: number = 0;

  constructor(maxParticles: number = 400) {
    this.maxParticles = maxParticles;
    this.particles = [];
    this.positions = new Float32Array(maxParticles * 3);

    for (let i = 0; i < maxParticles; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: -999,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 0.45
      });
      this.positions[i * 3 + 1] = -999;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    // Circular soft mist texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(230, 240, 255, 0.55)');
    grad.addColorStop(0.5, 'rgba(210, 225, 245, 0.25)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      size: 1.4,
      map: texture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
      depthWrite: false,
      color: 0xc8dcf0
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.visible = false;
    this.points.frustumCulled = false;
  }

  /**
   * Spawns and steps tire spray particles behind vehicles in wet weather.
   */
  public update(dt: number, physicsVehicles: VehiclePhysics[], roadWetness: number): void {
    if (roadWetness < 0.08) {
      this.points.visible = false;
      return;
    }

    this.points.visible = true;
    this.spawnTimer += dt;
    const spawnRate = 0.025; // 40 Hz emission

    // 1. Emit spray particles from spinning tires at speed
    if (this.spawnTimer >= spawnRate) {
      this.spawnTimer = 0;

      for (const phys of physicsVehicles) {
        const speed = phys.speedKmH;
        if (speed < 18.0) continue; // Stationary / creeping cars produce zero spray

        const speedRatio = Math.min(1.0, (speed - 18.0) / 160.0);
        const heading = phys.heading;
        const fwdX = Math.sin(heading);
        const fwdZ = Math.cos(heading);
        const rgtX = Math.cos(heading);
        const rgtZ = -Math.sin(heading);

        const dims = phys.config.dimensions;
        const halfTrack = dims.trackWidth * 0.5;
        const halfBase = dims.wheelBase * 0.5;

        // Rear tires produce major spray plumes; front tires produce secondary
        const wheelOffsets = [
          { x: -halfTrack, z: -halfBase, strength: 1.0 }, // RL
          { x: halfTrack, z: -halfBase, strength: 1.0 },  // RR
          { x: -halfTrack, z: halfBase * 0.7, strength: 0.4 }, // FL
          { x: halfTrack, z: halfBase * 0.7, strength: 0.4 }   // FR
        ];

        for (const w of wheelOffsets) {
          if (Math.random() > speedRatio * roadWetness * w.strength) continue;

          const p = this.particles[this.nextParticleIndex];
          this.nextParticleIndex = (this.nextParticleIndex + 1) % this.maxParticles;

          p.active = true;
          p.x = phys.position.x + fwdX * w.z + rgtX * w.x + (Math.random() - 0.5) * 0.2;
          p.y = phys.position.y + dims.wheelRadius * 0.35;
          p.z = phys.position.z + fwdZ * w.z + rgtZ * w.x + (Math.random() - 0.5) * 0.2;

          // Spray shoots backwards along velocity vector with upward rooster-tail expansion
          const spraySpeed = phys.forwardSpeed * 0.65;
          p.vx = -fwdX * spraySpeed + (Math.random() - 0.5) * 1.5;
          p.vy = 0.8 + Math.random() * 1.8 * speedRatio;
          p.vz = -fwdZ * spraySpeed + (Math.random() - 0.5) * 1.5;

          p.life = 0;
          p.maxLife = 0.35 + Math.random() * 0.25 * speedRatio;
        }
      }
    }

    // 2. Step and update particle positions
    let activeParticles = 0;
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particles[i];
      const idx = i * 3;

      if (p.active) {
        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          this.positions[idx + 1] = -999;
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;
          p.vy -= 1.8 * dt; // Gravity drag on mist

          this.positions[idx] = p.x;
          this.positions[idx + 1] = p.y;
          this.positions[idx + 2] = p.z;
          activeParticles++;
        }
      }
    }

    if (activeParticles > 0) {
      (this.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

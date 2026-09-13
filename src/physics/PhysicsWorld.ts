import * as THREE from 'three';
import { VehiclePhysics } from './VehiclePhysics';
import { Track } from '../tracks/Track';

export type ImpactCallback = (penetration: number) => void;

export class PhysicsWorld {
  private track: Track;
  private vehiclePhysics: VehiclePhysics;
  private aiVehicles: VehiclePhysics[] = [];
  private onImpact?: ImpactCallback;
  private isCollisionDebugEnabled: boolean = false;
  private collisionDebugMesh: THREE.Mesh | null = null;

  // Pre-allocated scratch objects for zero-allocation performance
  private _allCars: VehiclePhysics[] = [];

  constructor(track: Track, vehiclePhysics: VehiclePhysics, onImpact?: ImpactCallback) {
    this.track = track;
    this.vehiclePhysics = vehiclePhysics;
    this.onImpact = onImpact;
  }

  public setTrack(track: Track): void {
    this.track = track;
  }

  public setImpactCallback(cb: ImpactCallback): void {
    this.onImpact = cb;
  }

  public addAIVehicle(vehicle: VehiclePhysics): void {
    this.aiVehicles.push(vehicle);
  }

  public clearAIVehicles(): void {
    this.aiVehicles = [];
  }

  public step(dt: number): void {
    // 1. Step Player Vehicle Ground Metrics & Boundary Check
    const playerGround = this.track.queryGroundElevation(
      this.vehiclePhysics.position,
      false,
      this.vehiclePhysics.closestSampleIndex
    );
    if (playerGround.closestSampleIndex !== undefined) {
      this.vehiclePhysics.closestSampleIndex = playerGround.closestSampleIndex;
    }
    this.vehiclePhysics.setGroundMetrics(
      playerGround.height,
      playerGround.bankAngle,
      playerGround.pitchAngle,
      playerGround.surface,
      !playerGround.isRoad,
      playerGround.distance
    );
    this.vehiclePhysics.setTrackMetrics(
      playerGround.lateralDistance !== undefined ? playerGround.lateralDistance : this.track.lastLateralDistance,
      playerGround.halfRoadWidth !== undefined ? playerGround.halfRoadWidth : this.track.halfRoadWidth
    );

    // Advance player physics
    this.vehiclePhysics.step(dt);

    // Player barrier collision
    const playerBarrier = this.track.checkBoundaryCollision(this.vehiclePhysics.position, 1.0);
    if (playerBarrier.collided) {
      this.vehiclePhysics.applyCollisionImpulse(playerBarrier.normal, playerBarrier.penetration);
      if (this.onImpact) {
        this.onImpact(playerBarrier.penetration);
      }
    }

    // 2. Step AI Opponents Ground Metrics & Physics
    for (const ai of this.aiVehicles) {
      const aiGround = this.track.queryGroundElevation(
        ai.position,
        false,
        ai.closestSampleIndex
      );
      if (aiGround.closestSampleIndex !== undefined) {
        ai.closestSampleIndex = aiGround.closestSampleIndex;
      }
      ai.setGroundMetrics(
        aiGround.height,
        aiGround.bankAngle,
        aiGround.pitchAngle,
        aiGround.surface,
        !aiGround.isRoad,
        aiGround.distance
      );
      ai.setTrackMetrics(
        aiGround.lateralDistance !== undefined ? aiGround.lateralDistance : this.track.lastLateralDistance,
        aiGround.halfRoadWidth !== undefined ? aiGround.halfRoadWidth : this.track.halfRoadWidth
      );

      // Advance AI internal physics (same simulation as player)
      ai.step(dt);

      // AI barrier collision
      const aiBarrier = this.track.checkBoundaryCollision(ai.position, 1.0);
      if (aiBarrier.collided) {
        ai.applyCollisionImpulse(aiBarrier.normal, aiBarrier.penetration);
      }
    }

    // 3. Inter-Vehicle 2D Horizontal Collision Detection & Resolution
    this._allCars.length = 0;
    this._allCars.push(this.vehiclePhysics);
    for (let k = 0; k < this.aiVehicles.length; k++) {
      this._allCars.push(this.aiVehicles[k]);
    }
    const n = this._allCars.length;
    for (let i = 0; i < n; i++) {
      const carA = this._allCars[i];
      const posA = carA.position;
      const radiusA = Math.max(1.15, (carA.config.dimensions?.length ?? 4.4) * 0.30);

      for (let j = i + 1; j < n; j++) {
        const carB = this._allCars[j];
        const posB = carB.position;
        const radiusB = Math.max(1.15, (carB.config.dimensions?.length ?? 4.4) * 0.30);
        const minDist = radiusA + radiusB;
        const minDistSq = minDist * minDist;

        const dx = posB.x - posA.x;
        const dz = posB.z - posA.z;
        const distSq = dx * dx + dz * dz;

        if (distSq < minDistSq && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const penetration = minDist - dist;

          // Normal pointing from A to B
          const nx = dx / dist;
          const nz = dz / dist;

          // Positional separation push (each car pushed half penetration away smoothly)
          const halfPen = penetration * 0.5;
          posA.x -= nx * halfPen;
          posA.z -= nz * halfPen;
          posB.x += nx * halfPen;
          posB.z += nz * halfPen;

          // Realistic velocity transfer without secondary position teleportation
          const relSpeed = Math.abs(carA.forwardSpeed - carB.forwardSpeed);
          if (relSpeed > 4.0) {
            carA.forwardSpeed *= 0.88;
            carB.forwardSpeed *= 0.88;
          }
          carA.lateralSpeed *= 0.82;
          carB.lateralSpeed *= 0.82;

          // Camera shake if player is involved
          if (i === 0 && this.onImpact) {
            this.onImpact(Math.min(0.6, penetration * 0.5));
          }
        }
      }
    }

    // Collision debug mesh
    if (this.collisionDebugMesh) {
      if (playerBarrier.collided) {
        this.collisionDebugMesh.position.copy(this.vehiclePhysics.position);
        this.collisionDebugMesh.visible = true;
      } else {
        this.collisionDebugMesh.visible = false;
      }
    }
  }

  public toggleCollisionDebug(scene: THREE.Scene): boolean {
    this.isCollisionDebugEnabled = !this.isCollisionDebugEnabled;

    if (this.isCollisionDebugEnabled) {
      if (!this.collisionDebugMesh) {
        const geo = new THREE.SphereGeometry(1.2, 12, 12);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff3333, wireframe: true });
        this.collisionDebugMesh = new THREE.Mesh(geo, mat);
        scene.add(this.collisionDebugMesh);
      }
      this.collisionDebugMesh.visible = true;
    } else if (this.collisionDebugMesh) {
      this.collisionDebugMesh.visible = false;
    }

    return this.isCollisionDebugEnabled;
  }
}

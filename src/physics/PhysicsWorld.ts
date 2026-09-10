import * as THREE from 'three';
import { VehiclePhysics } from './VehiclePhysics';
import { Track } from '../tracks/Track';

export type ImpactCallback = (penetration: number) => void;

export class PhysicsWorld {
  private track: Track;
  private vehiclePhysics: VehiclePhysics;
  private onImpact?: ImpactCallback;
  private isCollisionDebugEnabled: boolean = false;
  private collisionDebugMesh: THREE.Mesh | null = null;

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

  public step(dt: number): void {
    // 1. Query ground elevation, surface, banking, pitch, and track distance from Track
    const groundInfo = this.track.queryGroundElevation(this.vehiclePhysics.position);
    this.vehiclePhysics.setGroundMetrics(
      groundInfo.height,
      groundInfo.bankAngle,
      groundInfo.pitchAngle,
      groundInfo.surface,
      !groundInfo.isRoad,
      groundInfo.distance
    );
    this.vehiclePhysics.setTrackMetrics(this.track.lastLateralDistance, this.track.halfRoadWidth);

    // 2. Advance vehicle internal physics (drivetrain, steering, suspension, tires, aero, slope gravity)
    this.vehiclePhysics.step(dt);

    // 3. Query track boundaries for barrier collision
    const collision = this.track.checkBoundaryCollision(this.vehiclePhysics.position, 1.0);

    if (collision.collided) {
      this.vehiclePhysics.applyCollisionImpulse(collision.normal, collision.penetration);

      if (this.onImpact) {
        this.onImpact(collision.penetration);
      }

      if (this.collisionDebugMesh) {
        this.collisionDebugMesh.position.copy(this.vehiclePhysics.position);
        this.collisionDebugMesh.visible = true;
      }
    } else if (this.collisionDebugMesh) {
      this.collisionDebugMesh.visible = false;
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

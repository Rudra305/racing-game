import * as THREE from 'three';
import { TrackSample } from './TrackSampler';

export interface CheckpointData {
  index: number;
  distance: number;
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  normal: THREE.Vector3;
  width: number;
  banking?: number;
}

export class Checkpoint {
  public readonly index: number;
  public readonly distance: number;
  public readonly position: THREE.Vector3;
  public readonly tangent: THREE.Vector3;
  public readonly normal: THREE.Vector3;
  public readonly width: number;
  public readonly banking: number;

  public helperMesh: THREE.Object3D | null = null;

  // Pre-allocated scratch vector for zero runtime allocations
  private readonly _toVehicle: THREE.Vector3 = new THREE.Vector3();

  constructor(data: CheckpointData) {
    this.index = data.index;
    this.distance = data.distance;
    this.position = data.position.clone();
    this.tangent = data.tangent.clone().normalize();
    this.normal = data.normal.clone().normalize();
    this.width = data.width;
    this.banking = data.banking ?? 0;
  }

  public static fromSample(index: number, sample: TrackSample): Checkpoint {
    return new Checkpoint({
      index,
      distance: sample.distance,
      position: sample.position,
      tangent: sample.tangent,
      normal: sample.normal,
      width: sample.width,
      banking: sample.banking
    });
  }

  /**
   * Fast 3D gate crossing check.
   * Checks if vehicle is within width across the road and within crossing distance along tangent.
   */
  public isPassedByVehicle(vehiclePosition: THREE.Vector3, thresholdDist: number = 7.0): boolean {
    this._toVehicle.subVectors(vehiclePosition, this.position);

    // Lateral distance across track
    const lateralDist = Math.abs(this._toVehicle.dot(this.normal));
    if (lateralDist > this.width * 0.75) {
      return false; // Vehicle is too far outside track width
    }

    // Vertical height check (within 6m of track surface)
    if (Math.abs(this._toVehicle.y) > 6.0) {
      return false;
    }

    // Longitudinal distance along tangent through gate
    const longitudinalDist = Math.abs(this._toVehicle.dot(this.tangent));
    return longitudinalDist <= thresholdDist;
  }

  /**
   * Builds an optional debug visual gate arch (toggleable via F3)
   */
  public createDebugMesh(): THREE.Object3D {
    const group = new THREE.Group();
    const halfW = this.width * 0.5;

    const postGeo = new THREE.CylinderGeometry(0.18, 0.18, 4.2, 8);
    const postMat = new THREE.MeshBasicMaterial({
      color: this.index === 0 ? 0x00ff88 : 0x58a6ff,
      wireframe: true
    });

    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(-this.normal.x * halfW, 2.1, -this.normal.z * halfW);
    group.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(this.normal.x * halfW, 2.1, this.normal.z * halfW);
    group.add(rightPost);

    // Crossbar
    const barGeo = new THREE.BoxGeometry(this.width, 0.25, 0.25);
    const crossbar = new THREE.Mesh(barGeo, postMat);
    crossbar.position.set(0, 4.2, 0);
    crossbar.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), this.normal);
    group.add(crossbar);

    group.position.copy(this.position);
    this.helperMesh = group;
    return group;
  }
}

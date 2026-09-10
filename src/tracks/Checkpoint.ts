import * as THREE from 'three';

export interface CheckpointData {
  index: number;
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  normal: THREE.Vector3;
  width: number;
}

export class Checkpoint {
  public readonly index: number;
  public readonly position: THREE.Vector3;
  public readonly tangent: THREE.Vector3;
  public readonly normal: THREE.Vector3;
  public readonly width: number;

  public helperMesh: THREE.Object3D | null = null;

  // Scratch vector for zero allocations
  private readonly _toVehicle: THREE.Vector3 = new THREE.Vector3();

  constructor(data: CheckpointData) {
    this.index = data.index;
    this.position = data.position.clone();
    this.tangent = data.tangent.clone().normalize();
    this.normal = data.normal.clone().normalize();
    this.width = data.width;
  }

  /**
   * Fast gate crossing check.
   * Checks if vehicle is within width across the track and close to the checkpoint plane.
   */
  public isPassedByVehicle(vehiclePosition: THREE.Vector3, radiusThreshold: number = 6.0): boolean {
    this._toVehicle.subVectors(vehiclePosition, this.position);

    // Distance along track normal (across track width)
    const lateralDist = Math.abs(this._toVehicle.dot(this.normal));
    if (lateralDist > this.width * 0.65) {
      return false; // Car is outside track width at this point
    }

    // Distance along track tangent (forward/backward through gate)
    const longitudinalDist = Math.abs(this._toVehicle.dot(this.tangent));
    return longitudinalDist <= radiusThreshold;
  }

  /**
   * Builds an optional debug visual gate arch (toggleable via F3)
   */
  public createDebugMesh(): THREE.Object3D {
    const group = new THREE.Group();
    const halfW = this.width * 0.5;

    // Arch posts
    const postGeo = new THREE.CylinderGeometry(0.15, 0.15, 4.0, 8);
    const postMat = new THREE.MeshBasicMaterial({
      color: this.index === 0 ? 0x00ff88 : 0x58a6ff,
      wireframe: true
    });

    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(-this.normal.x * halfW, 2.0, -this.normal.z * halfW);
    group.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(this.normal.x * halfW, 2.0, this.normal.z * halfW);
    group.add(rightPost);

    // Crossbar
    const barGeo = new THREE.BoxGeometry(this.width, 0.2, 0.2);
    const crossbar = new THREE.Mesh(barGeo, postMat);
    crossbar.position.set(0, 4.0, 0);
    // Align crossbar with normal
    crossbar.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), this.normal);
    group.add(crossbar);

    group.position.copy(this.position);
    this.helperMesh = group;
    return group;
  }
}

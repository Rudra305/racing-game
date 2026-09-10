import * as THREE from 'three';
import { StartGridConfig } from './TrackTypes';
import { TrackSampler } from './TrackSampler';

export interface GridSlot {
  index: number;         // 0 = P1, 1 = P2, etc.
  position: THREE.Vector3;
  heading: number;       // Yaw angle in radians
  tangent: THREE.Vector3;
  normal: THREE.Vector3;
}

export class StartGrid {
  public readonly slots: GridSlot[] = [];
  public readonly config: StartGridConfig;

  constructor(sampler: TrackSampler, config: StartGridConfig) {
    this.config = config;
    this.generateSlots(sampler);
  }

  private generateSlots(sampler: TrackSampler): void {
    const totalLength = sampler.totalLength;

    // Compute grid slots backward along track from finish line
    for (let i = 0; i < this.config.positions; i++) {
      const rowIndex = Math.floor(i / 2);
      const isRightSide = i % 2 === 1;

      // Distance behind finish line in meters
      const distBehind = this.config.offsetFromStart + rowIndex * this.config.rowSpacing;
      // Stagger second column slightly further back for standard racing grid
      const stagger = isRightSide ? this.config.rowSpacing * 0.45 : 0;
      const slotDist = ((totalLength - (distBehind + stagger)) % totalLength + totalLength) % totalLength;

      const sample = sampler.getSampleAtDistance(slotDist);

      // Lateral offset: left (-lateralSpacing) or right (+lateralSpacing)
      const latOffset = (isRightSide ? 1 : -1) * (this.config.lateralSpacing * 0.5);

      const slotPos = sample.position.clone().addScaledVector(sample.bankedRight, latOffset);
      const heading = Math.atan2(sample.tangent.x, sample.tangent.z);

      this.slots.push({
        index: i,
        position: slotPos,
        heading,
        tangent: sample.tangent.clone(),
        normal: sample.normal.clone()
      });
    }
  }

  public getPlayerSlot(): GridSlot {
    return this.slots[0]; // Player starts at P1 (Pole position)
  }

  /**
   * Helper mesh to visualize grid boxes on the road surface
   */
  public createDebugMesh(): THREE.Group {
    const group = new THREE.Group();
    const boxGeo = new THREE.PlaneGeometry(2.2, 4.4);
    boxGeo.rotateX(-Math.PI / 2);

    for (const slot of this.slots) {
      const isP1 = slot.index === 0;
      const mat = new THREE.MeshBasicMaterial({
        color: isP1 ? 0x58a6ff : 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.65
      });

      const mesh = new THREE.Mesh(boxGeo, mat);
      mesh.position.copy(slot.position);
      mesh.position.y += 0.05;
      mesh.rotation.y = slot.heading;
      group.add(mesh);
    }

    return group;
  }
}

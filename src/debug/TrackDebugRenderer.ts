import * as THREE from 'three';
import { Track } from '../tracks/Track';

export class TrackDebugRenderer {
  public readonly group: THREE.Group = new THREE.Group();
  private isVisible: boolean = false;
  private track: Track;

  private splineLine!: THREE.Line;
  private tangentArrowsGroup: THREE.Group = new THREE.Group();
  private boundaryLinesGroup: THREE.Group = new THREE.Group();
  private startGridGroup: THREE.Group = new THREE.Group();

  constructor(track: Track) {
    this.track = track;
    this.group.visible = false;
    this.buildDebugVisuals();
  }

  public setTrack(track: Track): void {
    this.clearDebugVisuals();
    this.track = track;
    this.buildDebugVisuals();
  }

  private clearDebugVisuals(): void {
    this.group.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });

    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.tangentArrowsGroup.clear();
    this.boundaryLinesGroup.clear();
    this.startGridGroup.clear();
  }

  private buildDebugVisuals(): void {
    const sampler = this.track.sampler;
    const samples = sampler.samples;

    // 1. Spline Centerline (Cyan Line)
    const linePoints: THREE.Vector3[] = [];
    for (const s of samples) {
      linePoints.push(s.position.clone().add(new THREE.Vector3(0, 0.25, 0)));
    }
    linePoints.push(samples[0].position.clone().add(new THREE.Vector3(0, 0.25, 0))); // Close loop

    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
    this.splineLine = new THREE.Line(lineGeo, lineMat);
    this.group.add(this.splineLine);

    // 2. Tangent & Normal Direction Helpers every ~10 samples
    for (let i = 0; i < samples.length; i += 12) {
      const s = samples[i];
      const origin = s.position.clone().add(new THREE.Vector3(0, 0.3, 0));

      // Green Tangent Arrow
      const arrowTangent = new THREE.ArrowHelper(s.tangent, origin, 3.0, 0x7ee787, 0.8, 0.4);
      this.tangentArrowsGroup.add(arrowTangent);

      // Yellow Banked Normal Arrow
      const arrowNormal = new THREE.ArrowHelper(s.bankedRight, origin, s.width * 0.5, 0xd29922, 0.6, 0.3);
      this.tangentArrowsGroup.add(arrowNormal);
    }
    this.group.add(this.tangentArrowsGroup);

    // 3. Start Grid Slot Boxes
    this.startGridGroup = this.track.startGrid.createDebugMesh();
    this.group.add(this.startGridGroup);

    // 4. Playable & Reset Boundary Outlines
    const playPtsL: THREE.Vector3[] = [];
    const playPtsR: THREE.Vector3[] = [];
    const resetPtsL: THREE.Vector3[] = [];
    const resetPtsR: THREE.Vector3[] = [];

    const playLimit = 25.0;
    const resetLimit = 55.0;

    for (let i = 0; i < samples.length; i += 4) {
      const s = samples[i];
      playPtsL.push(s.position.clone().addScaledVector(s.bankedRight, -playLimit).add(new THREE.Vector3(0, 0.4, 0)));
      playPtsR.push(s.position.clone().addScaledVector(s.bankedRight, playLimit).add(new THREE.Vector3(0, 0.4, 0)));
      resetPtsL.push(s.position.clone().addScaledVector(s.bankedRight, -resetLimit).add(new THREE.Vector3(0, 0.4, 0)));
      resetPtsR.push(s.position.clone().addScaledVector(s.bankedRight, resetLimit).add(new THREE.Vector3(0, 0.4, 0)));
    }

    const boundaryMat = new THREE.LineBasicMaterial({ color: 0xf85149, transparent: true, opacity: 0.5 });
    const resetMat = new THREE.LineBasicMaterial({ color: 0xa371f7, transparent: true, opacity: 0.35 });

    this.boundaryLinesGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(playPtsL), boundaryMat));
    this.boundaryLinesGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(playPtsR), boundaryMat));
    this.boundaryLinesGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(resetPtsL), resetMat));
    this.boundaryLinesGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(resetPtsR), resetMat));

    this.group.add(this.boundaryLinesGroup);
  }

  public toggle(): boolean {
    this.isVisible = !this.isVisible;
    this.group.visible = this.isVisible;
    this.track.toggleCheckpointDebug();
    return this.isVisible;
  }

  public dispose(): void {
    this.clearDebugVisuals();
  }
}

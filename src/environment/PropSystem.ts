import * as THREE from 'three';
import { TrackSampler } from '../tracks/TrackSampler';
import { Terrain } from '../terrain/Terrain';
import { ProceduralAssets } from './ProceduralAssets';
import { BiomeDefinition } from './EnvironmentTypes';

export class PropSystem {
  public readonly group: THREE.Group = new THREE.Group();
  private meshes: (THREE.Mesh | THREE.InstancedMesh)[] = [];

  constructor(sampler: TrackSampler, terrain: Terrain, biome: BiomeDefinition) {
    this.generateGuardrails(sampler);
    this.generateReflectors(sampler);
    this.generateSigns(sampler);
    this.generateLandmarks(sampler, terrain, biome);
  }

  /**
   * 1. Generates W-beam steel guardrails on tight curves and cliff edges
   */
  private generateGuardrails(sampler: TrackSampler): void {
    const samples = sampler.samples;
    const totalSamples = samples.length;
    const transforms: THREE.Matrix4[] = [];

    const dummy = new THREE.Object3D();

    for (let i = 0; i < totalSamples; i += 2) {
      const s = samples[i];
      // Place guardrails on corners with notable curvature
      if (s.curvature > 0.004) {
        const roadHalf = s.width * 0.5;
        const outerOffset = roadHalf + 1.1; // Just outside the kerb

        // Outside edge of curve: check curvature normal
        const isRightCurve = s.banking > 0;
        const latOffset = isRightCurve ? -outerOffset : outerOffset;

        dummy.position.copy(s.position).addScaledVector(s.bankedRight, latOffset);
        dummy.position.y += 0.05;

        // Orient along tangent
        const heading = Math.atan2(s.tangent.x, s.tangent.z);
        dummy.rotation.set(0, heading, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();

        transforms.push(dummy.matrix.clone());
      }
    }

    if (transforms.length > 0) {
      const geo = ProceduralAssets.createGuardrailSegmentGeometry(4.5);
      const instancedMesh = new THREE.InstancedMesh(geo, ProceduralAssets.steelMaterial, transforms.length);
      instancedMesh.castShadow = true;
      instancedMesh.receiveShadow = true;

      for (let idx = 0; idx < transforms.length; idx++) {
        instancedMesh.setMatrixAt(idx, transforms[idx]);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;

      this.group.add(instancedMesh);
      this.meshes.push(instancedMesh);
    }
  }

  /**
   * 2. Roadside reflector bollards along road verges
   */
  private generateReflectors(sampler: TrackSampler): void {
    const totalLength = sampler.totalLength;
    const interval = 22.0; // Every 22 meters
    const count = Math.floor(totalLength / interval);
    const transforms: THREE.Matrix4[] = [];

    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const dist = i * interval;
      const s = sampler.getSampleAtDistance(dist);
      const roadHalf = s.width * 0.5;
      const offset = roadHalf + 0.95;

      // Left post
      dummy.position.copy(s.position).addScaledVector(s.bankedRight, -offset);
      dummy.rotation.set(0, Math.atan2(s.tangent.x, s.tangent.z), 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      transforms.push(dummy.matrix.clone());

      // Right post
      dummy.position.copy(s.position).addScaledVector(s.bankedRight, offset);
      dummy.updateMatrix();
      transforms.push(dummy.matrix.clone());
    }

    if (transforms.length > 0) {
      const geo = ProceduralAssets.createReflectorPostGeometry();
      const instanced = new THREE.InstancedMesh(geo, ProceduralAssets.steelMaterial, transforms.length);
      instanced.receiveShadow = true;

      for (let idx = 0; idx < transforms.length; idx++) {
        instanced.setMatrixAt(idx, transforms[idx]);
      }
      instanced.instanceMatrix.needsUpdate = true;

      this.group.add(instanced);
      this.meshes.push(instanced);
    }
  }

  /**
   * 3. Directional Chevron Signs and Speed Limit Signs
   */
  private generateSigns(sampler: TrackSampler): void {
    const samples = sampler.samples;
    const totalSamples = samples.length;

    const chevronMat = new THREE.MeshStandardMaterial({
      color: 0xda3633, // High-visibility red/white warning
      roughness: 0.5,
      metalness: 0.1
    });

    for (let i = 0; i < totalSamples; i += 8) {
      const s = samples[i];
      // Hairpin or sharp turn chevrons
      if (s.curvature > 0.012) {
        const isRight = s.banking > 0;
        const roadHalf = s.width * 0.5;
        const latOffset = (roadHalf + 2.2) * (isRight ? -1 : 1);

        const geo = ProceduralAssets.createChevronSignGeometry(isRight);
        const mesh = new THREE.Mesh(geo, chevronMat);
        mesh.position.copy(s.position).addScaledVector(s.bankedRight, latOffset);
        mesh.position.y += 0.1;

        // Angle sign to face oncoming driver directly
        const heading = Math.atan2(s.tangent.x, s.tangent.z);
        mesh.rotation.y = heading + Math.PI + (isRight ? 0.35 : -0.35);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.group.add(mesh);
        this.meshes.push(mesh);
      }
    }

    // Speed limit signs on straights
    const speedIntervals = [120, 480, 920, 1340];
    for (const dist of speedIntervals) {
      const s = sampler.getSampleAtDistance(dist);
      const roadHalf = s.width * 0.5;

      const geo = ProceduralAssets.createSpeedSignGeometry();
      const mesh = new THREE.Mesh(geo, ProceduralAssets.steelMaterial);
      mesh.position.copy(s.position).addScaledVector(s.bankedRight, roadHalf + 1.8);
      mesh.position.y += 0.1;
      mesh.rotation.y = Math.atan2(s.tangent.x, s.tangent.z) + Math.PI;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      this.group.add(mesh);
      this.meshes.push(mesh);
    }
  }

  /**
   * 4. Alpine Visual Landmarks (Lookout Tower, Summit Mast, Cliff Formations)
   */
  private generateLandmarks(sampler: TrackSampler, terrain: Terrain, _biome: BiomeDefinition): void {
    // Landmark 1: Observation Lookout Tower at ~260m
    const s1 = sampler.getSampleAtDistance(260);
    const pos1 = s1.position.clone().addScaledVector(s1.bankedRight, -26.0);
    pos1.y = terrain.getHeightAt(pos1.x, pos1.z);

    const towerGeo = ProceduralAssets.createLookoutTowerGeometry();
    const towerMesh = new THREE.Mesh(towerGeo, ProceduralAssets.woodMaterial);
    towerMesh.position.copy(pos1);
    towerMesh.rotation.y = Math.atan2(s1.tangent.x, s1.tangent.z) + 0.4;
    towerMesh.castShadow = true;
    towerMesh.receiveShadow = true;
    this.group.add(towerMesh);
    this.meshes.push(towerMesh);

    // Landmark 2: Summit Weather Radar Mast at ~640m
    const s2 = sampler.getSampleAtDistance(640);
    const pos2 = s2.position.clone().addScaledVector(s2.bankedRight, 22.0);
    pos2.y = terrain.getHeightAt(pos2.x, pos2.z);

    const mastGeo = ProceduralAssets.createSummitMastGeometry();
    const mastMesh = new THREE.Mesh(mastGeo, ProceduralAssets.steelMaterial);
    mastMesh.position.copy(pos2);
    mastMesh.castShadow = true;
    mastMesh.receiveShadow = true;
    this.group.add(mastMesh);
    this.meshes.push(mastMesh);
  }

  public dispose(): void {
    for (const m of this.meshes) {
      if (m.geometry) m.geometry.dispose();
    }
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.meshes = [];
  }
}

import * as THREE from 'three';
import { ChunkState } from './EnvironmentTypes';
import { ChunkPlacementData, InstanceTransform } from './VegetationDistributor';
import { ProceduralAssets } from './ProceduralAssets';

export class EnvironmentChunk {
  public readonly index: number;
  public readonly center: THREE.Vector3 = new THREE.Vector3();
  public readonly group: THREE.Group = new THREE.Group();
  public state: ChunkState = ChunkState.UNLOADED;

  private lod0Group: THREE.Group = new THREE.Group();
  private lod1Group: THREE.Group = new THREE.Group();
  private lod2Group: THREE.Group = new THREE.Group();

  private activeLOD: number = -1; // -1 = hidden/culled, 0 = LOD0, 1 = LOD1, 2 = LOD2
  private instancedMeshes: THREE.InstancedMesh[] = [];

  constructor(data: ChunkPlacementData) {
    this.index = data.chunkIndex;
    this.group.add(this.lod0Group);
    this.group.add(this.lod1Group);
    this.group.add(this.lod2Group);

    this.lod0Group.visible = false;
    this.lod1Group.visible = false;
    this.lod2Group.visible = false;

    this.buildChunkMeshes(data);
    this.state = ChunkState.INACTIVE;
  }

  private buildChunkMeshes(data: ChunkPlacementData): void {
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    let totalPoints = 0;

    // Build instanced meshes for each asset type in this chunk
    for (const [assetId, transforms] of data.vegetation.entries()) {
      if (transforms.length === 0) continue;

      for (const t of transforms) {
        sumX += t.position.x;
        sumY += t.position.y;
        sumZ += t.position.z;
        totalPoints++;
      }

      this.createInstancedMeshesForAsset(assetId, transforms);
    }

    if (totalPoints > 0) {
      this.center.set(sumX / totalPoints, sumY / totalPoints, sumZ / totalPoints);
    }
  }

  private createInstancedMeshesForAsset(assetId: string, transforms: InstanceTransform[]): void {
    const count = transforms.length;
    const dummy = new THREE.Object3D();

    const matrices: THREE.Matrix4[] = [];
    for (const t of transforms) {
      dummy.position.copy(t.position);
      dummy.rotation.set(0, t.rotationY, 0);
      dummy.scale.set(t.scale, t.scale, t.scale);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }

    // Determine geometry and material mappings based on assetId
    let geo0: THREE.BufferGeometry;
    let geo1: THREE.BufferGeometry;
    let geo2: THREE.BufferGeometry | null = null;
    let mat: THREE.Material = ProceduralAssets.foliageFirMaterial;
    let castShadow = false;

    if (assetId.startsWith('alpine_fir')) {
      geo0 = ProceduralAssets.createFirGeometry(0);
      geo1 = ProceduralAssets.createFirGeometry(1);
      geo2 = ProceduralAssets.createFirGeometry(2);
      mat = ProceduralAssets.foliageFirMaterial;
      castShadow = true;
    } else if (assetId.startsWith('alpine_pine')) {
      geo0 = ProceduralAssets.createPineGeometry(0);
      geo1 = ProceduralAssets.createPineGeometry(1);
      geo2 = ProceduralAssets.createPineGeometry(2);
      mat = ProceduralAssets.foliagePineMaterial;
      castShadow = true;
    } else if (assetId.startsWith('mountain_birch')) {
      geo0 = ProceduralAssets.createBirchGeometry(0);
      geo1 = ProceduralAssets.createBirchGeometry(1);
      geo2 = ProceduralAssets.createBirchGeometry(2);
      mat = ProceduralAssets.foliageBirchMaterial;
      castShadow = true;
    } else if (assetId.startsWith('alpine_bush')) {
      geo0 = ProceduralAssets.createBushGeometry(0);
      geo1 = ProceduralAssets.createBushGeometry(1);
      mat = ProceduralAssets.bushMaterial;
    } else if (assetId.startsWith('mountain_fern')) {
      geo0 = ProceduralAssets.createFernGeometry();
      geo1 = geo0;
      mat = ProceduralAssets.bushMaterial;
    } else if (assetId.startsWith('alpine_grass')) {
      geo0 = ProceduralAssets.createGrassGeometry();
      geo1 = geo0;
      mat = ProceduralAssets.grassMaterial;
    } else if (assetId.startsWith('granite_boulder_a')) {
      geo0 = ProceduralAssets.createRockGeometry(0);
      geo1 = geo0;
      mat = ProceduralAssets.rockMaterial;
      castShadow = true;
    } else {
      // granite_boulder_b
      geo0 = ProceduralAssets.createRockGeometry(1);
      geo1 = geo0;
      mat = ProceduralAssets.rockMaterial;
      castShadow = true;
    }

    // 1. Build LOD 0 InstancedMesh
    const meshLOD0 = new THREE.InstancedMesh(geo0, mat, count);
    meshLOD0.castShadow = castShadow;
    meshLOD0.receiveShadow = true;
    for (let i = 0; i < count; i++) meshLOD0.setMatrixAt(i, matrices[i]);
    meshLOD0.instanceMatrix.needsUpdate = true;
    this.lod0Group.add(meshLOD0);
    this.instancedMeshes.push(meshLOD0);

    // 2. Build LOD 1 InstancedMesh
    const meshLOD1 = new THREE.InstancedMesh(geo1, mat, count);
    meshLOD1.receiveShadow = true;
    for (let i = 0; i < count; i++) meshLOD1.setMatrixAt(i, matrices[i]);
    meshLOD1.instanceMatrix.needsUpdate = true;
    this.lod1Group.add(meshLOD1);
    this.instancedMeshes.push(meshLOD1);

    // 3. Build LOD 2 InstancedMesh (if available)
    if (geo2) {
      const meshLOD2 = new THREE.InstancedMesh(geo2, mat, count);
      for (let i = 0; i < count; i++) meshLOD2.setMatrixAt(i, matrices[i]);
      meshLOD2.instanceMatrix.needsUpdate = true;
      this.lod2Group.add(meshLOD2);
      this.instancedMeshes.push(meshLOD2);
    }
  }

  /**
   * Updates LOD tier or distance culling for this chunk based on distance to player.
   */
  public updateLOD(cameraPos: THREE.Vector3, lodScale: number = 1.0): void {
    const dx = cameraPos.x - this.center.x;
    const dz = cameraPos.z - this.center.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    const lod0Dist = 45.0 * lodScale;
    const lod1Dist = 110.0 * lodScale;
    const cullDist = 220.0 * lodScale;

    if (dist > cullDist) {
      // Out of view distance: completely cull chunk
      if (this.activeLOD !== -1) {
        this.lod0Group.visible = false;
        this.lod1Group.visible = false;
        this.lod2Group.visible = false;
        this.activeLOD = -1;
        this.state = ChunkState.INACTIVE;
      }
      return;
    }

    this.state = ChunkState.ACTIVE;

    if (dist < lod0Dist) {
      if (this.activeLOD !== 0) {
        this.lod0Group.visible = true;
        this.lod1Group.visible = false;
        this.lod2Group.visible = false;
        this.activeLOD = 0;
      }
    } else if (dist < lod1Dist) {
      if (this.activeLOD !== 1) {
        this.lod0Group.visible = false;
        this.lod1Group.visible = true;
        this.lod2Group.visible = false;
        this.activeLOD = 1;
      }
    } else {
      if (this.activeLOD !== 2) {
        this.lod0Group.visible = false;
        this.lod1Group.visible = false;
        this.lod2Group.visible = true;
        this.activeLOD = 2;
      }
    }
  }

  public get currentLOD(): number {
    return this.activeLOD;
  }

  public get totalInstances(): number {
    let sum = 0;
    for (const m of this.lod0Group.children) {
      if ((m as THREE.InstancedMesh).isInstancedMesh) {
        sum += (m as THREE.InstancedMesh).count;
      }
    }
    return sum;
  }

  public dispose(): void {
    this.state = ChunkState.DISPOSED;
    for (const m of this.instancedMeshes) {
      if (m.geometry) m.geometry.dispose();
    }
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.instancedMeshes = [];
  }
}

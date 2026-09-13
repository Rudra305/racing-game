import * as THREE from 'three';
import { TrackSampler } from '../tracks/TrackSampler';
import { Terrain } from '../terrain/Terrain';
import { BiomeDefinition, BiomeType } from './EnvironmentTypes';
import { BIOME_REGISTRY } from './Biome';
import { VegetationDistributor } from './VegetationDistributor';
import { EnvironmentChunk } from './EnvironmentChunk';
import { PropSystem } from './PropSystem';
import { DistantScenery } from './DistantScenery';

export interface EnvironmentMetrics {
  totalChunks: number;
  visibleChunks: number;
  totalInstances: number;
  lod0Count: number;
  lod1Count: number;
  lod2Count: number;
  culledCount: number;
}

export class EnvironmentManager {
  public readonly group: THREE.Group = new THREE.Group();
  public readonly biome: BiomeDefinition;

  private chunks: EnvironmentChunk[] = [];
  private propSystem: PropSystem;
  private distantScenery: DistantScenery;

  private lodScale: number = 1.0;
  private lastUpdatePosition: THREE.Vector3 = new THREE.Vector3(9999, 9999, 9999);

  constructor(
    sampler: TrackSampler,
    terrain: Terrain,
    biomeType: BiomeType = BiomeType.ALPINE_FOREST,
    seed: number = 12345
  ) {
    this.biome = BIOME_REGISTRY[biomeType] || BIOME_REGISTRY[BiomeType.ALPINE_FOREST];

    // 1. Panoramic Distant Horizon Scenery (Mesas / Mountains / Headlands)
    this.distantScenery = new DistantScenery(950, 24, this.biome.id);
    this.group.add(this.distantScenery.group);

    // 2. Roadside Props (Guardrails, Signs, Reflectors, Landmarks)
    this.propSystem = new PropSystem(sampler, terrain, this.biome);
    this.group.add(this.propSystem.group);

    // 3. Procedural Vegetation Chunks with 3-tier LOD
    const chunkCount = 24;
    const placements = VegetationDistributor.distribute(sampler, terrain, this.biome, chunkCount, seed);

    for (const p of placements) {
      const chunk = new EnvironmentChunk(p);
      this.chunks.push(chunk);
      this.group.add(chunk.group);
    }
  }

  /**
   * Updates chunk visibility, distance culling, and LOD tiers based on player vehicle position.
   * Throttled by displacement threshold to avoid redundant CPU work in the hot loop.
   */
  public update(vehiclePosition: THREE.Vector3): void {
    // Only re-evaluate LOD and culling if vehicle moved more than 2 meters
    const dx = vehiclePosition.x - this.lastUpdatePosition.x;
    const dz = vehiclePosition.z - this.lastUpdatePosition.z;
    if (dx * dx + dz * dz < 4.0) return;

    this.lastUpdatePosition.copy(vehiclePosition);

    // Update distant scenery position to maintain horizon illusion
    this.distantScenery.updatePosition(vehiclePosition);

    // Update each environment chunk LOD and culling
    for (const chunk of this.chunks) {
      chunk.updateLOD(vehiclePosition, this.lodScale);
    }
  }

  /**
   * Adjusts LOD distance scale based on user graphics settings (e.g. 0.75 for Low, 1.25 for Ultra)
   */
  public setLODScale(scale: number): void {
    this.lodScale = Math.max(0.5, Math.min(2.0, scale));
    this.lastUpdatePosition.set(9999, 9999, 9999); // Force refresh
  }

  public getMetrics(): EnvironmentMetrics {
    let visibleChunks = 0;
    let totalInstances = 0;
    let lod0 = 0;
    let lod1 = 0;
    let lod2 = 0;
    let culled = 0;

    for (const chunk of this.chunks) {
      const lod = chunk.currentLOD;
      if (lod === -1) {
        culled++;
      } else {
        visibleChunks++;
        totalInstances += chunk.totalInstances;
        if (lod === 0) lod0++;
        else if (lod === 1) lod1++;
        else if (lod === 2) lod2++;
      }
    }

    return {
      totalChunks: this.chunks.length,
      visibleChunks,
      totalInstances,
      lod0Count: lod0,
      lod1Count: lod1,
      lod2Count: lod2,
      culledCount: culled
    };
  }

  public dispose(): void {
    this.distantScenery.dispose();
    this.propSystem.dispose();
    for (const c of this.chunks) {
      c.dispose();
    }
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.chunks = [];
  }
}

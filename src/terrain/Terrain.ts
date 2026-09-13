import * as THREE from 'three';
import { TerrainDefinition } from '../tracks/TrackTypes';
import { TrackSampler } from '../tracks/TrackSampler';
import { TerrainGenerator, GeneratedTerrainData } from './TerrainGenerator';
import { SurfaceProperties, SURFACE_PROPERTIES } from './TerrainSurface';

export class Terrain {
  public readonly definition: TerrainDefinition;
  public readonly mesh: THREE.Mesh;
  private readonly data: GeneratedTerrainData;

  constructor(
    definition: TerrainDefinition,
    sampler: TrackSampler,
    environmentPreset: 'alpine' | 'coastal' | 'desert' | 'grand-prix' = 'alpine'
  ) {
    this.definition = definition;
    this.data = TerrainGenerator.generate(definition, sampler, environmentPreset);
    this.mesh = this.data.mesh;
  }

  /**
   * Fast height evaluation at world position (x, z).
   */
  public getHeightAt(x: number, z: number): number {
    return this.data.getHeightAt(x, z);
  }

  /**
   * Evaluates terrain surface type at world position (x, z).
   */
  public getSurfaceAt(x: number, z: number): SurfaceProperties {
    const type = this.data.getSurfaceAt(x, z);
    return SURFACE_PROPERTIES[type];
  }

  /**
   * Comprehensive WebGL resource cleanup for track disposal.
   */
  public dispose(): void {
    if (this.mesh.geometry) {
      this.mesh.geometry.dispose();
    }
    if (this.mesh.material) {
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(m => m.dispose());
      } else {
        this.mesh.material.dispose();
      }
    }
  }
}

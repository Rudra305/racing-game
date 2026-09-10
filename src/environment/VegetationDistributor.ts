import * as THREE from 'three';
import { TrackSampler } from '../tracks/TrackSampler';
import { Terrain } from '../terrain/Terrain';
import { BiomeDefinition, VegetationRule } from './EnvironmentTypes';

export interface InstanceTransform {
  position: THREE.Vector3;
  rotationY: number;
  scale: number;
  distanceToTrack: number;
}

export interface ChunkPlacementData {
  chunkIndex: number;
  startDistance: number;
  endDistance: number;
  vegetation: Map<string, InstanceTransform[]>;
}

class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = (seed ^ 0x6a09e667) >>> 0;
  }

  public next(): number {
    this.state = (this.state * 1664525 + 1013904223) >>> 0;
    return this.state / 4294967296;
  }

  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

export class VegetationDistributor {
  /**
   * Distributes vegetation instances deterministically along track corridor into discrete chunks.
   */
  public static distribute(
    sampler: TrackSampler,
    terrain: Terrain,
    biome: BiomeDefinition,
    chunkCount: number = 24,
    seed: number = 12345
  ): ChunkPlacementData[] {
    const rng = new SeededRandom(seed);
    const totalLength = sampler.totalLength;
    const chunkLength = totalLength / chunkCount;

    const chunks: ChunkPlacementData[] = [];

    for (let c = 0; c < chunkCount; c++) {
      const startDist = c * chunkLength;
      const endDist = (c + 1) * chunkLength;

      const chunkData: ChunkPlacementData = {
        chunkIndex: c,
        startDistance: startDist,
        endDistance: endDist,
        vegetation: new Map()
      };

      // Number of track sample slices within this chunk
      const samplesInChunk = Math.max(4, Math.round(chunkLength / 6.0));

      for (let s = 0; s < samplesInChunk; s++) {
        const sliceDist = startDist + (s / samplesInChunk) * chunkLength;
        const sample = sampler.getSampleAtDistance(sliceDist);
        const roadHalf = sample.width * 0.5;

        // Evaluate each vegetation rule
        for (const rule of biome.vegetationRules) {
          this.distributeRuleForSlice(
            rule,
            sample,
            roadHalf,
            sampler,
            terrain,
            rng,
            chunkData
          );
        }
      }

      chunks.push(chunkData);
    }

    return chunks;
  }

  private static distributeRuleForSlice(
    rule: VegetationRule,
    sample: any,
    roadHalf: number,
    sampler: TrackSampler,
    terrain: Terrain,
    rng: SeededRandom,
    chunkData: ChunkPlacementData
  ): void {
    // Determine spawn attempts based on density (rule.density per 1000m²)
    // Slice corridor area roughly: (maxDist - minDist) * 2 * 6m
    const corridorSpan = rule.maxDistFromRoad - rule.minDistFromRoad;
    const area = corridorSpan * 2 * 6.0;
    const expectedCount = (area / 1000.0) * rule.density;
    const intCount = Math.floor(expectedCount);
    const spawnCount = intCount + (rng.next() < expectedCount - intCount ? 1 : 0);

    for (let i = 0; i < spawnCount; i++) {
      // Choose left side or right side of track
      const isRight = rng.next() > 0.5;
      const distFromEdge = rng.range(rule.minDistFromRoad, rule.maxDistFromRoad);
      const lateralDist = (roadHalf + distFromEdge) * (isRight ? 1 : -1);

      // Add slight longitudinal scatter
      const tangJitter = rng.range(-3.0, 3.0);

      // World position calculation
      const x = sample.position.x + sample.bankedRight.x * lateralDist + sample.tangent.x * tangJitter;
      const z = sample.position.z + sample.bankedRight.z * lateralDist + sample.tangent.z * tangJitter;

      // Query terrain height at candidate position
      const y = terrain.getHeightAt(x, z);

      // Verify clearance from ANY track road surface across the circuit
      const candidatePos = new THREE.Vector3(x, y, z);
      const nearestTrackPoint = sampler.findClosestSampleGlobal(candidatePos);
      const ndx = x - nearestTrackPoint.position.x;
      const ndz = z - nearestTrackPoint.position.z;
      const minRoadClearance = nearestTrackPoint.width * 0.5 + 2.5;
      if (ndx * ndx + ndz * ndz < minRoadClearance * minRoadClearance) {
        continue; // Discard: would intersect or obstruct road
      }

      // Elevation filter
      if (rule.minElevation !== undefined && y < rule.minElevation) continue;
      if (rule.maxElevation !== undefined && y > rule.maxElevation) continue;

      const scale = rng.range(rule.scaleRange[0], rule.scaleRange[1]);
      const rotationY = rng.range(0, Math.PI * 2);

      const list = chunkData.vegetation.get(rule.assetId) || [];
      list.push({
        position: new THREE.Vector3(x, y, z),
        rotationY,
        scale,
        distanceToTrack: Math.abs(lateralDist)
      });
      chunkData.vegetation.set(rule.assetId, list);
    }
  }
}

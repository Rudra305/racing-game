import * as THREE from 'three';
import type { SurfaceProperties } from './TerrainSurface';

export interface GroundElevationResult {
  height: number;
  normal: THREE.Vector3;
  surface: SurfaceProperties;
  isRoad: boolean;
  bankAngle: number;
  pitchAngle: number;
  distance: number;
  closestSampleIndex?: number;
  lateralDistance?: number;
  halfRoadWidth?: number;
}

export interface TerrainChunkBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

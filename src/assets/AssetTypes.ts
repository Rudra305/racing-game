import * as THREE from 'three';

export enum AssetType {
  TREE = 'TREE',
  BUSH = 'BUSH',
  GRASS = 'GRASS',
  ROCK = 'ROCK',
  PROP = 'PROP',
  SIGN = 'SIGN',
  TEXTURE = 'TEXTURE',
  VEHICLE = 'VEHICLE'
}

export enum AssetQualityTier {
  HERO = 'HERO',     // Player vehicle, major landmarks
  HIGH = 'HIGH',     // Nearby major environment assets (LOD0)
  MEDIUM = 'MEDIUM', // Normal environment objects (LOD1)
  LOW = 'LOW'        // Distant scenery, billboards (LOD2)
}

export type ProceduralMeshGenerator = () => THREE.BufferGeometry | THREE.Group | THREE.Mesh;

export interface GameAssetDefinition {
  id: string;
  name: string;
  source: 'polyfork' | 'poly-pizza' | 'free3d' | 'threejs' | 'kenney' | 'procedural';
  sourceUrl: string;
  category:
    | 'vehicle'
    | 'vegetation'
    | 'rock'
    | 'road'
    | 'prop'
    | 'building'
    | 'sign'
    | 'barrier'
    | 'terrain';
  path: string;
  license: string;
  triangles?: number;
  dimensions?: { x: number; y: number; z: number };
  lod?: {
    high?: string;
    medium?: string;
    low?: string;
  };
  proceduralFallback?: ProceduralMeshGenerator;
}

export interface EnvironmentAsset {
  id: string;
  type: AssetType;
  tier: AssetQualityTier;
  url?: string;
  lodUrls?: string[];
  preload?: boolean;
  priority?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  proceduralFallback?: ProceduralMeshGenerator;
}

export interface AssetManifest {
  version: string;
  assets: EnvironmentAsset[];
}

export interface AssetLoadProgress {
  url: string;
  loaded: number;
  total: number;
  percentage: number;
}

export interface AssetValidationResult {
  valid: boolean;
  triangles: number;
  geometries: number;
  materials: number;
  warnings: string[];
}

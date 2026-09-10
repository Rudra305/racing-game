export enum BiomeType {
  ALPINE_FOREST = 'ALPINE_FOREST',
  COASTAL = 'COASTAL',
  DESERT_CANYON = 'DESERT_CANYON'
}

export enum ChunkState {
  UNLOADED = 'UNLOADED',
  LOADING = 'LOADING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISPOSED = 'DISPOSED'
}

export interface VegetationRule {
  assetId: string;
  lodVariantIds?: string[];
  minDistFromRoad: number;
  maxDistFromRoad: number;
  minElevation?: number;
  maxElevation?: number;
  maxSlope?: number;
  density: number; // instances per 1000m²
  scaleRange: [number, number];
  castShadow?: boolean;
}

export interface PropRule {
  type: 'guardrail' | 'chevron' | 'speed_sign' | 'reflector' | 'boulder' | 'landmark';
  assetId: string;
  intervalMeters?: number;
  lateralOffset?: number;
  curvatureThreshold?: number; // minimum road curvature to place (e.g. for chevrons / guardrails)
  specificDistances?: number[]; // exact track distances for unique props/landmarks
}

export interface BiomeDefinition {
  id: BiomeType;
  name: string;
  vegetationRules: VegetationRule[];
  propRules: PropRule[];
  fogColor: number;
  fogNear: number;
  fogFar: number;
  sunColor: number;
  sunIntensity: number;
  skyZenithColor?: number;
  skyHorizonColor?: number;
}

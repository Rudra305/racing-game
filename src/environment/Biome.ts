import { BiomeType, BiomeDefinition } from './EnvironmentTypes';

export const ALPINE_FOREST_BIOME: BiomeDefinition = {
  id: BiomeType.ALPINE_FOREST,
  name: 'Alpine Forest & Mountain Pass',
  fogColor: 0x86b0d9,
  fogNear: 90,
  fogFar: 550,
  sunColor: 0xfff4e0,
  sunIntensity: 2.2,
  skyZenithColor: 0x0a1d37,
  skyHorizonColor: 0x86b0d9,
  vegetationRules: [
    // 1. Tall Alpine Fir (Dense mountain evergreen forest)
    {
      assetId: 'alpine_fir_lod0',
      lodVariantIds: ['alpine_fir_lod0', 'alpine_fir_lod1', 'alpine_fir_lod2'],
      minDistFromRoad: 18,
      maxDistFromRoad: 140,
      minElevation: -5,
      maxElevation: 46,
      maxSlope: 0.8,
      density: 5.5,
      scaleRange: [0.85, 1.4],
      castShadow: true
    },
    // 2. Scots Mountain Pine (Layered canopy pine)
    {
      assetId: 'alpine_pine_lod0',
      lodVariantIds: ['alpine_pine_lod0', 'alpine_pine_lod1'],
      minDistFromRoad: 22,
      maxDistFromRoad: 120,
      minElevation: 2,
      maxElevation: 48,
      maxSlope: 0.75,
      density: 4.0,
      scaleRange: [0.8, 1.3],
      castShadow: true
    },
    // 3. Mountain Birch (Deciduous accents in valley floors)
    {
      assetId: 'mountain_birch_lod0',
      minDistFromRoad: 15,
      maxDistFromRoad: 70,
      minElevation: -5,
      maxElevation: 24, // Lower valley altitudes only
      maxSlope: 0.5,
      density: 2.2,
      scaleRange: [0.9, 1.25],
      castShadow: true
    },
    // 4. Alpine Undergrowth Shrub
    {
      assetId: 'alpine_bush_lod0',
      minDistFromRoad: 9,
      maxDistFromRoad: 35,
      density: 6.0,
      scaleRange: [0.75, 1.35],
      castShadow: false
    },
    // 5. Mountain Fern Patches
    {
      assetId: 'mountain_fern',
      minDistFromRoad: 8.5,
      maxDistFromRoad: 22,
      density: 4.5,
      scaleRange: [0.8, 1.2],
      castShadow: false
    },
    // 6. Roadside Alpine Grass Clusters
    {
      assetId: 'alpine_grass',
      minDistFromRoad: 7.2,
      maxDistFromRoad: 16,
      density: 8.0,
      scaleRange: [0.9, 1.5],
      castShadow: false
    },
    // 7. Granite Boulders
    {
      assetId: 'granite_boulder_a',
      minDistFromRoad: 8.5,
      maxDistFromRoad: 60,
      density: 2.8,
      scaleRange: [0.8, 2.2],
      castShadow: true
    },
    {
      assetId: 'granite_boulder_b',
      minDistFromRoad: 12,
      maxDistFromRoad: 80,
      density: 2.0,
      scaleRange: [1.1, 2.8],
      castShadow: true
    }
  ],
  propRules: [
    // W-beam guardrails on curves and steep drops
    {
      type: 'guardrail',
      assetId: 'guardrail_segment',
      intervalMeters: 3.0,
      lateralOffset: 7.5,
      curvatureThreshold: 0.005
    },
    // Direction chevrons on sharp corners
    {
      type: 'chevron',
      assetId: 'sign_chevron_right',
      curvatureThreshold: 0.012
    },
    // Speed limit warning signs
    {
      type: 'speed_sign',
      assetId: 'sign_speed_80',
      intervalMeters: 350
    },
    // Edge guide reflector posts along straightaways and verges
    {
      type: 'reflector',
      assetId: 'reflector_bollard',
      intervalMeters: 24,
      lateralOffset: 7.2
    },
    // Alpine Lookout Tower Landmark
    {
      type: 'landmark',
      assetId: 'landmark_lookout_tower',
      specificDistances: [260]
    },
    // Summit Weather Radar Mast Landmark
    {
      type: 'landmark',
      assetId: 'landmark_summit_mast',
      specificDistances: [640]
    }
  ]
};

export const BIOME_REGISTRY: Record<BiomeType, BiomeDefinition> = {
  [BiomeType.ALPINE_FOREST]: ALPINE_FOREST_BIOME,
  [BiomeType.COASTAL]: {
    ...ALPINE_FOREST_BIOME,
    id: BiomeType.COASTAL,
    name: 'Coastal Highway'
  },
  [BiomeType.DESERT_CANYON]: {
    ...ALPINE_FOREST_BIOME,
    id: BiomeType.DESERT_CANYON,
    name: 'Desert Canyon'
  }
};

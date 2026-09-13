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

export const DESERT_CANYON_BIOME: BiomeDefinition = {
  id: BiomeType.DESERT_CANYON,
  name: 'Canyon Diablo Arid Badlands',
  fogColor: 0xd6a978,
  fogNear: 120,
  fogFar: 680,
  sunColor: 0xfff0d4,
  sunIntensity: 2.6,
  skyZenithColor: 0x142b4d,
  skyHorizonColor: 0xdfb489,
  vegetationRules: [
    // 1. Saguaro Cactus (LOD 0, 1, 2)
    {
      assetId: 'saguaro_cactus_lod0',
      lodVariantIds: ['saguaro_cactus_lod0', 'saguaro_cactus_lod1', 'saguaro_cactus_lod2'],
      minDistFromRoad: 15,
      maxDistFromRoad: 140,
      minElevation: -10,
      maxElevation: 50,
      maxSlope: 0.8,
      density: 5.0,
      scaleRange: [0.8, 1.45],
      castShadow: true
    },
    // 2. Arid Desert Scrub / Tumbleweed
    {
      assetId: 'desert_scrub',
      minDistFromRoad: 8.5,
      maxDistFromRoad: 48,
      density: 7.5,
      scaleRange: [0.75, 1.3],
      castShadow: false
    },
    // 3. Sandstone Canyon Boulders (Variant A)
    {
      assetId: 'desert_sandstone_rock_a',
      minDistFromRoad: 9.5,
      maxDistFromRoad: 70,
      density: 3.5,
      scaleRange: [0.9, 2.6],
      castShadow: true
    },
    // 4. Sandstone Canyon Boulders (Variant B)
    {
      assetId: 'desert_sandstone_rock_b',
      minDistFromRoad: 14,
      maxDistFromRoad: 95,
      density: 2.8,
      scaleRange: [1.2, 3.2],
      castShadow: true
    }
  ],
  propRules: [
    {
      type: 'guardrail',
      assetId: 'guardrail_segment',
      intervalMeters: 3.0,
      lateralOffset: 8.5,
      curvatureThreshold: 0.006
    },
    {
      type: 'chevron',
      assetId: 'sign_chevron_right',
      curvatureThreshold: 0.012
    },
    {
      type: 'speed_sign',
      assetId: 'sign_speed_80',
      intervalMeters: 400
    },
    {
      type: 'reflector',
      assetId: 'reflector_bollard',
      intervalMeters: 28,
      lateralOffset: 8.2
    },
    {
      type: 'landmark',
      assetId: 'landmark_sandstone_arch',
      specificDistances: [420]
    },
    {
      type: 'landmark',
      assetId: 'landmark_canyon_beacon',
      specificDistances: [980]
    }
  ]
};

export const COASTAL_BIOME: BiomeDefinition = {
  id: BiomeType.COASTAL,
  name: 'Pacific Coastal Highway',
  fogColor: 0x9bc2d9,
  fogNear: 100,
  fogFar: 620,
  sunColor: 0xfffaed,
  sunIntensity: 2.3,
  skyZenithColor: 0x0c2548,
  skyHorizonColor: 0x9bc2d9,
  vegetationRules: [
    // 1. Coastal Palm Trees (LOD 0, 1, 2)
    {
      assetId: 'coastal_palm_lod0',
      lodVariantIds: ['coastal_palm_lod0', 'coastal_palm_lod1', 'coastal_palm_lod2'],
      minDistFromRoad: 16,
      maxDistFromRoad: 120,
      minElevation: -5,
      maxElevation: 35,
      maxSlope: 0.7,
      density: 4.5,
      scaleRange: [0.85, 1.4],
      castShadow: true
    },
    // 2. Coastal Dune Grass / Scrub
    {
      assetId: 'coastal_scrub',
      minDistFromRoad: 8.5,
      maxDistFromRoad: 38,
      density: 8.0,
      scaleRange: [0.8, 1.4],
      castShadow: false
    },
    // 3. Marine Bluff Sea Stack Rocks
    {
      assetId: 'coastal_rock',
      minDistFromRoad: 9.0,
      maxDistFromRoad: 75,
      density: 3.2,
      scaleRange: [0.9, 2.4],
      castShadow: true
    }
  ],
  propRules: [
    {
      type: 'guardrail',
      assetId: 'guardrail_segment',
      intervalMeters: 3.0,
      lateralOffset: 9.0,
      curvatureThreshold: 0.005
    },
    {
      type: 'chevron',
      assetId: 'sign_chevron_right',
      curvatureThreshold: 0.010
    },
    {
      type: 'speed_sign',
      assetId: 'sign_speed_80',
      intervalMeters: 350
    },
    {
      type: 'reflector',
      assetId: 'reflector_bollard',
      intervalMeters: 25,
      lateralOffset: 8.8
    },
    {
      type: 'landmark',
      assetId: 'landmark_coastal_lighthouse',
      specificDistances: [380]
    }
  ]
};

export const BIOME_REGISTRY: Record<BiomeType, BiomeDefinition> = {
  [BiomeType.ALPINE_FOREST]: ALPINE_FOREST_BIOME,
  [BiomeType.COASTAL]: COASTAL_BIOME,
  [BiomeType.DESERT_CANYON]: DESERT_CANYON_BIOME
};

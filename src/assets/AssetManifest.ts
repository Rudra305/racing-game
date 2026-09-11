import { AssetManifest, AssetType, AssetQualityTier, GameAssetDefinition } from './AssetTypes';
import { ProceduralAssets } from '../environment/ProceduralAssets';

export const ENVIRONMENT_ASSET_MANIFEST: AssetManifest = {
  version: '1.0.0',
  assets: [
    // 1. Trees
    {
      id: 'alpine_fir_lod0',
      type: AssetType.TREE,
      tier: AssetQualityTier.HIGH,
      url: '/assets/environment/vegetation/trees/alpine_fir_lod0.glb',
      priority: 10,
      castShadow: true,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createFirGeometry(0)
    },
    {
      id: 'alpine_fir_lod1',
      type: AssetType.TREE,
      tier: AssetQualityTier.MEDIUM,
      url: '/assets/environment/vegetation/trees/alpine_fir_lod1.glb',
      priority: 8,
      castShadow: false,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createFirGeometry(1)
    },
    {
      id: 'alpine_fir_lod2',
      type: AssetType.TREE,
      tier: AssetQualityTier.LOW,
      url: '/assets/environment/vegetation/trees/alpine_fir_lod2.glb',
      priority: 5,
      castShadow: false,
      receiveShadow: false,
      proceduralFallback: () => ProceduralAssets.createFirGeometry(2)
    },
    {
      id: 'alpine_pine_lod0',
      type: AssetType.TREE,
      tier: AssetQualityTier.HIGH,
      url: '/assets/environment/vegetation/trees/alpine_pine_lod0.glb',
      priority: 9,
      castShadow: true,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createPineGeometry(0)
    },
    {
      id: 'alpine_pine_lod1',
      type: AssetType.TREE,
      tier: AssetQualityTier.MEDIUM,
      url: '/assets/environment/vegetation/trees/alpine_pine_lod1.glb',
      priority: 7,
      castShadow: false,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createPineGeometry(1)
    },
    {
      id: 'mountain_birch_lod0',
      type: AssetType.TREE,
      tier: AssetQualityTier.HIGH,
      url: '/assets/environment/vegetation/trees/mountain_birch_lod0.glb',
      priority: 7,
      castShadow: true,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createBirchGeometry(0)
    },

    // 2. Bushes & Undergrowth
    {
      id: 'alpine_bush_lod0',
      type: AssetType.BUSH,
      tier: AssetQualityTier.MEDIUM,
      priority: 6,
      castShadow: false,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createBushGeometry(0)
    },
    {
      id: 'mountain_fern',
      type: AssetType.BUSH,
      tier: AssetQualityTier.LOW,
      priority: 4,
      castShadow: false,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createFernGeometry()
    },
    {
      id: 'alpine_grass',
      type: AssetType.GRASS,
      tier: AssetQualityTier.LOW,
      priority: 3,
      castShadow: false,
      receiveShadow: false,
      proceduralFallback: () => ProceduralAssets.createGrassGeometry()
    },

    // 3. Rocks
    {
      id: 'granite_boulder_a',
      type: AssetType.ROCK,
      tier: AssetQualityTier.MEDIUM,
      priority: 8,
      castShadow: true,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createRockGeometry(0)
    },
    {
      id: 'granite_boulder_b',
      type: AssetType.ROCK,
      tier: AssetQualityTier.MEDIUM,
      priority: 7,
      castShadow: true,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createRockGeometry(1)
    },

    // 4. Props & Road Furniture
    {
      id: 'guardrail_segment',
      type: AssetType.PROP,
      tier: AssetQualityTier.HIGH,
      priority: 10,
      castShadow: true,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createGuardrailSegmentGeometry(3.0)
    },
    {
      id: 'sign_chevron_right',
      type: AssetType.SIGN,
      tier: AssetQualityTier.HIGH,
      priority: 9,
      castShadow: true,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createChevronSignGeometry(true)
    },
    {
      id: 'sign_chevron_left',
      type: AssetType.SIGN,
      tier: AssetQualityTier.HIGH,
      priority: 9,
      castShadow: true,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createChevronSignGeometry(false)
    },
    {
      id: 'sign_speed_80',
      type: AssetType.SIGN,
      tier: AssetQualityTier.HIGH,
      priority: 8,
      castShadow: true,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createSpeedSignGeometry()
    },
    {
      id: 'reflector_bollard',
      type: AssetType.PROP,
      tier: AssetQualityTier.MEDIUM,
      priority: 6,
      castShadow: false,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createReflectorPostGeometry()
    },

    // 5. Landmarks
    {
      id: 'landmark_lookout_tower',
      type: AssetType.PROP,
      tier: AssetQualityTier.HERO,
      priority: 10,
      castShadow: true,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createLookoutTowerGeometry()
    },
    {
      id: 'landmark_summit_mast',
      type: AssetType.PROP,
      tier: AssetQualityTier.HERO,
      priority: 10,
      castShadow: true,
      receiveShadow: true,
      proceduralFallback: () => ProceduralAssets.createSummitMastGeometry()
    }
  ]
};

export const POLYFORK_ASSET_MANIFEST: GameAssetDefinition[] = [
  // 1. Alpine Forest Vegetation
  {
    id: 'tall-pine-tree-ab4108',
    name: 'Tall Pine Tree',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/tall-pine-tree-ab4108',
    category: 'vegetation',
    path: '/assets/models/polyfork/vegetation/tall-pine-tree-ab4108.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 350,
    dimensions: { x: 3.67, y: 9.0, z: 3.56 },
    proceduralFallback: () => ProceduralAssets.createPineGeometry(0)
  },
  {
    id: 'maple-tree-65fa12',
    name: 'Maple Tree',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/maple-tree-65fa12',
    category: 'vegetation',
    path: '/assets/models/polyfork/vegetation/maple-tree-65fa12.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 548,
    dimensions: { x: 3.29, y: 7.48, z: 3.21 },
    proceduralFallback: () => ProceduralAssets.createBirchGeometry(0)
  },
  {
    id: 'dead-tree-6795fa',
    name: 'Dead Tree',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/dead-tree-6795fa',
    category: 'vegetation',
    path: '/assets/models/polyfork/vegetation/dead-tree-6795fa.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 536,
    dimensions: { x: 3.19, y: 5.0, z: 1.87 },
    proceduralFallback: () => ProceduralAssets.createFirGeometry(1)
  },
  {
    id: 'round-bush-cd2ac0',
    name: 'Round Bush',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/round-bush-cd2ac0',
    category: 'vegetation',
    path: '/assets/models/polyfork/vegetation/round-bush-cd2ac0.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 512,
    dimensions: { x: 0.94, y: 0.74, z: 0.82 },
    proceduralFallback: () => ProceduralAssets.createBushGeometry(0)
  },
  {
    id: 'cattail-reed-6abbb3',
    name: 'Cattail Reed',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/cattail-reed-6abbb3',
    category: 'vegetation',
    path: '/assets/models/polyfork/vegetation/cattail-reed-6abbb3.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 388,
    dimensions: { x: 0.39, y: 1.2, z: 0.29 },
    proceduralFallback: () => ProceduralAssets.createGrassGeometry()
  },
  {
    id: 'tree-stump-ec3f48',
    name: 'Tree Stump',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/tree-stump-ec3f48',
    category: 'vegetation',
    path: '/assets/models/polyfork/vegetation/tree-stump-ec3f48.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 505,
    dimensions: { x: 0.82, y: 0.48, z: 0.72 },
    proceduralFallback: () => ProceduralAssets.createRockGeometry(1)
  },
  {
    id: 'fallen-log-1685fb',
    name: 'Fallen Log',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/fallen-log-1685fb',
    category: 'vegetation',
    path: '/assets/models/polyfork/vegetation/fallen-log-1685fb.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 484,
    dimensions: { x: 3.09, y: 0.9, z: 0.7 },
    proceduralFallback: () => ProceduralAssets.createRockGeometry(0)
  },

  // 2. Alpine Rocks & Geological Formations
  {
    id: 'large-boulder-a29b99',
    name: 'Large Boulder',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/large-boulder-a29b99',
    category: 'rock',
    path: '/assets/models/polyfork/rock/large-boulder-a29b99.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 295,
    dimensions: { x: 2.2, y: 1.34, z: 1.98 },
    proceduralFallback: () => ProceduralAssets.createRockGeometry(0)
  },
  {
    id: 'medium-rock-e08405',
    name: 'Medium Rock',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/medium-rock-e08405',
    category: 'rock',
    path: '/assets/models/polyfork/rock/medium-rock-e08405.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 173,
    dimensions: { x: 1.0, y: 0.63, z: 0.79 },
    proceduralFallback: () => ProceduralAssets.createRockGeometry(1)
  },
  {
    id: 'small-rock-db33a7',
    name: 'Small Rock',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/small-rock-db33a7',
    category: 'rock',
    path: '/assets/models/polyfork/rock/small-rock-db33a7.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 202,
    dimensions: { x: 0.35, y: 0.22, z: 0.26 },
    proceduralFallback: () => ProceduralAssets.createRockGeometry(1)
  },
  {
    id: 'rock-spire-13819c',
    name: 'Rock Spire',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/rock-spire-13819c',
    category: 'rock',
    path: '/assets/models/polyfork/rock/rock-spire-13819c.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 378,
    dimensions: { x: 1.29, y: 3.5, z: 1.46 },
    proceduralFallback: () => ProceduralAssets.createRockGeometry(0)
  },

  // 3. Trackside Furniture, Barriers & Props
  {
    id: 'guardrail-d3bd42',
    name: 'Roadside Guardrail',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/guardrail-d3bd42',
    category: 'barrier',
    path: '/assets/models/polyfork/barrier/guardrail-d3bd42.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 146,
    dimensions: { x: 4.0, y: 0.9, z: 0.34 },
    proceduralFallback: () => ProceduralAssets.createGuardrailSegmentGeometry(4.0)
  },
  {
    id: 'traffic-cone-c421e4',
    name: 'Traffic Safety Cone',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/traffic-cone-c421e4',
    category: 'prop',
    path: '/assets/models/polyfork/prop/traffic-cone-c421e4.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 312,
    dimensions: { x: 0.35, y: 0.5, z: 0.35 },
    proceduralFallback: () => ProceduralAssets.createReflectorPostGeometry()
  },
  {
    id: 'tire-ccf0eb',
    name: 'Trackside Tire Barrier',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/tire-ccf0eb',
    category: 'barrier',
    path: '/assets/models/polyfork/barrier/tire-ccf0eb.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 520,
    dimensions: { x: 0.7, y: 0.68, z: 0.28 },
    proceduralFallback: () => ProceduralAssets.createReflectorPostGeometry()
  },
  {
    id: 'oil-drum-386c30',
    name: 'Oil Drum',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/oil-drum-386c30',
    category: 'prop',
    path: '/assets/models/polyfork/prop/oil-drum-386c30.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 532,
    dimensions: { x: 0.62, y: 0.9, z: 0.6 },
    proceduralFallback: () => ProceduralAssets.createReflectorPostGeometry()
  },
  {
    id: 'street-lamp-b4fa26',
    name: 'Circuit Street Lamp',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/street-lamp-b4fa26',
    category: 'prop',
    path: '/assets/models/polyfork/prop/street-lamp-b4fa26.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 422,
    dimensions: { x: 2.25, y: 3.97, z: 0.62 },
    proceduralFallback: () => ProceduralAssets.createReflectorPostGeometry()
  },
  {
    id: 'checkered-flag-81784a',
    name: 'Checkered Finish Flag Post',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/checkered-flag-81784a',
    category: 'prop',
    path: '/assets/models/polyfork/prop/checkered-flag-81784a.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 416,
    dimensions: { x: 0.82, y: 1.85, z: 0.11 },
    proceduralFallback: () => ProceduralAssets.createReflectorPostGeometry()
  },
  {
    id: 'wooden-fence-section-5f04b7',
    name: 'Alpine Wooden Fence',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/wooden-fence-section-5f04b7',
    category: 'barrier',
    path: '/assets/models/polyfork/barrier/wooden-fence-section-5f04b7.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 428,
    dimensions: { x: 2.0, y: 1.1, z: 0.24 },
    proceduralFallback: () => ProceduralAssets.createGuardrailSegmentGeometry(2.0)
  },
  {
    id: 'wooden-fence-gate-a8735f',
    name: 'Alpine Wooden Fence Gate',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/wooden-fence-gate-a8735f',
    category: 'barrier',
    path: '/assets/models/polyfork/barrier/wooden-fence-gate-a8735f.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 408,
    dimensions: { x: 2.0, y: 1.3, z: 0.32 },
    proceduralFallback: () => ProceduralAssets.createGuardrailSegmentGeometry(2.0)
  },
  {
    id: 'diner-sign-ab5f0a',
    name: 'Retro Circuit Billboard Sign',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/diner-sign-ab5f0a',
    category: 'sign',
    path: '/assets/models/polyfork/sign/diner-sign-ab5f0a.glb',
    license: 'Polyfork Standard Asset License (Free Tier)',
    triangles: 588,
    dimensions: { x: 2.23, y: 3.2, z: 0.51 },
    proceduralFallback: () => ProceduralAssets.createSpeedSignGeometry()
  },

  // --- Vehicles (Player 3D Models) ---
  {
    id: 'muscle-car-60s',
    name: '1960s Apex Muscle GT',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/muscle-car-60s-524d46',
    category: 'vehicle',
    path: '/assets/models/polyfork/vehicles/muscle-car-60s.glb',
    license: 'Polyfork Standard Asset License',
    triangles: 4271,
    dimensions: { x: 2.01, y: 1.27, z: 4.74 }
  },
  {
    id: 'hatchback-80s',
    name: '1980s Terra Rally Hatch',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/hatchback-80s-e95554',
    category: 'vehicle',
    path: '/assets/models/polyfork/vehicles/hatchback-80s.glb',
    license: 'Polyfork Standard Asset License',
    triangles: 3633,
    dimensions: { x: 1.97, y: 1.56, z: 4.21 }
  },
  {
    id: 'suburban-pickup',
    name: 'Titan Suburban 4x4',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/suburban-pickup-truck-d15ea2',
    category: 'vehicle',
    path: '/assets/models/polyfork/vehicles/suburban-pickup.glb',
    license: 'Polyfork Standard Asset License',
    triangles: 2339,
    dimensions: { x: 2.0, y: 1.9, z: 5.6 }
  },
  {
    id: 'scout-jeep',
    name: 'Crossfire Scout Jeep',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/scout-jeep-c02efe',
    category: 'vehicle',
    path: '/assets/models/polyfork/vehicles/scout-jeep.glb',
    license: 'Polyfork Standard Asset License',
    triangles: 1772,
    dimensions: { x: 1.85, y: 1.78, z: 3.8 }
  },
  {
    id: 'police-cruiser',
    name: 'Vortex Interceptor Cruiser',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/police-cruiser-a2d25e',
    category: 'vehicle',
    path: '/assets/models/polyfork/vehicles/police-cruiser.glb',
    license: 'Polyfork Standard Asset License',
    triangles: 2130,
    dimensions: { x: 2.05, y: 1.48, z: 4.95 }
  },
  {
    id: 'convertible-60s',
    name: 'Venom GT Convertible',
    source: 'polyfork',
    sourceUrl: 'https://polyfork.dev/asset/convertible-60s-b76f89',
    category: 'vehicle',
    path: '/assets/models/polyfork/vehicles/convertible-60s.glb',
    license: 'Polyfork Standard Asset License',
    triangles: 4880,
    dimensions: { x: 2.18, y: 1.43, z: 5.3 }
  },
  {
    id: 'ferrari-gt',
    name: 'Ferrari 458 Hyper GT',
    source: 'threejs',
    sourceUrl: 'https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf',
    category: 'vehicle',
    path: '/assets/models/vehicles/ferrari-gt.glb',
    license: 'MIT License (Three.js Examples)',
    triangles: 14850,
    dimensions: { x: 1.94, y: 1.21, z: 4.52 }
  },
  {
    id: 'race-car',
    name: 'Apex GT Cup Racer',
    source: 'kenney',
    sourceUrl: 'https://kenney.nl/assets/car-kit',
    category: 'vehicle',
    path: '/assets/models/vehicles/race-car.gltf',
    license: 'CC0 1.0 Universal (Public Domain)',
    triangles: 1240,
    dimensions: { x: 1.6, y: 1.1, z: 4.2 }
  },
  {
    id: 'race-future',
    name: 'Velocity Aero Formula',
    source: 'kenney',
    sourceUrl: 'https://kenney.nl/assets/car-kit',
    category: 'vehicle',
    path: '/assets/models/vehicles/race-future.gltf',
    license: 'CC0 1.0 Universal (Public Domain)',
    triangles: 1380,
    dimensions: { x: 1.65, y: 0.9, z: 4.4 }
  },
  {
    id: 'sports-sedan',
    name: 'Apex Sport Sedan',
    source: 'kenney',
    sourceUrl: 'https://kenney.nl/assets/car-kit',
    category: 'vehicle',
    path: '/assets/models/vehicles/sports-sedan.gltf',
    license: 'CC0 1.0 Universal (Public Domain)',
    triangles: 1190,
    dimensions: { x: 1.6, y: 1.2, z: 4.1 }
  },
  {
    id: 'suv-luxury',
    name: 'Kodiak Luxury Sport SUV',
    source: 'kenney',
    sourceUrl: 'https://kenney.nl/assets/car-kit',
    category: 'vehicle',
    path: '/assets/models/vehicles/suv-luxury.gltf',
    license: 'CC0 1.0 Universal (Public Domain)',
    triangles: 1410,
    dimensions: { x: 1.7, y: 1.45, z: 4.3 }
  }
];


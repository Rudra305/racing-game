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

  // --- Vehicles (Authentic High-Fidelity 3D Models) ---
  {
    id: 'porsche-930-turbo',
    name: '1982 Porsche 911 Turbo 3.3',
    source: 'sketchfab',
    sourceUrl: 'https://skfb.ly/pN8EX',
    category: 'vehicle',
    path: '/assets/models/vehicles/porsche-930-turbo.glb',
    license: 'CC-BY-4.0 (007)',
    triangles: 54000,
    dimensions: { x: 1.78, y: 1.31, z: 4.29 }
  },
  {
    id: 'ferrari-gt',
    name: 'Ferrari 296 GTB Assetto Fiorano',
    source: 'threejs',
    sourceUrl: 'https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf',
    category: 'vehicle',
    path: '/assets/models/vehicles/ferrari-gt.glb',
    license: 'MIT License (Three.js Examples)',
    triangles: 14850,
    dimensions: { x: 1.94, y: 1.21, z: 4.52 }
  },
  {
    id: 'toyota-supra-rz',
    name: 'Toyota Supra RZ (A80 / Mk4)',
    source: 'sketchfab',
    sourceUrl: 'https://sketchfab.com/3d-models/toyota-supra-rz-custom-1332b5276b9742d48cdad5d26cca9b9b',
    category: 'vehicle',
    path: '/assets/models/vehicles/toyota-supra-rz.glb',
    license: 'CC-BY-4.0 (Asphalt 8 Textures)',
    triangles: 31381,
    dimensions: { x: 1.81, y: 1.27, z: 4.52 }
  },
  {
    id: 'toyota-gr-supra-pandem',
    name: '2023 Toyota GR Supra RZ Pandem',
    source: 'sketchfab',
    sourceUrl: 'https://sketchfab.com/3d-models/2023-toyota-gr-supra-rz-db42-pandem-kit-1fa7b2dc48f340878d9e5aaf1000971d',
    category: 'vehicle',
    path: '/assets/models/vehicles/toyota-gr-supra-pandem.glb',
    license: 'CC-BY-NC-4.0 (SIU Car Garage)',
    triangles: 40957,
    dimensions: { x: 1.86, y: 1.29, z: 4.38 }
  },
  {
    id: 'mclaren-765lt',
    name: '2020 McLaren 765LT',
    source: 'sketchfab',
    sourceUrl: 'https://sketchfab.com/3d-models/2020-mclaren-765lt-2f973f267a5e4816b561abe8d8a60054',
    category: 'vehicle',
    path: '/assets/models/vehicles/mclaren-765lt.glb',
    license: 'CC-BY-NC-SA-4.0 (OUTPISTON)',
    triangles: 45494,
    dimensions: { x: 2.16, y: 1.16, z: 4.60 }
  },
  {
    id: 'mitsubishi-lancer-evo-6',
    name: 'Mitsubishi Lancer Evolution VI',
    source: 'sketchfab',
    sourceUrl: 'https://sketchfab.com/3d-models/mitsubishi-lancer-evolution-6-wwwvecarzcom-c3d5dcd8ff724bc88c46760d92fc5188',
    category: 'vehicle',
    path: '/assets/models/vehicles/mitsubishi-lancer-evo-6.glb',
    license: 'CC-BY-4.0 (vecarz)',
    triangles: 80904,
    dimensions: { x: 1.77, y: 1.42, z: 4.35 }
  },
  {
    id: 'mitsubishi-lancer-evo-tme',
    name: '1999 Mitsubishi Lancer Evolution VI GSR T.M.E.',
    source: 'sketchfab',
    sourceUrl: 'https://sketchfab.com/3d-models/1999-mitsubishi-lancer-evolution-vi-gsr-tme-d565cdb23b864308acc9678baa05d5d3',
    category: 'vehicle',
    path: '/assets/models/vehicles/mitsubishi-lancer-evo-tme.glb',
    license: 'CC-BY-NC-4.0 (SIU Car Garage)',
    triangles: 43747,
    dimensions: { x: 1.77, y: 1.42, z: 4.35 }
  },
  {
    id: 'subaru-impreza-22b',
    name: '1998 Subaru Impreza 22B STi Version',
    source: 'sketchfab',
    sourceUrl: 'https://sketchfab.com/3d-models/1998-subaru-impreza-22b-sti-version-66bd94bdd92a4b79a39cd0307870b4eb',
    category: 'vehicle',
    path: '/assets/models/vehicles/subaru-impreza-22b.glb',
    license: 'CC-BY-NC-SA-4.0 (OUTPISTON)',
    triangles: 73162,
    dimensions: { x: 1.77, y: 1.39, z: 4.37 }
  },
  {
    id: 'ford-f150-raptor-r',
    name: '2010 Ford F-150 SVT Raptor R',
    source: 'sketchfab',
    sourceUrl: 'https://sketchfab.com/3d-models/2010-ford-f-150-svt-raptor-r-b7e63d376e59453490907cebbd44ab72',
    category: 'vehicle',
    path: '/assets/models/vehicles/ford-f150-raptor-r.glb',
    license: 'CC-BY-4.0 (Galaxy Car Showroom)',
    triangles: 78840,
    dimensions: { x: 2.19, y: 1.99, z: 5.61 }
  },
  {
    id: 'mclaren-mcl35m-f1',
    name: 'McLaren MCL35M (F1 2021)',
    source: 'sketchfab',
    sourceUrl: 'https://sketchfab.com/3d-models/f1-2021-mclaren-mcl35m-967ecec37468412083c40c62b3d7234d',
    category: 'vehicle',
    path: '/assets/models/vehicles/mclaren-mcl35m-f1.glb',
    license: 'CC-BY-4.0 (Excalibur)',
    triangles: 102081,
    dimensions: { x: 2.00, y: 0.95, z: 5.68 }
  },
  {
    id: 'red-bull-f1',
    name: 'Red Bull Racing F1 (RB16B)',
    source: 'sketchfab',
    sourceUrl: 'https://sketchfab.com/3d-models/red-bull-racing-but-with-detached-tyres-949c8dca6fbe4b76a4739dda69ecf0c0',
    category: 'vehicle',
    path: '/assets/models/vehicles/red-bull-f1.glb',
    license: 'CC-BY-4.0 (Jan Esch)',
    triangles: 44156,
    dimensions: { x: 2.00, y: 0.95, z: 5.50 }
  }
];


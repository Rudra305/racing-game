import { AssetManifest, AssetType, AssetQualityTier } from './AssetTypes';
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

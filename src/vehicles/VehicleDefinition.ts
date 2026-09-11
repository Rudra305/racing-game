import { VehicleCategory } from './VehicleCategory';
import { VehicleConfig } from './VehicleConfig';
import { VehicleCustomization, WheelConfig } from './VehicleCustomization';

export type VehicleBodyType = 'sports' | 'supercar' | 'rally' | 'suv' | 'formula';

export interface VehicleVisualDefinition {
  bodyType: VehicleBodyType;
  defaultColors: VehicleCustomization;
  defaultWheel: WheelConfig;
  modelAssetId?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
  modelRotationY?: number;
  modelScaleMultiplier?: number;
  modelOffsetY?: number;
}

export interface VehicleMetadata {
  role: string;
  strengths: string[];
  weaknesses: string[];
  recommendedTerrain: string;
  difficulty: 'Novice' | 'Intermediate' | 'Expert';
  description: string;
}

export interface VehicleAvailability {
  unlocked: boolean;
  unlockRequirement?: string;
}

export interface VehicleDefinition {
  id: string;
  name: string;
  category: VehicleCategory;
  config: VehicleConfig;
  visuals: VehicleVisualDefinition;
  meta: VehicleMetadata;
  availability: VehicleAvailability;
}

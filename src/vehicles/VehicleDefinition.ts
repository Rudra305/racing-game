import { VehicleCategory } from './VehicleCategory';
import { VehicleConfig } from './VehicleConfig';
import { VehicleCustomization, WheelConfig } from './VehicleCustomization';

export type VehicleBodyType = 'sports' | 'supercar' | 'rally' | 'suv' | 'formula';

export interface VehicleCustomizationCapabilities {
  primaryColor?: boolean;    // Primary Body Paint
  secondaryColor?: boolean;  // Cabin / Canopy / Roof / Splitter
  accentColor?: boolean;     // Calipers / Aerodynamic Accents
  wheelColor?: boolean;      // Wheels / Rims Color
}

export interface VehicleVisualDefinition {
  bodyType: VehicleBodyType;
  defaultColors: VehicleCustomization;
  defaultWheel: WheelConfig;
  modelAssetId?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
  modelRotationX?: number;
  modelRotationY?: number;
  modelRotationZ?: number;
  modelScaleMultiplier?: number;
  modelOffsetY?: number;
  supportsAdvancedCustomization?: boolean;
  applicableCustomizations?: VehicleCustomizationCapabilities;
  isModelPending?: boolean;
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

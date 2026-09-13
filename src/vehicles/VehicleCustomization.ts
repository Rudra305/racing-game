import { VehicleCategory } from './VehicleCategory';

export type WheelStyleId = 'sport_mesh' | 'turbofan' | 'offroad_beadlock' | 'formula_monoblock';
export type LiveryPatternId = 'clean' | 'stripes' | 'split' | 'accent';

export interface WheelConfig {
  style: WheelStyleId;
  color: number;
}

export interface VehicleCustomization {
  primaryColor: number;
  secondaryColor: number;
  accentColor: number;
  wheelStyle: WheelStyleId;
  wheelColor: number;
  liveryPattern: LiveryPatternId;
}

export interface GarageSaveData {
  version: number;
  selectedVehicleId: string;
  selectedCategory: VehicleCategory;
  customizations: Record<string, VehicleCustomization>;
}

const STORAGE_KEY = 'apex_racer_garage_save_v1';
const CURRENT_SAVE_VERSION = 1;

export function getDefaultCustomization(
  primaryColor: number = 0x1f6feb,
  secondaryColor: number = 0x090d13,
  accentColor: number = 0x58a6ff,
  wheelStyle: WheelStyleId = 'sport_mesh',
  wheelColor: number = 0xc9d1d9
): VehicleCustomization {
  return {
    primaryColor,
    secondaryColor,
    accentColor,
    wheelStyle,
    wheelColor,
    liveryPattern: 'clean'
  };
}

export function loadGarageSaveData(): GarageSaveData {
  const fallback: GarageSaveData = {
    version: CURRENT_SAVE_VERSION,
    selectedVehicleId: 'sports_porsche_930',
    selectedCategory: VehicleCategory.SPORTS,
    customizations: {}
  };

  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.version !== CURRENT_SAVE_VERSION) {
      return fallback;
    }

    return {
      version: CURRENT_SAVE_VERSION,
      selectedVehicleId: parsed.selectedVehicleId || fallback.selectedVehicleId,
      selectedCategory: (parsed.selectedCategory in VehicleCategory) ? parsed.selectedCategory : fallback.selectedCategory,
      customizations: parsed.customizations && typeof parsed.customizations === 'object' ? parsed.customizations : {}
    };
  } catch (err) {
    console.warn('Failed to read garage save data from localStorage, using fallback defaults:', err);
    return fallback;
  }
}

export function saveGarageSaveData(data: GarageSaveData): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const payload = JSON.stringify({
      version: CURRENT_SAVE_VERSION,
      selectedVehicleId: data.selectedVehicleId,
      selectedCategory: data.selectedCategory,
      customizations: data.customizations
    });
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch (err) {
    console.warn('Failed to save garage data to localStorage:', err);
  }
}

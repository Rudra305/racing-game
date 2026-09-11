export enum VehicleCategory {
  SPORTS = 'SPORTS',
  SUPERCAR = 'SUPERCAR',
  RALLY = 'RALLY',
  SUV = 'SUV',
  FORMULA = 'FORMULA'
}

export interface CategoryInfo {
  id: VehicleCategory;
  name: string;
  role: string;
  tagline: string;
  badgeColor: string;
  description: string;
}

export const CATEGORY_INFO: Record<VehicleCategory, CategoryInfo> = {
  [VehicleCategory.SPORTS]: {
    id: VehicleCategory.SPORTS,
    name: 'Sports',
    role: 'Balanced All-Rounder',
    tagline: 'Predictable handling & balanced dynamics',
    badgeColor: '#1f6feb',
    description: 'Balanced acceleration, top speed, and predictable handling. Highly accessible with forgiving slip recovery.'
  },
  [VehicleCategory.SUPERCAR]: {
    id: VehicleCategory.SUPERCAR,
    name: 'Supercar',
    role: 'High-Performance Road Racing',
    tagline: 'Extreme top speed & high downforce',
    badgeColor: '#a371f7',
    description: 'Blistering acceleration, ultra-high top speed, and razor-sharp steering with aggressive high-speed aero.'
  },
  [VehicleCategory.RALLY]: {
    id: VehicleCategory.RALLY,
    name: 'Rally',
    role: 'Mixed-Surface / Off-Road Racing',
    tagline: 'High suspension travel & AWD agility',
    badgeColor: '#f0883e',
    description: 'Long suspension travel, explosive low-end torque, and AWD traction optimized for gravel, dirt, and loose surfaces.'
  },
  [VehicleCategory.SUV]: {
    id: VehicleCategory.SUV,
    name: 'SUV',
    role: 'Heavy / Stable Vehicle',
    tagline: 'High mass, high clearance & solid stability',
    badgeColor: '#3fb950',
    description: 'Substantial mass, high ground clearance, and planted stability that powers through rough terrain and impacts.'
  },
  [VehicleCategory.FORMULA]: {
    id: VehicleCategory.FORMULA,
    name: 'Formula',
    role: 'Pure Circuit Performance',
    tagline: 'Extreme cornering grip & razor reflexes',
    badgeColor: '#f85149',
    description: 'Ultra-low ride height, massive aerodynamic downforce, and instantaneous steering response for technical road circuits.'
  }
};

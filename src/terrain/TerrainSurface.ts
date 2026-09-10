export enum SurfaceType {
  ASPHALT = 'ASPHALT',
  KERB = 'KERB',
  GRASS = 'GRASS',
  DIRT = 'DIRT',
  GRAVEL = 'GRAVEL'
}

export interface SurfaceProperties {
  type: SurfaceType;
  grip: number;
  rollingResistance: number;
  accelerationModifier: number;
  brakingModifier: number;
  vibration: number;
  colorHex: number;
}

export const SURFACE_PROPERTIES: Record<SurfaceType, SurfaceProperties> = {
  [SurfaceType.ASPHALT]: {
    type: SurfaceType.ASPHALT,
    grip: 1.0,
    rollingResistance: 1.0,
    accelerationModifier: 1.0,
    brakingModifier: 1.0,
    vibration: 0,
    colorHex: 0x1f242d
  },
  [SurfaceType.KERB]: {
    type: SurfaceType.KERB,
    grip: 0.94,
    rollingResistance: 1.18,
    accelerationModifier: 0.96,
    brakingModifier: 0.95,
    vibration: 1.0,
    colorHex: 0xda3633
  },
  [SurfaceType.GRASS]: {
    type: SurfaceType.GRASS,
    grip: 0.46,
    rollingResistance: 3.2,
    accelerationModifier: 0.70,
    brakingModifier: 0.65,
    vibration: 0.22,
    colorHex: 0x234a2e
  },
  [SurfaceType.DIRT]: {
    type: SurfaceType.DIRT,
    grip: 0.58,
    rollingResistance: 2.4,
    accelerationModifier: 0.80,
    brakingModifier: 0.74,
    vibration: 0.35,
    colorHex: 0x5a432b
  },
  [SurfaceType.GRAVEL]: {
    type: SurfaceType.GRAVEL,
    grip: 0.42,
    rollingResistance: 4.2,
    accelerationModifier: 0.60,
    brakingModifier: 0.58,
    vibration: 0.55,
    colorHex: 0x6e6559
  }
};

export enum SurfaceType {
  ASPHALT = 'ASPHALT',
  KERB = 'KERB',
  GRASS = 'GRASS',
  GRAVEL = 'GRAVEL'
}

export interface SurfaceProperties {
  type: SurfaceType;
  grip: number;
  rollingResistance: number;
  vibration: number;
}

export const SURFACE_PRESETS: Record<SurfaceType, SurfaceProperties> = {
  [SurfaceType.ASPHALT]: {
    type: SurfaceType.ASPHALT,
    grip: 1.0,
    rollingResistance: 1.0,
    vibration: 0
  },
  [SurfaceType.KERB]: {
    type: SurfaceType.KERB,
    grip: 0.95,
    rollingResistance: 1.15,
    vibration: 1.0
  },
  [SurfaceType.GRASS]: {
    type: SurfaceType.GRASS,
    grip: 0.48,
    rollingResistance: 3.2,
    vibration: 0.25
  },
  [SurfaceType.GRAVEL]: {
    type: SurfaceType.GRAVEL,
    grip: 0.42,
    rollingResistance: 4.0,
    vibration: 0.6
  }
};

export class SurfaceSystem {
  public currentSurface: SurfaceType = SurfaceType.ASPHALT;
  public effectiveGrip: number = 1.0;
  public effectiveRollingResistance: number = 1.0;
  public isOnKerb: boolean = false;

  public reset(): void {
    this.currentSurface = SurfaceType.ASPHALT;
    this.effectiveGrip = 1.0;
    this.effectiveRollingResistance = 1.0;
    this.isOnKerb = false;
  }

  /**
   * Evaluates track surface based on vehicle distance from track centerline.
   */
  public update(lateralDistance: number, halfRoadWidth: number): SurfaceProperties {
    const absLat = Math.abs(lateralDistance);
    const kerbStart = halfRoadWidth - 0.7;
    const roadEdge = halfRoadWidth;

    let targetSurface = SurfaceType.ASPHALT;

    if (absLat < kerbStart) {
      targetSurface = SurfaceType.ASPHALT;
      this.isOnKerb = false;
    } else if (absLat < roadEdge + 0.5) {
      targetSurface = SurfaceType.KERB;
      this.isOnKerb = true;
    } else {
      targetSurface = SurfaceType.GRASS;
      this.isOnKerb = false;
    }

    this.currentSurface = targetSurface;
    const targetProps = SURFACE_PRESETS[targetSurface];

    // Smooth transition between surfaces to prevent sharp physics steps
    const blendRate = 0.15;
    this.effectiveGrip += (targetProps.grip - this.effectiveGrip) * blendRate;
    this.effectiveRollingResistance += (targetProps.rollingResistance - this.effectiveRollingResistance) * blendRate;

    return {
      type: targetSurface,
      grip: this.effectiveGrip,
      rollingResistance: this.effectiveRollingResistance,
      vibration: targetProps.vibration
    };
  }
}

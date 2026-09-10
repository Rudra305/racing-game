import { SurfaceType, SurfaceProperties, SURFACE_PROPERTIES } from '../terrain/TerrainSurface';

export { SurfaceType, SURFACE_PROPERTIES };
export type { SurfaceProperties };

export class SurfaceSystem {
  public currentSurface: SurfaceType = SurfaceType.ASPHALT;
  public effectiveGrip: number = 1.0;
  public effectiveRollingResistance: number = 1.0;
  public accelerationModifier: number = 1.0;
  public brakingModifier: number = 1.0;
  public isOnKerb: boolean = false;

  public reset(): void {
    this.currentSurface = SurfaceType.ASPHALT;
    this.effectiveGrip = 1.0;
    this.effectiveRollingResistance = 1.0;
    this.accelerationModifier = 1.0;
    this.brakingModifier = 1.0;
    this.isOnKerb = false;
  }

  /**
   * Updates surface properties using direct track/terrain query result with smooth blending.
   */
  public updateWithProperties(targetProps: SurfaceProperties): SurfaceProperties {
    this.currentSurface = targetProps.type;
    this.isOnKerb = targetProps.type === SurfaceType.KERB;

    // Smooth transition between surfaces to prevent sharp physics shocks
    const blendRate = 0.20;
    this.effectiveGrip += (targetProps.grip - this.effectiveGrip) * blendRate;
    this.effectiveRollingResistance += (targetProps.rollingResistance - this.effectiveRollingResistance) * blendRate;
    this.accelerationModifier += (targetProps.accelerationModifier - this.accelerationModifier) * blendRate;
    this.brakingModifier += (targetProps.brakingModifier - this.brakingModifier) * blendRate;

    return {
      type: this.currentSurface,
      grip: this.effectiveGrip,
      rollingResistance: this.effectiveRollingResistance,
      accelerationModifier: this.accelerationModifier,
      brakingModifier: this.brakingModifier,
      vibration: targetProps.vibration,
      colorHex: targetProps.colorHex
    };
  }

  /**
   * Fallback for lateral distance based surface estimation
   */
  public update(lateralDistance: number, halfRoadWidth: number): SurfaceProperties {
    const absLat = Math.abs(lateralDistance);
    let targetType = SurfaceType.ASPHALT;

    if (absLat < halfRoadWidth - 0.6) {
      targetType = SurfaceType.ASPHALT;
    } else if (absLat <= halfRoadWidth + 0.9) {
      targetType = SurfaceType.KERB;
    } else if (absLat <= halfRoadWidth + 6.0) {
      targetType = SurfaceType.DIRT;
    } else {
      targetType = SurfaceType.GRASS;
    }

    return this.updateWithProperties(SURFACE_PROPERTIES[targetType]);
  }
}

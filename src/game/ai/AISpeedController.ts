export interface SpeedControlOutput {
  throttle: number;
  brake: number;
}

export class AISpeedController {
  private currentThrottle: number = 0;
  private currentBrake: number = 0;

  public reset(): void {
    this.currentThrottle = 0;
    this.currentBrake = 0;
  }

  public computeControls(
    currentSpeedMs: number,
    targetSpeedMs: number,
    brakingAggression: number,
    isOffRoad: boolean,
    dt: number
  ): SpeedControlOutput {
    // 1. If car is off-track on grass/gravel, reduce target speed to regain traction
    let effectiveTarget = targetSpeedMs;
    if (isOffRoad) {
      effectiveTarget *= 0.65;
    }

    const speedDiff = effectiveTarget - currentSpeedMs;

    let targetThrottle = 0;
    let targetBrake = 0;

    if (speedDiff > 0.5) {
      // Need acceleration: proportional throttle
      targetThrottle = Math.min(1.0, 0.4 + speedDiff * 0.15);
      targetBrake = 0;
    } else if (speedDiff < -1.2) {
      // Need braking: proportional brake scaled by aggression
      const excess = -speedDiff;
      targetThrottle = 0;
      targetBrake = Math.min(1.0, excess * 0.18 * brakingAggression);
    } else {
      // Coasting / maintenance in sweet spot
      targetThrottle = Math.max(0.1, Math.min(0.5, speedDiff * 0.2));
      targetBrake = 0;
    }

    // Rate-limit throttle and brake adjustments for realism
    const filterRate = 12.0;
    const blend = Math.min(1.0, dt * filterRate);
    this.currentThrottle += (targetThrottle - this.currentThrottle) * blend;
    this.currentBrake += (targetBrake - this.currentBrake) * blend;

    return {
      throttle: Math.max(0, Math.min(1, this.currentThrottle)),
      brake: Math.max(0, Math.min(1, this.currentBrake))
    };
  }
}

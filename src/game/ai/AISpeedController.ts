export interface SpeedControlOutput {
  throttle: number;
  brake: number;
}

export class AISpeedController {
  private currentThrottle: number = 0;
  private currentBrake: number = 0;
  private readonly _speedOutput: SpeedControlOutput = { throttle: 0, brake: 0 };

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
      effectiveTarget *= 0.6;
    }

    const speedDiff = effectiveTarget - currentSpeedMs;

    let targetThrottle = 0;
    let targetBrake = 0;

    if (speedDiff > 0.8) {
      // Full throttle acceleration out of corners and along straights
      targetThrottle = 1.0;
      targetBrake = 0;
    } else if (speedDiff > 0.1) {
      // Fine throttle modulation near target speed
      targetThrottle = Math.max(0.2, Math.min(1.0, 0.5 + speedDiff * 0.6));
      targetBrake = 0;
    } else if (speedDiff < -1.0) {
      // Progressive threshold braking scaled by aggression
      const excess = -speedDiff;
      targetThrottle = 0;
      targetBrake = Math.min(1.0, excess * 0.18 * Math.max(0.5, brakingAggression));
    } else {
      // Coasting / maintenance in sweet spot
      targetThrottle = Math.max(0.05, Math.min(0.40, speedDiff * 0.35));
      targetBrake = 0;
    }

    // Rate-limit throttle and brake adjustments (18 rad/s allows crisp sports car drive-by-wire)
    const filterRate = 18.0;
    const blend = 1.0 - Math.exp(-filterRate * dt);
    this.currentThrottle += (targetThrottle - this.currentThrottle) * blend;
    this.currentBrake += (targetBrake - this.currentBrake) * blend;

    this._speedOutput.throttle = Math.max(0, Math.min(1, this.currentThrottle));
    this._speedOutput.brake = Math.max(0, Math.min(1, this.currentBrake));
    return this._speedOutput;
  }
}

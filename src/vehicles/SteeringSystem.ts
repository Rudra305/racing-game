export type SteeringAssistMode = 'OFF' | 'LOW' | 'MEDIUM' | 'HIGH';
export type SteeringPreset = 'Simulation' | 'Balanced' | 'Arcade' | 'Custom';

export interface SteeringSettings {
  sensitivity: number;
  returnSpeed: number;
  smoothing: number;
  steeringAssist: SteeringAssistMode;
  deadzone: number;
  preset: SteeringPreset;
}

export interface SteeringTelemetry {
  rawInput: number;
  afterDeadzone: number;
  sensitivity: number;
  speedMultiplier: number;
  assistCorrection: number;
  finalSteeringAngle: number;
}

export const DEFAULT_STEERING_SETTINGS: SteeringSettings = {
  sensitivity: 1.0,
  returnSpeed: 7.5,
  smoothing: 6.5,
  steeringAssist: 'LOW',
  deadzone: 0.05,
  preset: 'Balanced'
};

export class SteeringSystem {
  public settings: SteeringSettings;
  public currentSteerAngle: number = 0; // in radians
  public maxSteeringAngle: number = 0.52; // ~30 deg

  // Telemetry
  public telemetry: SteeringTelemetry = {
    rawInput: 0,
    afterDeadzone: 0,
    sensitivity: 1.0,
    speedMultiplier: 1.0,
    assistCorrection: 0,
    finalSteeringAngle: 0
  };

  // Internal smoothed input state to avoid abrupt keyboard step-inputs
  private filteredInput: number = 0;

  constructor(maxAngle: number = 0.52) {
    this.maxSteeringAngle = maxAngle;
    this.settings = this.loadSettings();
  }

  public reset(): void {
    this.currentSteerAngle = 0;
    this.filteredInput = 0;
  }

  public setMaxAngle(angle: number): void {
    this.maxSteeringAngle = angle;
  }

  /**
   * Evaluates the full steering pipeline:
   * Raw Input -> Deadzone -> Progressive Curve -> Sensitivity -> Speed Tapering -> Assist -> Smoothing & Natural Centering
   */
  public update(dt: number, rawInput: number, speedKmH: number, lateralSpeed: number): number {
    this.telemetry.rawInput = rawInput;

    const isCentering = Math.abs(rawInput) < this.settings.deadzone;

    // 1. Deadzone
    let val = 0;
    if (!isCentering) {
      val = Math.sign(rawInput) * ((Math.abs(rawInput) - this.settings.deadzone) / (1.0 - this.settings.deadzone));
    }
    this.telemetry.afterDeadzone = val;

    // 2. Input filtering & Target Angle Computation
    let targetAngle = 0;

    if (!isCentering) {
      // Build up input progressively (7.5/s) to prevent jarring binary keyboard snaps
      const inputBlend = 1.0 - Math.exp(-8.0 * dt);
      this.filteredInput += (val - this.filteredInput) * inputBlend;

      // Progressive Response Curve (Cubic blend for precise straight-line control)
      const fVal = this.filteredInput;
      const curvedInput = 0.65 * (fVal * fVal * fVal) + 0.35 * fVal;

      // Sensitivity: scales input authority cleanly clamped to [-1, 1]
      const scaledInput = Math.max(-1.0, Math.min(1.0, curvedInput * this.settings.sensitivity));
      this.telemetry.sensitivity = this.settings.sensitivity;

      // Speed-Sensitive Steering Multiplier:
      // Agility at low speeds (<35 km/h) and smooth progressive stability up to 300+ km/h
      const speedAboveBase = Math.max(0, (speedKmH - 30.0) / 120.0);
      const speedMultiplier = Math.max(0.28, 1.0 / (1.0 + speedAboveBase * 1.35));
      this.telemetry.speedMultiplier = speedMultiplier;

      targetAngle = scaledInput * speedMultiplier * this.maxSteeringAngle;

      // Counter-Steer Assist: subtle stabilizing correction during slide
      let assistCorrection = 0;
      if (this.settings.steeringAssist !== 'OFF' && Math.abs(lateralSpeed) > 1.2 && speedKmH > 15.0) {
        let assistGain = 0;
        if (this.settings.steeringAssist === 'LOW') assistGain = 0.018;
        else if (this.settings.steeringAssist === 'MEDIUM') assistGain = 0.038;
        else if (this.settings.steeringAssist === 'HIGH') assistGain = 0.065;

        assistCorrection = -lateralSpeed * assistGain;
        // Fade out assist if player is deliberately counter-steering hard
        if (Math.sign(assistCorrection) === Math.sign(scaledInput)) {
          assistCorrection *= 0.5;
        }
        targetAngle += assistCorrection;
      }
      this.telemetry.assistCorrection = assistCorrection;

      // Turn-in smoothing rate
      const blend = 1.0 - Math.exp(-this.settings.smoothing * dt);
      this.currentSteerAngle += (targetAngle - this.currentSteerAngle) * blend;
    } else {
      // 3. Natural Return-to-Center when input is released:
      // Immediately reset input target to zero and decay steering angle at returnSpeed
      this.filteredInput = 0;
      this.telemetry.sensitivity = this.settings.sensitivity;
      this.telemetry.speedMultiplier = 1.0;
      this.telemetry.assistCorrection = 0;

      // Frame-rate independent exponential convergence toward zero
      const returnBlend = 1.0 - Math.exp(-this.settings.returnSpeed * dt);
      this.currentSteerAngle += (0 - this.currentSteerAngle) * returnBlend;

      // Clean threshold snap to zero when within 0.005 rad (< 0.29 deg)
      if (Math.abs(this.currentSteerAngle) < 0.005) {
        this.currentSteerAngle = 0;
      }
    }

    // Clamp to max physical steering rack limit
    this.currentSteerAngle = Math.max(-this.maxSteeringAngle, Math.min(this.maxSteeringAngle, this.currentSteerAngle));
    this.telemetry.finalSteeringAngle = this.currentSteerAngle;
    return this.currentSteerAngle;
  }

  public applyPreset(preset: SteeringPreset): void {
    this.settings.preset = preset;
    if (preset === 'Simulation') {
      this.settings.sensitivity = 0.85;
      this.settings.returnSpeed = 6.5;
      this.settings.smoothing = 5.5;
      this.settings.steeringAssist = 'OFF';
      this.settings.deadzone = 0.06;
    } else if (preset === 'Balanced') {
      this.settings.sensitivity = 1.0;
      this.settings.returnSpeed = 7.5;
      this.settings.smoothing = 6.5;
      this.settings.steeringAssist = 'LOW';
      this.settings.deadzone = 0.05;
    } else if (preset === 'Arcade') {
      this.settings.sensitivity = 1.25;
      this.settings.returnSpeed = 9.0;
      this.settings.smoothing = 8.5;
      this.settings.steeringAssist = 'MEDIUM';
      this.settings.deadzone = 0.03;
    }
    this.saveSettings();
  }

  public loadSettings(): SteeringSettings {
    try {
      const saved = localStorage.getItem('racingGame.settings');
      if (saved) {
        return { ...DEFAULT_STEERING_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback if localStorage blocked
    }
    return { ...DEFAULT_STEERING_SETTINGS };
  }

  public saveSettings(): void {
    try {
      localStorage.setItem('racingGame.settings', JSON.stringify(this.settings));
    } catch {
      // Fallback
    }
  }

  public resetToDefaults(): void {
    this.settings = { ...DEFAULT_STEERING_SETTINGS };
    this.saveSettings();
  }
}

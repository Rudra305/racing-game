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
  returnSpeed: 6.2,
  smoothing: 5.8,
  steeringAssist: 'LOW',
  deadzone: 0.06,
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

    // 1. Deadzone
    let val = rawInput;
    if (Math.abs(val) < this.settings.deadzone) {
      val = 0;
    } else {
      val = Math.sign(val) * ((Math.abs(val) - this.settings.deadzone) / (1.0 - this.settings.deadzone));
    }
    this.telemetry.afterDeadzone = val;

    // 2. Input slew rate filtering: prevents small keyboard taps from causing violent yaw
    // Build up input progressively at ~7.0/s; decay faster at ~12.0/s when key released
    const inputRate = Math.abs(val) > 0.01 ? 7.2 : 12.0;
    const inputBlend = 1.0 - Math.exp(-inputRate * dt);
    this.filteredInput += (val - this.filteredInput) * inputBlend;
    if (Math.abs(this.filteredInput) < 0.001 && Math.abs(val) < 0.01) {
      this.filteredInput = 0;
    }

    // 3. Progressive Response Curve (Cubic blend for fine center precision)
    const fVal = this.filteredInput;
    const curvedInput = 0.70 * (fVal * fVal * fVal) + 0.30 * fVal;

    // 4. Player Sensitivity
    const scaledInput = curvedInput * this.settings.sensitivity;
    this.telemetry.sensitivity = this.settings.sensitivity;

    // 5. Speed-Sensitive Steering Multiplier
    // Maintains full agility at low speeds (<30 km/h) and solid straight-line stability at 150+ km/h
    const speedAboveBase = Math.max(0, (speedKmH - 25.0) / 145.0);
    const speedMultiplier = 1.0 / (1.0 + Math.min(1.5, speedAboveBase * 1.5));
    this.telemetry.speedMultiplier = speedMultiplier;

    let targetAngle = scaledInput * speedMultiplier * this.maxSteeringAngle;

    // 6. Counter-Steer Assist
    // Automatically applies subtle stabilizing counter-steer when sliding sideways at speed
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

    // Clamp to max steering authority
    targetAngle = Math.max(-this.maxSteeringAngle, Math.min(this.maxSteeringAngle, targetAngle));

    // 7. Time-based Asymptotic Smoothing & Natural Return-to-Center
    // When input is released, returnSpeed governs centering decay.
    // When input is active, smoothing governs turn-in rate.
    const isCentering = Math.abs(rawInput) < 0.01;
    const rate = isCentering ? this.settings.returnSpeed : this.settings.smoothing;

    // Frame-rate independent exponential convergence: 1.0 - exp(-rate * dt)
    const blend = 1.0 - Math.exp(-rate * dt);
    const diff = targetAngle - this.currentSteerAngle;
    this.currentSteerAngle += diff * blend;

    // Clean threshold snap to exactly 0 to avoid microscopic floating point drift
    if (isCentering && Math.abs(this.currentSteerAngle) < 0.0008 && Math.abs(targetAngle) < 0.001) {
      this.currentSteerAngle = 0;
    }

    this.telemetry.finalSteeringAngle = this.currentSteerAngle;
    return this.currentSteerAngle;
  }

  public applyPreset(preset: SteeringPreset): void {
    this.settings.preset = preset;
    if (preset === 'Simulation') {
      this.settings.sensitivity = 0.85;
      this.settings.returnSpeed = 5.2;
      this.settings.smoothing = 4.8;
      this.settings.steeringAssist = 'OFF';
      this.settings.deadzone = 0.08;
    } else if (preset === 'Balanced') {
      this.settings.sensitivity = 1.0;
      this.settings.returnSpeed = 6.2;
      this.settings.smoothing = 5.8;
      this.settings.steeringAssist = 'LOW';
      this.settings.deadzone = 0.06;
    } else if (preset === 'Arcade') {
      this.settings.sensitivity = 1.20;
      this.settings.returnSpeed = 7.5;
      this.settings.smoothing = 7.2;
      this.settings.steeringAssist = 'MEDIUM';
      this.settings.deadzone = 0.04;
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

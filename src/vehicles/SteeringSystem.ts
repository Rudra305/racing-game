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
  returnSpeed: 5.5,
  smoothing: 8.5,
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

  constructor(maxAngle: number = 0.52) {
    this.maxSteeringAngle = maxAngle;
    this.settings = this.loadSettings();
  }

  public reset(): void {
    this.currentSteerAngle = 0;
  }

  public setMaxAngle(angle: number): void {
    this.maxSteeringAngle = angle;
  }

  /**
   * Evaluates the full steering pipeline:
   * Raw Input -> Deadzone -> Non-linear Curve -> Sensitivity -> Speed Tapering -> Assist -> Smoothing
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

    // 2. Progressive Response Curve (Cubic blend for fine center precision)
    const curvedInput = 0.65 * (val * val * val) + 0.35 * val;

    // 3. Player Sensitivity
    const scaledInput = curvedInput * this.settings.sensitivity;
    this.telemetry.sensitivity = this.settings.sensitivity;

    // 4. Speed-Sensitive Steering Multiplier
    // High-speed tapering prevents twitchy control at 150+ km/h
    const speedNorm = Math.min(1.0, speedKmH / 160.0);
    const speedMultiplier = 1.0 / (1.0 + speedNorm * 1.1);
    this.telemetry.speedMultiplier = speedMultiplier;

    let targetAngle = scaledInput * speedMultiplier * this.maxSteeringAngle;

    // 5. Counter-Steer Assist
    // Automatically applies a subtle stabilizing counter-steer when sliding sideways
    let assistCorrection = 0;
    if (this.settings.steeringAssist !== 'OFF' && Math.abs(lateralSpeed) > 1.0) {
      let assistGain = 0;
      if (this.settings.steeringAssist === 'LOW') assistGain = 0.015;
      else if (this.settings.steeringAssist === 'MEDIUM') assistGain = 0.035;
      else if (this.settings.steeringAssist === 'HIGH') assistGain = 0.06;

      assistCorrection = -lateralSpeed * assistGain;
      targetAngle += assistCorrection;
    }
    this.telemetry.assistCorrection = assistCorrection;

    // Clamp to max steering authority
    targetAngle = Math.max(-this.maxSteeringAngle, Math.min(this.maxSteeringAngle, targetAngle));

    // 6. Smoothing & Damping
    // Use returnSpeed when player releases steering; use smoothing when turning in
    const isCentering = Math.abs(rawInput) < 0.01;
    const rate = isCentering ? this.settings.returnSpeed : this.settings.smoothing;

    const diff = targetAngle - this.currentSteerAngle;
    this.currentSteerAngle += diff * Math.min(1.0, rate * dt);
    this.telemetry.finalSteeringAngle = this.currentSteerAngle;

    return this.currentSteerAngle;
  }

  public applyPreset(preset: SteeringPreset): void {
    this.settings.preset = preset;
    if (preset === 'Simulation') {
      this.settings.sensitivity = 0.85;
      this.settings.returnSpeed = 4.8;
      this.settings.smoothing = 6.5;
      this.settings.steeringAssist = 'OFF';
      this.settings.deadzone = 0.08;
    } else if (preset === 'Balanced') {
      this.settings.sensitivity = 1.0;
      this.settings.returnSpeed = 5.5;
      this.settings.smoothing = 8.5;
      this.settings.steeringAssist = 'LOW';
      this.settings.deadzone = 0.06;
    } else if (preset === 'Arcade') {
      this.settings.sensitivity = 1.25;
      this.settings.returnSpeed = 7.0;
      this.settings.smoothing = 10.5;
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

import { VehicleCategory } from '../vehicles/VehicleCategory';

export interface EngineAudioProfile {
  cylinders: number;
  baseFrequencyMultiplier: number;
  idlePitchHz: number;
  harmonicGains: [number, number, number, number];
  distortionAmount: number;
}

const ENGINE_PROFILES: Record<string, EngineAudioProfile> = {
  [VehicleCategory.SPORTS]: {
    cylinders: 6,
    baseFrequencyMultiplier: 1.0,
    idlePitchHz: 35.0,
    harmonicGains: [0.55, 0.35, 0.20, 0.10],
    distortionAmount: 18.0
  },
  [VehicleCategory.SUPERCAR]: {
    cylinders: 12,
    baseFrequencyMultiplier: 1.25,
    idlePitchHz: 45.0,
    harmonicGains: [0.45, 0.40, 0.35, 0.25],
    distortionAmount: 26.0
  },
  [VehicleCategory.RALLY]: {
    cylinders: 4,
    baseFrequencyMultiplier: 0.95,
    idlePitchHz: 32.0,
    harmonicGains: [0.60, 0.25, 0.30, 0.15],
    distortionAmount: 32.0
  },
  [VehicleCategory.SUV]: {
    cylinders: 8,
    baseFrequencyMultiplier: 0.85,
    idlePitchHz: 26.0,
    harmonicGains: [0.70, 0.30, 0.15, 0.05],
    distortionAmount: 14.0
  },
  [VehicleCategory.FORMULA]: {
    cylinders: 6,
    baseFrequencyMultiplier: 1.85,
    idlePitchHz: 65.0,
    harmonicGains: [0.35, 0.45, 0.40, 0.35],
    distortionAmount: 40.0
  }
};

export class EngineAudio {
  private ctx: AudioContext;
  private outputNode: GainNode;
  private isStarted: boolean = false;

  // Synthesis Nodes (reused perpetually without per-frame allocations)
  private oscFundamental!: OscillatorNode;
  private oscHarmonic2!: OscillatorNode;
  private oscHarmonic3!: OscillatorNode;
  private oscSubBass!: OscillatorNode;

  private gainFundamental!: GainNode;
  private gainHarmonic2!: GainNode;
  private gainHarmonic3!: GainNode;
  private gainSubBass!: GainNode;

  private waveshaperNode!: WaveShaperNode;
  private lowpassFilter!: BiquadFilterNode;
  private masterEngineGain!: GainNode;

  private currentProfile: EngineAudioProfile = ENGINE_PROFILES[VehicleCategory.SPORTS];

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.outputNode = ctx.createGain();
    this.outputNode.gain.value = 0.55;
    this.outputNode.connect(destination);

    this.setupNodes();
  }

  private createDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const k = amount;
    const nSamples = 256;
    const buffer = new ArrayBuffer(nSamples * 4);
    const curve: Float32Array<ArrayBuffer> = new Float32Array(buffer);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  private setupNodes(): void {
    // 1. Oscillators
    this.oscFundamental = this.ctx.createOscillator();
    this.oscFundamental.type = 'sawtooth';

    this.oscHarmonic2 = this.ctx.createOscillator();
    this.oscHarmonic2.type = 'triangle';

    this.oscHarmonic3 = this.ctx.createOscillator();
    this.oscHarmonic3.type = 'sawtooth';

    this.oscSubBass = this.ctx.createOscillator();
    this.oscSubBass.type = 'sine';

    // 2. Harmonic Gains
    this.gainFundamental = this.ctx.createGain();
    this.gainHarmonic2 = this.ctx.createGain();
    this.gainHarmonic3 = this.ctx.createGain();
    this.gainSubBass = this.ctx.createGain();

    this.oscFundamental.connect(this.gainFundamental);
    this.oscHarmonic2.connect(this.gainHarmonic2);
    this.oscHarmonic3.connect(this.gainHarmonic3);
    this.oscSubBass.connect(this.gainSubBass);

    // Summing node
    const engineMix = this.ctx.createGain();
    this.gainFundamental.connect(engineMix);
    this.gainHarmonic2.connect(engineMix);
    this.gainHarmonic3.connect(engineMix);
    this.gainSubBass.connect(engineMix);

    // 3. Throttle WaveShaper / Distortion
    this.waveshaperNode = this.ctx.createWaveShaper();
    this.waveshaperNode.curve = this.createDistortionCurve(this.currentProfile.distortionAmount);
    this.waveshaperNode.oversample = '2x';
    engineMix.connect(this.waveshaperNode);

    // 4. Dynamic Lowpass Filter (opens up with throttle)
    this.lowpassFilter = this.ctx.createBiquadFilter();
    this.lowpassFilter.type = 'lowpass';
    this.lowpassFilter.frequency.value = 650;
    this.lowpassFilter.Q.value = 2.5;
    this.waveshaperNode.connect(this.lowpassFilter);

    // 5. Master Engine Gain
    this.masterEngineGain = this.ctx.createGain();
    this.masterEngineGain.gain.value = 0.0;
    this.lowpassFilter.connect(this.masterEngineGain);
    this.masterEngineGain.connect(this.outputNode);
  }

  public setCategory(category: string): void {
    const profile = ENGINE_PROFILES[category] || ENGINE_PROFILES[VehicleCategory.SPORTS];
    this.currentProfile = profile;
    this.waveshaperNode.curve = this.createDistortionCurve(profile.distortionAmount);
  }

  public start(): void {
    if (this.isStarted) return;
    this.oscFundamental.start();
    this.oscHarmonic2.start();
    this.oscHarmonic3.start();
    this.oscSubBass.start();
    this.isStarted = true;
  }

  public update(
    rpm: number,
    throttle: number,
    speedKmH: number,
    _gear: string,
    isShifting: boolean,
    isRaceActive: boolean = true
  ): void {
    if (!this.isStarted) return;

    const t = this.ctx.currentTime;

    // 0. Completely silence engine audio when race is stopped, finished, or in menus
    if (!isRaceActive) {
      this.masterEngineGain.gain.setTargetAtTime(0.0, t, 0.08);
      return;
    }

    const profile = this.currentProfile;

    // 1. Calculate Cylinder Firing Frequency (Hz)
    // F = (RPM / 60) * (Cylinders / 2) * baseMultiplier
    const rawPitch = (rpm / 60.0) * (profile.cylinders / 2.0) * profile.baseFrequencyMultiplier;
    const baseFreq = Math.max(profile.idlePitchHz, rawPitch);

    // Target frequencies with exponential ramping for pitch smoothness
    this.oscFundamental.frequency.setTargetAtTime(baseFreq, t, 0.04);
    this.oscHarmonic2.frequency.setTargetAtTime(baseFreq * 2.0, t, 0.04);
    this.oscHarmonic3.frequency.setTargetAtTime(baseFreq * 3.0, t, 0.04);
    this.oscSubBass.frequency.setTargetAtTime(baseFreq * 0.5, t, 0.04);

    // 2. Dynamic Filter Opening with Throttle & RPM
    // When stationary at idle (throttle < 0.02, speed < 2 km/h), filter closes to 240 Hz for a soft, quiet purr
    const isStationary = throttle < 0.02 && speedKmH < 2.0;
    const baseCutoff = isStationary ? 240 : 350 + (rpm / 8000.0) * 800;
    const throttleCutoff = throttle * 3200;
    const targetCutoff = Math.min(12000, baseCutoff + throttleCutoff);
    this.lowpassFilter.frequency.setTargetAtTime(targetCutoff, t, 0.05);

    // 3. Harmonic Balances - Zero out sub-bass drone and harmonic buzzing when off-throttle
    const harm = profile.harmonicGains;
    const throttleBoost = 0.4 + throttle * 1.4;
    this.gainFundamental.gain.setTargetAtTime(harm[0] * throttleBoost, t, 0.05);
    this.gainHarmonic2.gain.setTargetAtTime(harm[1] * throttleBoost, t, 0.05);
    this.gainHarmonic3.gain.setTargetAtTime(harm[2] * (throttle * 1.5), t, 0.05); // No buzz at idle
    this.gainSubBass.gain.setTargetAtTime(harm[3] * (throttle * 1.2), t, 0.05);   // No sub-bass hum at idle

    // 4. Overall Engine Volume (Throttle + RPM scaling)
    let targetVol = 0;
    if (isStationary) {
      targetVol = 0.05; // Soft gentle idle - zero loud electrical hum
    } else {
      targetVol = 0.16 + (rpm / 8000.0) * 0.38 + throttle * 0.35;
      if (isShifting) {
        targetVol *= 0.45;
      }
    }
    this.masterEngineGain.gain.setTargetAtTime(Math.min(1.0, targetVol), t, 0.04);
  }

  public stop(): void {
    if (!this.isStarted) return;
    this.masterEngineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
  }
}

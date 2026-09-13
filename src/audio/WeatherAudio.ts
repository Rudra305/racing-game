import { WeatherType } from '../environment/WeatherTypes';

export class WeatherAudio {
  private ctx: AudioContext;
  private outputNode: GainNode;

  // Rain Sound Synthesis (Pink noise buffer + bandpass filter + random drop pops)
  private rainNoiseSource!: AudioBufferSourceNode;
  private rainFilter!: BiquadFilterNode;
  private rainGain!: GainNode;

  // Wet Surface & Tire Spray Sizzle Synthesis (High-frequency noise)
  private sprayNoiseSource!: AudioBufferSourceNode;
  private sprayFilter!: BiquadFilterNode;
  private sprayGain!: GainNode;

  private isStarted: boolean = false;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.outputNode = ctx.createGain();
    this.outputNode.gain.value = 0.55;
    this.outputNode.connect(destination);

    this.setupNodes();
  }

  private createPinkNoiseBuffer(): AudioBuffer {
    // 3-second looping pink noise buffer with 1/f spectral slope
    const bufferSize = this.ctx.sampleRate * 3.0;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private createWhiteNoiseBuffer(): AudioBuffer {
    const bufferSize = this.ctx.sampleRate * 2.0;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    return buffer;
  }

  private setupNodes(): void {
    // 1. Rain Synthesizer
    const rainBuffer = this.createPinkNoiseBuffer();
    this.rainNoiseSource = this.ctx.createBufferSource();
    this.rainNoiseSource.buffer = rainBuffer;
    this.rainNoiseSource.loop = true;

    this.rainFilter = this.ctx.createBiquadFilter();
    this.rainFilter.type = 'lowpass';
    this.rainFilter.frequency.value = 1800;
    this.rainFilter.Q.value = 1.2;

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = 0.0;

    this.rainNoiseSource.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.outputNode);

    // 2. Wet Tire Spray Sizzle Synthesizer
    const sprayBuffer = this.createWhiteNoiseBuffer();
    this.sprayNoiseSource = this.ctx.createBufferSource();
    this.sprayNoiseSource.buffer = sprayBuffer;
    this.sprayNoiseSource.loop = true;

    this.sprayFilter = this.ctx.createBiquadFilter();
    this.sprayFilter.type = 'bandpass';
    this.sprayFilter.frequency.value = 3400;
    this.sprayFilter.Q.value = 2.2;

    this.sprayGain = this.ctx.createGain();
    this.sprayGain.gain.value = 0.0;

    this.sprayNoiseSource.connect(this.sprayFilter);
    this.sprayFilter.connect(this.sprayGain);
    this.sprayGain.connect(this.outputNode);
  }

  public start(): void {
    if (this.isStarted) return;
    this.rainNoiseSource.start();
    this.sprayNoiseSource.start();
    this.isStarted = true;
  }

  /**
   * Updates weather ambience and wet road tire spray audio.
   */
  public update(
    weatherType: WeatherType,
    rainAudioGain: number,
    roadWetness: number,
    speedKmH: number,
    isRaceActive: boolean = true
  ): void {
    if (!this.isStarted) return;
    const t = this.ctx.currentTime;

    if (!isRaceActive) {
      this.rainGain.gain.setTargetAtTime(0.0, t, 0.08);
      this.sprayGain.gain.setTargetAtTime(0.0, t, 0.08);
      return;
    }

    // 1. Rain Ambience Gain & Filter
    let targetRainGain = rainAudioGain * 0.48;
    let targetRainCutoff = 1600;

    if (weatherType === WeatherType.HEAVY_RAIN) {
      targetRainCutoff = 3200; // Brighter roaring deluge
      targetRainGain = Math.max(targetRainGain, 0.38);
    } else if (weatherType === WeatherType.LIGHT_RAIN) {
      targetRainCutoff = 1800; // Soft patter
      targetRainGain = Math.max(targetRainGain, 0.18);
    }

    this.rainGain.gain.setTargetAtTime(targetRainGain, t, 0.08);
    this.rainFilter.frequency.setTargetAtTime(targetRainCutoff, t, 0.08);

    // 2. Wet Tire Spray Sizzle: scales with vehicle speed * road wetness
    let targetSprayGain = 0;
    if (roadWetness > 0.08 && speedKmH > 15.0) {
      const speedRatio = Math.min(1.0, (speedKmH - 15.0) / 160.0);
      targetSprayGain = speedRatio * roadWetness * 0.28;
    }

    this.sprayGain.gain.setTargetAtTime(targetSprayGain, t, 0.05);
    const sprayFreq = 2800 + Math.min(1.0, speedKmH / 200.0) * 1600;
    this.sprayFilter.frequency.setTargetAtTime(sprayFreq, t, 0.05);
  }

  /**
   * Triggers a distant, deep thunder rumble on storm transitions.
   */
  public triggerThunder(): void {
    if (!this.isStarted || this.ctx.state !== 'running') return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.value = 85;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 1.8);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.outputNode);

      osc.start(t);
      osc.stop(t + 2.3);
    } catch {}
  }

  public stop(): void {
    if (!this.isStarted) return;
    const t = this.ctx.currentTime;
    this.rainGain.gain.setTargetAtTime(0.0, t, 0.05);
    this.sprayGain.gain.setTargetAtTime(0.0, t, 0.05);
  }
}

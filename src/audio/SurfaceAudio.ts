import { SurfaceType } from '../physics/SurfaceSystem';

export class SurfaceAudio {
  private ctx: AudioContext;
  private outputNode: GainNode;

  // Road rumble nodes
  private noiseSource!: AudioBufferSourceNode;
  private roadFilter!: BiquadFilterNode;
  private roadGain!: GainNode;

  // Kerb rhythmic vibration pulse oscillator
  private kerbOsc!: OscillatorNode;
  private kerbGain!: GainNode;

  private isStarted: boolean = false;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.outputNode = ctx.createGain();
    this.outputNode.gain.value = 0.45;
    this.outputNode.connect(destination);

    this.setupNodes();
  }

  private createNoiseBuffer(): AudioBuffer {
    const bufferSize = this.ctx.sampleRate * 2.0;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    return buffer;
  }

  private setupNodes(): void {
    // 1. Road Texture Noise
    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = this.createNoiseBuffer();
    this.noiseSource.loop = true;

    this.roadFilter = this.ctx.createBiquadFilter();
    this.roadFilter.type = 'lowpass';
    this.roadFilter.frequency.value = 220;

    this.roadGain = this.ctx.createGain();
    this.roadGain.gain.value = 0.0;

    this.noiseSource.connect(this.roadFilter);
    this.roadFilter.connect(this.roadGain);
    this.roadGain.connect(this.outputNode);

    // 2. Kerb Rumble Oscillator
    this.kerbOsc = this.ctx.createOscillator();
    this.kerbOsc.type = 'square';
    this.kerbOsc.frequency.value = 45;

    this.kerbGain = this.ctx.createGain();
    this.kerbGain.gain.value = 0.0;

    const kerbFilter = this.ctx.createBiquadFilter();
    kerbFilter.type = 'lowpass';
    kerbFilter.frequency.value = 180;

    this.kerbOsc.connect(kerbFilter);
    kerbFilter.connect(this.kerbGain);
    this.kerbGain.connect(this.outputNode);
  }

  public start(): void {
    if (this.isStarted) return;
    this.noiseSource.start();
    this.kerbOsc.start();
    this.isStarted = true;
  }

  public update(
    speedKmH: number,
    surface: SurfaceType,
    curbVibration: number
  ): void {
    if (!this.isStarted) return;
    const t = this.ctx.currentTime;
    const speedNorm = Math.min(1.0, speedKmH / 180.0);

    // 1. Road texture rolling sound
    let targetFilterFreq = 180 + speedNorm * 350;
    let targetRoadVol = speedNorm * 0.25;

    if (surface === SurfaceType.GRASS || surface === SurfaceType.GRAVEL) {
      targetFilterFreq = 480;
      targetRoadVol = Math.min(0.65, 0.15 + speedNorm * 0.45);
    }

    this.roadFilter.frequency.setTargetAtTime(targetFilterFreq, t, 0.05);
    this.roadGain.gain.setTargetAtTime(targetRoadVol, t, 0.05);

    // 2. Kerb vibration audio (rhythmic rumble when driving on kerbs)
    let targetKerbVol = 0;
    if (curbVibration > 0.05 && speedKmH > 15.0) {
      // Frequency scales with vehicle ground speed over teeth
      const toothFreq = Math.min(95, 30 + speedKmH * 0.4);
      this.kerbOsc.frequency.setTargetAtTime(toothFreq, t, 0.03);
      targetKerbVol = Math.min(0.40, curbVibration * 0.55);
    }
    this.kerbGain.gain.setTargetAtTime(targetKerbVol, t, 0.03);
  }

  public stop(): void {
    if (!this.isStarted) return;
    this.roadGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    this.kerbGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
  }
}

import { SurfaceType } from '../physics/SurfaceSystem';

export class TireAudio {
  private ctx: AudioContext;
  private outputNode: GainNode;
  private noiseSource!: AudioBufferSourceNode;
  private bandpassFilter!: BiquadFilterNode;
  private tireGain!: GainNode;
  private isPlaying: boolean = false;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.outputNode = ctx.createGain();
    this.outputNode.gain.value = 0.65;
    this.outputNode.connect(destination);

    this.setupNodes();
  }

  private createNoiseBuffer(): AudioBuffer {
    const bufferSize = this.ctx.sampleRate * 2.0; // 2-second looping white noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    return buffer;
  }

  private setupNodes(): void {
    const noiseBuffer = this.createNoiseBuffer();

    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;

    this.bandpassFilter = this.ctx.createBiquadFilter();
    this.bandpassFilter.type = 'bandpass';
    this.bandpassFilter.frequency.value = 1600;
    this.bandpassFilter.Q.value = 3.2;

    this.tireGain = this.ctx.createGain();
    this.tireGain.gain.value = 0.0;

    this.noiseSource.connect(this.bandpassFilter);
    this.bandpassFilter.connect(this.tireGain);
    this.tireGain.connect(this.outputNode);
  }

  public start(): void {
    if (this.isPlaying) return;
    this.noiseSource.start();
    this.isPlaying = true;
  }

  /**
   * Updates tire scrub and skid audio.
   * @param slipAngle Lateral slip angle in degrees
   * @param speedKmH Vehicle forward speed in km/h
   * @param brakeInput Active braking input [0..1]
   * @param handbrake Active handbrake
   * @param surface Current surface type
   */
  public update(
    slipAngle: number,
    speedKmH: number,
    brakeInput: number,
    handbrake: boolean,
    surface: SurfaceType
  ): void {
    if (!this.isPlaying) return;
    const t = this.ctx.currentTime;

    // 1. Slip Intensity Calculation
    // Below 4 degrees: negligible tire noise
    // 4 -> 12 degrees: progressive tire scrubbing
    // > 12 degrees or handbrake: intense skid screech
    let slipIntensity = 0;
    if (speedKmH > 10.0) {
      if (slipAngle > 3.5) {
        slipIntensity = Math.min(1.0, (slipAngle - 3.5) / 14.0);
      }
      if (handbrake && speedKmH > 15.0) {
        slipIntensity = Math.max(slipIntensity, 0.85);
      }
      if (brakeInput > 0.6 && speedKmH > 40.0) {
        slipIntensity = Math.max(slipIntensity, (brakeInput - 0.6) * 1.5);
      }
    }

    // 2. Frequency & Resonance by Surface
    let targetFreq = 1600;
    let targetQ = 3.0;

    if (surface === SurfaceType.GRASS || surface === SurfaceType.GRAVEL) {
      targetFreq = 750; // Deeper, crunchier dirt noise
      targetQ = 1.8;
    } else if (surface === SurfaceType.KERB) {
      targetFreq = 2200; // Higher frequency metallic/rumble contact
      targetQ = 4.0;
    } else {
      // Asphalt screech
      targetFreq = 1400 + slipIntensity * 800;
      targetQ = 3.2;
    }

    this.bandpassFilter.frequency.setTargetAtTime(targetFreq, t, 0.04);
    this.bandpassFilter.Q.setTargetAtTime(targetQ, t, 0.04);

    // 3. Target Gain
    const targetGain = Math.min(0.9, slipIntensity * 0.75);
    this.tireGain.gain.setTargetAtTime(targetGain, t, 0.03);
  }

  public stop(): void {
    if (!this.isPlaying) return;
    this.tireGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
  }
}

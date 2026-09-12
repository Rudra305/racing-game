export class EnvironmentAudio {
  private ctx: AudioContext;
  private outputNode: GainNode;
  private noiseSource!: AudioBufferSourceNode;
  private windFilter!: BiquadFilterNode;
  private windGain!: GainNode;
  private isStarted: boolean = false;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.outputNode = ctx.createGain();
    this.outputNode.gain.value = 0.35;
    this.outputNode.connect(destination);

    this.setupNodes();
  }

  private createNoiseBuffer(): AudioBuffer {
    const bufferSize = this.ctx.sampleRate * 2.0;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    return buffer;
  }

  private setupNodes(): void {
    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = this.createNoiseBuffer();
    this.noiseSource.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.value = 400;

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.0;

    this.noiseSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.outputNode);
  }

  public start(): void {
    if (this.isStarted) return;
    this.noiseSource.start();
    this.isStarted = true;
  }

  public update(speedKmH: number): void {
    if (!this.isStarted) return;
    const t = this.ctx.currentTime;

    // Wind rush becomes perceptible above 70 km/h and peaks at 250+ km/h
    const speedRatio = Math.max(0, (speedKmH - 70.0) / 180.0);
    const targetGain = Math.min(0.65, Math.pow(speedRatio, 1.4) * 0.45);
    const targetFreq = 350 + speedRatio * 900;

    this.windGain.gain.setTargetAtTime(targetGain, t, 0.06);
    this.windFilter.frequency.setTargetAtTime(targetFreq, t, 0.06);
  }

  public stop(): void {
    if (!this.isStarted) return;
    this.windGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
  }
}

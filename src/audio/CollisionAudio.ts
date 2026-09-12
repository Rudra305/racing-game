export class CollisionAudio {
  private ctx: AudioContext;
  private outputNode: GainNode;
  private lastImpactTime: number = 0;
  private cooldownSeconds: number = 0.22; // Debounce cooldown prevents audio spam

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.outputNode = ctx.createGain();
    this.outputNode.gain.value = 0.75;
    this.outputNode.connect(destination);
  }

  /**
   * Triggers a debounced procedural impact sound based on collision severity.
   * @param severity Normalized impact severity [0..1]
   */
  public triggerImpact(severity: number): void {
    const now = this.ctx.currentTime;
    if (now - this.lastImpactTime < this.cooldownSeconds) {
      return; // Debounced
    }
    this.lastImpactTime = now;

    const clampedSev = Math.max(0.1, Math.min(1.0, severity));

    // 1. Low-frequency thump (chassis impact)
    const thumpOsc = this.ctx.createOscillator();
    const thumpGain = this.ctx.createGain();

    thumpOsc.type = 'triangle';
    thumpOsc.frequency.setValueAtTime(120 + clampedSev * 40, now);
    thumpOsc.frequency.exponentialRampToValueAtTime(32, now + 0.14);

    thumpGain.gain.setValueAtTime(clampedSev * 0.8, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    thumpOsc.connect(thumpGain);
    thumpGain.connect(this.outputNode);

    thumpOsc.start(now);
    thumpOsc.stop(now + 0.18);

    // 2. Metallic/plastic barrier crunch noise burst
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 800 + clampedSev * 1200;
    noiseFilter.Q.value = 2.0;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(clampedSev * 0.65, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.outputNode);

    noiseSource.start(now);
    noiseSource.stop(now + 0.14);
  }
}

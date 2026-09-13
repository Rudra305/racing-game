/**
 * RaceAudio - Synthesizes crisp race audio cues including countdown beeps (3, 2, 1, GO!),
 * lap completion chimes, and race finish fanfare.
 */

export class RaceAudio {
  private ctx: AudioContext;
  private outputNode: GainNode;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;

    this.outputNode = ctx.createGain();
    this.outputNode.gain.value = 0.85;
    this.outputNode.connect(destination);
  }

  /**
   * Countdown beep for 3, 2, 1 (low pitch) and GO! (high pitch).
   */
  public triggerCountdownBeep(isGo: boolean = false): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isGo) {
      // High-pitched celebratory 'GO!' tone (1760 Hz)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1760, now);
      osc.frequency.setValueAtTime(1760, now + 0.15);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.outputNode);

      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      // Crisp 880 Hz preparation tone (3, 2, 1)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.outputNode);

      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  /**
   * Rising two-tone chime when crossing the start/finish line for a completed lap.
   */
  public triggerLapChime(): void {
    const now = this.ctx.currentTime;

    // Tone 1: E5 (659 Hz)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.45, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(this.outputNode);
    osc1.start(now);
    osc1.stop(now + 0.23);

    // Tone 2: A5 (880 Hz) slightly delayed
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.55, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc2.connect(gain2);
    gain2.connect(this.outputNode);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.43);
  }

  /**
   * Celebratory arpeggio when completing the race.
   */
  public triggerRaceFinish(): void {
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.5, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.outputNode);

      osc.start(noteTime);
      osc.stop(noteTime + 0.36);
    });
  }

  public dispose(): void {
    this.outputNode.disconnect();
  }
}

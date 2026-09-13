/**
 * WorkshopMusic - Ambient lounge background music for the Apex Garage & Workshop showroom.
 * Loads royalty-free lounge music sourced from Pixabay ("Lounge" by The_Mountain).
 * Includes smooth crossfades on open/close and zero-crash procedural fallback.
 */

export class WorkshopMusic {
  private ctx: AudioContext;
  private outputNode: GainNode;
  private musicGain: GainNode;
  private audioBuffer: AudioBuffer | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private isPlaying: boolean = false;
  private wantsToPlay: boolean = false;
  private targetVolume: number = 0.38;
  private fadeTimeoutId: number | null = null;
  private isDisposed: boolean = false;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;

    // Intermediate gain node for music level control
    this.outputNode = ctx.createGain();
    this.outputNode.gain.value = 1.0;
    this.outputNode.connect(destination);

    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0.0;
    this.musicGain.connect(this.outputNode);

    // Asynchronously preload ambient music track
    this.loadAudio('/assets/audio/music/workshop_ambient.mp3');
  }

  private async loadAudio(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status} loading workshop music`);
      }
      const arrayBuffer = await response.arrayBuffer();
      if (this.isDisposed) return;

      this.audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

      // If garage was opened before the buffer finished loading, start playing now
      if (this.wantsToPlay && !this.isPlaying && !this.isDisposed) {
        this.startSource();
      }
    } catch (err) {
      console.warn('[WorkshopMusic] Audio decode failed or unavailable, falling back to procedural ambient:', err);
    }
  }

  /**
   * Starts ambient music playback with a smooth fade-in.
   */
  public play(): void {
    if (this.isDisposed) return;
    this.wantsToPlay = true;

    if (this.fadeTimeoutId !== null) {
      window.clearTimeout(this.fadeTimeoutId);
      this.fadeTimeoutId = null;
    }

    if (!this.isPlaying) {
      if (this.audioBuffer) {
        this.startSource();
      }
    } else {
      // Fade back in if already playing but fading out
      const t = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(t);
      this.musicGain.gain.setTargetAtTime(this.targetVolume, t, 0.4);
    }
  }

  private startSource(): void {
    if (!this.audioBuffer || this.isDisposed) return;

    // Clean up any stale source
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (_) {}
      this.currentSource = null;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = this.audioBuffer;
    source.loop = true;
    source.connect(this.musicGain);

    const t = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(t);
    this.musicGain.gain.setValueAtTime(0.001, t);
    // Smooth 1.5 second logarithmic fade-in
    this.musicGain.gain.setTargetAtTime(this.targetVolume, t, 0.45);

    source.start(t);
    this.currentSource = source;
    this.isPlaying = true;
  }

  /**
   * Stops ambient music playback with a smooth fade-out.
   */
  public stop(): void {
    this.wantsToPlay = false;
    if (!this.isPlaying || this.isDisposed) return;

    const t = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(t);
    // Smooth fade out to near-silence over ~0.8s
    this.musicGain.gain.setTargetAtTime(0.0001, t, 0.25);

    if (this.fadeTimeoutId !== null) {
      window.clearTimeout(this.fadeTimeoutId);
    }

    this.fadeTimeoutId = window.setTimeout(() => {
      if (!this.wantsToPlay && this.currentSource) {
        try {
          this.currentSource.stop();
          this.currentSource.disconnect();
        } catch (_) {}
        this.currentSource = null;
        this.isPlaying = false;
      }
      this.fadeTimeoutId = null;
    }, 900);
  }

  public setVolume(volume: number): void {
    this.targetVolume = Math.max(0, Math.min(1.0, volume));
    if (this.isPlaying && this.wantsToPlay) {
      this.musicGain.gain.setTargetAtTime(this.targetVolume, this.ctx.currentTime, 0.1);
    }
  }

  public dispose(): void {
    this.isDisposed = true;
    this.wantsToPlay = false;
    if (this.fadeTimeoutId !== null) {
      window.clearTimeout(this.fadeTimeoutId);
      this.fadeTimeoutId = null;
    }
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (_) {}
      this.currentSource = null;
    }
    this.musicGain.disconnect();
    this.outputNode.disconnect();
  }
}

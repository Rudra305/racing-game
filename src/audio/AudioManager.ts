import { EngineAudio } from './EngineAudio';
import { TireAudio } from './TireAudio';
import { SurfaceAudio } from './SurfaceAudio';
import { CollisionAudio } from './CollisionAudio';
import { EnvironmentAudio } from './EnvironmentAudio';
import { WorkshopMusic } from './WorkshopMusic';
import { RaceAudio } from './RaceAudio';
import { VehicleTelemetry } from '../physics/VehiclePhysics';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain!: GainNode;
  private compressor!: DynamicsCompressorNode;

  // Subsystems
  public engineAudio!: EngineAudio;
  public tireAudio!: TireAudio;
  public surfaceAudio!: SurfaceAudio;
  public collisionAudio!: CollisionAudio;
  public environmentAudio!: EnvironmentAudio;
  public workshopMusic!: WorkshopMusic;
  public raceAudio!: RaceAudio;

  private isInitialized: boolean = false;
  private isMuted: boolean = false;
  private isGarageActive: boolean = false;
  private masterVolume: number = 0.85;

  constructor() {
    this.setupUserGestureUnlock();
  }

  private initAudioContext(): void {
    if (this.isInitialized) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();

      // Master dynamics compressor prevents any clipping distortion across all audio nodes
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -6;
      this.compressor.knee.value = 12;
      this.compressor.ratio.value = 8;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Initialize all audio subsystems
      this.engineAudio = new EngineAudio(this.ctx, this.compressor);
      this.tireAudio = new TireAudio(this.ctx, this.compressor);
      this.surfaceAudio = new SurfaceAudio(this.ctx, this.compressor);
      this.collisionAudio = new CollisionAudio(this.ctx, this.compressor);
      this.environmentAudio = new EnvironmentAudio(this.ctx, this.compressor);
      this.workshopMusic = new WorkshopMusic(this.ctx, this.compressor);
      this.raceAudio = new RaceAudio(this.ctx, this.compressor);

      this.isInitialized = true;
    } catch (err) {
      console.warn('[AudioManager] Web Audio not supported or failed to initialize:', err);
    }
  }

  private setupUserGestureUnlock(): void {
    const unlock = () => {
      if (!this.isInitialized) {
        this.initAudioContext();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      // Start continuous audio nodes once audio is unlocked
      if (this.isInitialized) {
        this.engineAudio.start();
        this.tireAudio.start();
        this.surfaceAudio.start();
        this.environmentAudio.start();

        if (this.isGarageActive) {
          this.workshopMusic.play();
        }
      }

      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  public playWorkshopMusic(): void {
    this.isGarageActive = true;
    if (this.isInitialized && this.workshopMusic) {
      this.workshopMusic.play();
    }
  }

  public stopWorkshopMusic(): void {
    this.isGarageActive = false;
    if (this.isInitialized && this.workshopMusic) {
      this.workshopMusic.stop();
    }
  }

  public setCategory(category: string): void {
    if (this.isInitialized && this.engineAudio) {
      this.engineAudio.setCategory(category);
    }
  }

  public triggerImpact(severity: number): void {
    if (this.isInitialized && this.collisionAudio) {
      this.collisionAudio.triggerImpact(severity);
    }
  }

  public triggerCountdownBeep(isGo: boolean = false): void {
    if (this.isInitialized && this.raceAudio) {
      this.raceAudio.triggerCountdownBeep(isGo);
    }
  }

  public triggerLapChime(): void {
    if (this.isInitialized && this.raceAudio) {
      this.raceAudio.triggerLapChime();
    }
  }

  public triggerRaceFinish(): void {
    if (this.isInitialized && this.raceAudio) {
      this.raceAudio.triggerRaceFinish();
    }
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1.0, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.masterVolume,
        this.ctx.currentTime,
        0.05
      );
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.masterVolume,
        this.ctx.currentTime,
        0.05
      );
    }
    return this.isMuted;
  }

  /**
   * Main per-frame audio update loop.
   */
  public update(
    telemetry: VehicleTelemetry,
    isShifting: boolean = false,
    _dt: number = 0.016,
    isRaceActive: boolean = true
  ): void {
    if (!this.isInitialized || !this.ctx || this.ctx.state !== 'running') return;

    if (!isRaceActive) {
      this.engineAudio.stop();
      this.tireAudio.stop();
      this.surfaceAudio.stop();
      this.environmentAudio.stop();
      return;
    }

    // 1. Engine
    this.engineAudio.update(
      telemetry.rpm,
      telemetry.throttle,
      telemetry.speedKmH,
      telemetry.gear,
      isShifting,
      isRaceActive
    );

    // 2. Tire scrub & skid
    this.tireAudio.update(
      telemetry.driftAngle,
      telemetry.speedKmH,
      telemetry.brake,
      false,
      telemetry.surface
    );

    // 4. Surface & Kerbs
    this.surfaceAudio.update(
      telemetry.speedKmH,
      telemetry.surface,
      telemetry.curbVibration
    );

    // 5. Aerodynamic Wind Rush
    this.environmentAudio.update(telemetry.speedKmH);
  }

  public dispose(): void {
    if (this.workshopMusic) this.workshopMusic.dispose();
    if (this.raceAudio) this.raceAudio.dispose();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.isInitialized = false;
  }
}

export type QualityLevel = 'AUTO' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface QualityProfile {
  level: QualityLevel;
  effectiveLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  shadowsEnabled: boolean;
  shadowMapResolution: number;
  shadowDistance: number;
  vegetationShadows: boolean;
  lodScale: number;
  rainParticles: number;
  tireSprayParticles: number;
  maxPixelRatio: number;
}

export const QUALITY_PROFILES: Record<'LOW' | 'MEDIUM' | 'HIGH', Omit<QualityProfile, 'level' | 'effectiveLevel'>> = {
  LOW: {
    shadowsEnabled: false,
    shadowMapResolution: 512,
    shadowDistance: 35,
    vegetationShadows: false,
    lodScale: 0.65,
    rainParticles: 1000,
    tireSprayParticles: 120,
    maxPixelRatio: 1.0
  },
  MEDIUM: {
    shadowsEnabled: true,
    shadowMapResolution: 1024,
    shadowDistance: 50,
    vegetationShadows: false,
    lodScale: 0.90,
    rainParticles: 2000,
    tireSprayParticles: 250,
    maxPixelRatio: 1.5
  },
  HIGH: {
    shadowsEnabled: true,
    shadowMapResolution: 2048,
    shadowDistance: 65,
    vegetationShadows: true,
    lodScale: 1.15,
    rainParticles: 3500,
    tireSprayParticles: 400,
    maxPixelRatio: 2.0
  }
};

export type QualityChangeCallback = (profile: QualityProfile) => void;

export class QualityManager {
  private currentLevel: QualityLevel = 'HIGH';
  private autoEffectiveLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'HIGH';

  private smoothedFps: number = 60.0;
  private lowFpsTimer: number = 0;
  private highFpsTimer: number = 0;

  // Hysteresis timing thresholds
  private readonly demoteDurationThreshold: number = 2.5; // seconds of sustained < 48 FPS
  private readonly promoteDurationThreshold: number = 6.0; // seconds of sustained > 58.5 FPS
  private readonly demoteFpsThreshold: number = 48.0;
  private readonly promoteFpsThreshold: number = 58.5;

  private listeners: QualityChangeCallback[] = [];

  constructor(initialLevel?: QualityLevel) {
    if (initialLevel) {
      this.currentLevel = initialLevel;
    } else {
      try {
        const saved = localStorage.getItem('racingGame.graphicsQuality') as QualityLevel;
        if (saved && ['AUTO', 'LOW', 'MEDIUM', 'HIGH'].includes(saved)) {
          this.currentLevel = saved;
        }
      } catch {}
    }
  }

  public get level(): QualityLevel {
    return this.currentLevel;
  }

  public get effectiveLevel(): 'LOW' | 'MEDIUM' | 'HIGH' {
    return this.currentLevel === 'AUTO' ? this.autoEffectiveLevel : this.currentLevel;
  }

  public get currentProfile(): QualityProfile {
    const eff = this.effectiveLevel;
    const base = QUALITY_PROFILES[eff];
    return {
      level: this.currentLevel,
      effectiveLevel: eff,
      ...base
    };
  }

  public setQualityLevel(level: QualityLevel): void {
    if (this.currentLevel === level) return;
    this.currentLevel = level;
    try {
      localStorage.setItem('racingGame.graphicsQuality', level);
    } catch {}

    this.lowFpsTimer = 0;
    this.highFpsTimer = 0;
    this.notifyListeners();
  }

  public onQualityChanged(cb: QualityChangeCallback): void {
    this.listeners.push(cb);
  }

  /**
   * Called on every render update frame to track performance and auto-adapt quality if enabled.
   */
  public update(dt: number): void {
    if (dt <= 0.0001 || dt > 0.5) return;

    const instantFps = 1.0 / dt;
    // Exponential moving average filter (smooths out single frame spikes)
    this.smoothedFps = this.smoothedFps * 0.95 + instantFps * 0.05;

    if (this.currentLevel !== 'AUTO') return;

    // Evaluate AUTO adaptation with strict hysteresis
    if (this.smoothedFps < this.demoteFpsThreshold) {
      this.highFpsTimer = 0;
      this.lowFpsTimer += dt;
      if (this.lowFpsTimer >= this.demoteDurationThreshold) {
        this.lowFpsTimer = 0;
        this.demoteAutoQuality();
      }
    } else if (this.smoothedFps > this.promoteFpsThreshold) {
      this.lowFpsTimer = 0;
      this.highFpsTimer += dt;
      if (this.highFpsTimer >= this.promoteDurationThreshold) {
        this.highFpsTimer = 0;
        this.promoteAutoQuality();
      }
    } else {
      // In deadband / hysteresis zone: bleed down timers
      this.lowFpsTimer = Math.max(0, this.lowFpsTimer - dt * 0.5);
      this.highFpsTimer = Math.max(0, this.highFpsTimer - dt * 0.5);
    }
  }

  private demoteAutoQuality(): void {
    if (this.autoEffectiveLevel === 'HIGH') {
      this.autoEffectiveLevel = 'MEDIUM';
      this.notifyListeners();
    } else if (this.autoEffectiveLevel === 'MEDIUM') {
      this.autoEffectiveLevel = 'LOW';
      this.notifyListeners();
    }
  }

  private promoteAutoQuality(): void {
    if (this.autoEffectiveLevel === 'LOW') {
      this.autoEffectiveLevel = 'MEDIUM';
      this.notifyListeners();
    } else if (this.autoEffectiveLevel === 'MEDIUM') {
      this.autoEffectiveLevel = 'HIGH';
      this.notifyListeners();
    }
  }

  private notifyListeners(): void {
    const profile = this.currentProfile;
    for (const listener of this.listeners) {
      listener(profile);
    }
  }
}

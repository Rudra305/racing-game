import * as THREE from 'three';
import { WeatherType, WeatherProfile, WEATHER_PROFILES } from './WeatherTypes';

export type WeatherUpdateCallback = (current: WeatherProfile, transitionAlpha: number) => void;

export class WeatherManager {
  public currentWeather: WeatherType = WeatherType.CLEAR;
  public targetWeather: WeatherType = WeatherType.CLEAR;

  // Active interpolated values
  public activeProfile: WeatherProfile;

  private isTransitioning: boolean = false;
  private transitionTimer: number = 0;
  private transitionDuration: number = 3.5; // Smooth 3.5-second blending

  private fromProfile: WeatherProfile;
  private toProfile: WeatherProfile;

  // Dynamic Weather Cycle (optional automated atmospheric evolution during endurance races)
  public isCycleEnabled: boolean = false;
  private cycleTimer: number = 0;
  private readonly cycleInterval: number = 90.0; // Changes state every 90 seconds in cycle mode

  // Callbacks
  private listeners: WeatherUpdateCallback[] = [];

  constructor(initialWeather: WeatherType = WeatherType.CLEAR) {
    this.currentWeather = initialWeather;
    this.targetWeather = initialWeather;
    this.fromProfile = { ...WEATHER_PROFILES[initialWeather] };
    this.toProfile = { ...WEATHER_PROFILES[initialWeather] };
    this.activeProfile = { ...WEATHER_PROFILES[initialWeather] };
  }

  public onUpdate(callback: WeatherUpdateCallback): void {
    this.listeners.push(callback);
    // Fire immediately with initial state
    callback(this.activeProfile, 1.0);
  }

  /**
   * Transitions cleanly to a new weather state over transitionDuration seconds.
   */
  public setWeather(weather: WeatherType, immediate: boolean = false): void {
    if (this.currentWeather === weather && !this.isTransitioning) return;

    this.targetWeather = weather;
    this.toProfile = WEATHER_PROFILES[weather];

    if (immediate) {
      this.currentWeather = weather;
      this.fromProfile = { ...this.toProfile };
      Object.assign(this.activeProfile, this.toProfile);
      this.isTransitioning = false;
      this.transitionTimer = 0;
      this.notifyListeners(1.0);
    } else {
      // Snapshot current interpolated values as start point
      this.fromProfile = { ...this.activeProfile };
      this.isTransitioning = true;
      this.transitionTimer = 0;
    }
  }

  /**
   * Main per-frame update loop.
   */
  public update(dt: number): void {
    // 1. Dynamic weather cycle check
    if (this.isCycleEnabled && !this.isTransitioning) {
      this.cycleTimer += dt;
      if (this.cycleTimer >= this.cycleInterval) {
        this.cycleTimer = 0;
        const sequence = [
          WeatherType.CLEAR,
          WeatherType.CLOUDY,
          WeatherType.LIGHT_RAIN,
          WeatherType.HEAVY_RAIN,
          WeatherType.CLOUDY
        ];
        const nextIdx = (sequence.indexOf(this.currentWeather) + 1) % sequence.length;
        this.setWeather(sequence[nextIdx], false);
      }
    }

    // 2. Interpolate active transition
    if (this.isTransitioning) {
      this.transitionTimer += dt;
      const rawAlpha = Math.min(1.0, this.transitionTimer / this.transitionDuration);
      // Smooth sinusoidal ease in/out
      const alpha = 0.5 - 0.5 * Math.cos(rawAlpha * Math.PI);

      this.interpolateProfiles(this.fromProfile, this.toProfile, alpha);

      if (rawAlpha >= 1.0) {
        this.isTransitioning = false;
        this.currentWeather = this.targetWeather;
      }

      this.notifyListeners(alpha);
    }
  }

  private interpolateProfiles(from: WeatherProfile, to: WeatherProfile, t: number): void {
    const p = this.activeProfile;

    p.type = t >= 0.5 ? to.type : from.type;
    p.name = to.name;

    // Linear numeric interpolations
    p.sunIntensity = THREE.MathUtils.lerp(from.sunIntensity, to.sunIntensity, t);
    p.ambientIntensity = THREE.MathUtils.lerp(from.ambientIntensity, to.ambientIntensity, t);
    p.fogNear = THREE.MathUtils.lerp(from.fogNear, to.fogNear, t);
    p.fogFar = THREE.MathUtils.lerp(from.fogFar, to.fogFar, t);
    p.cloudiness = THREE.MathUtils.lerp(from.cloudiness, to.cloudiness, t);
    p.roadWetness = THREE.MathUtils.lerp(from.roadWetness, to.roadWetness, t);
    p.wetGripModifier = THREE.MathUtils.lerp(from.wetGripModifier, to.wetGripModifier, t);
    p.rainParticleCount = Math.round(THREE.MathUtils.lerp(from.rainParticleCount, to.rainParticleCount, t));
    p.rainIntensity = THREE.MathUtils.lerp(from.rainIntensity, to.rainIntensity, t);
    p.rainAudioGain = THREE.MathUtils.lerp(from.rainAudioGain, to.rainAudioGain, t);
    p.tireSprayIntensity = THREE.MathUtils.lerp(from.tireSprayIntensity, to.tireSprayIntensity, t);

    // Color hex interpolations
    p.sunColor = this.lerpHexColor(from.sunColor, to.sunColor, t);
    p.skyColor = this.lerpHexColor(from.skyColor, to.skyColor, t);
    p.groundColor = this.lerpHexColor(from.groundColor, to.groundColor, t);
    p.fogColor = this.lerpHexColor(from.fogColor, to.fogColor, t);
    p.skyTopColor = this.lerpHexColor(from.skyTopColor, to.skyTopColor, t);
    p.skyMidColor = this.lerpHexColor(from.skyMidColor, to.skyMidColor, t);
    p.skyBottomColor = this.lerpHexColor(from.skyBottomColor, to.skyBottomColor, t);
  }

  private lerpHexColor(c1: number, c2: number, t: number): number {
    const colA = new THREE.Color(c1);
    const colB = new THREE.Color(c2);
    colA.lerp(colB, t);
    return colA.getHex();
  }

  private notifyListeners(alpha: number): void {
    for (const listener of this.listeners) {
      listener(this.activeProfile, alpha);
    }
  }

  public reset(): void {
    this.setWeather(WeatherType.CLEAR, true);
    this.cycleTimer = 0;
  }
}

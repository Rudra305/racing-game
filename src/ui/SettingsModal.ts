import { SteeringSystem, SteeringPreset, SteeringAssistMode } from '../vehicles/SteeringSystem';
import { VEHICLE_PRESETS, VehicleConfig } from '../vehicles/VehicleConfig';
import { AIDifficultyLevel } from '../game/race/RaceConfig';

export interface SettingsModalCallbacks {
  onVehiclePresetChanged: (config: VehicleConfig) => void;
  onTrackChanged: (trackId: string) => void;
  onOpenTrackModal?: () => void;
  onQualityChanged?: (scale: number) => void;
  onAIDifficultyChanged?: (difficulty: AIDifficultyLevel) => void;
  onAICountChanged?: (count: number) => void;
  onWeatherChanged?: (weather: 'CLEAR' | 'CLOUDY' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'CYCLE') => void;
  onClosed: () => void;
}

export class SettingsModal {
  private steeringSystem: SteeringSystem;
  private callbacks: SettingsModalCallbacks;
  private modalEl: HTMLElement | null = null;
  private isVisible: boolean = false;

  // DOM Inputs
  private trackPresetSelect!: HTMLSelectElement;
  private weatherSelect!: HTMLSelectElement;
  private graphicsQualitySelect!: HTMLSelectElement;
  private sensitivitySlider!: HTMLInputElement;
  private sensitivityVal!: HTMLElement;
  private returnSpeedSlider!: HTMLInputElement;
  private returnSpeedVal!: HTMLElement;
  private assistSelect!: HTMLSelectElement;
  private presetSelect!: HTMLSelectElement;
  private carPresetSelect!: HTMLSelectElement;
  private aiCountSelect!: HTMLSelectElement;
  private aiDifficultySelect!: HTMLSelectElement;

  constructor(steeringSystem: SteeringSystem, callbacks: SettingsModalCallbacks) {
    this.steeringSystem = steeringSystem;
    this.callbacks = callbacks;
    this.createDOM();
    this.syncFromSettings();
  }

  private createDOM(): void {
    const existing = document.getElementById('settings-modal-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'settings-modal-container';
    container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(10, 14, 20, 0.78);
      backdrop-filter: blur(12px);
      z-index: 200;
      display: none;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
    `;

    container.innerHTML = `
      <div style="
        background: #0f141c;
        border: 1px solid rgba(88, 166, 255, 0.25);
        border-radius: 12px;
        width: 460px;
        max-width: 90vw;
        padding: 28px 32px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.7);
        color: #f0f6fc;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px;">
          <h2 style="font-size: 18px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #58a6ff; display: flex; align-items: center; gap: 8px;">
            <span>⚙️</span> Vehicle & Steering Settings
          </h2>
          <button id="btn-close-settings" style="background: none; border: none; color: #8b949e; font-size: 20px; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: color 0.15s;">✕</button>
        </div>

        <!-- Circuit Track Selection -->
        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label style="font-size: 11px; font-weight: 700; color: #8b949e; text-transform: uppercase; letter-spacing: 0.08em;">Race Circuit (Track & Terrain)</label>
            <button id="btn-browse-circuits" style="background: rgba(88, 166, 255, 0.15); border: 1px solid rgba(88, 166, 255, 0.4); color: #58a6ff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; cursor: pointer; text-transform: uppercase;">
              Browse Directory ➔
            </button>
          </div>
          <select id="setting-track-preset" style="width: 100%; background: #161d27; border: 1px solid rgba(88, 166, 255, 0.4); color: #58a6ff; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-family: monospace; cursor: pointer; font-weight: 700;">
            <option value="alpine-circuit">Alpine Test Circuit (42m Elevation, Banked Hairpin)</option>
            <option value="desert-canyon">Canyon Diablo Speedway (Sandstone Gorges, High-Speed Wash)</option>
            <option value="coastal-speedway">Coastal Speedway (High-Speed Sweepers, Ocean Plains)</option>
            <option value="gp-technical">Grand Prix Technical (Technical Chicanes, Precision Flow)</option>
          </select>
        </div>

        <!-- Weather Condition -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 11px; font-weight: 700; color: #8b949e; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.08em;">Race Weather Condition</label>
          <select id="setting-weather-preset" style="width: 100%; background: #161d27; border: 1px solid rgba(88, 166, 255, 0.4); color: #58a6ff; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-family: monospace; cursor: pointer; font-weight: 700;">
            <option value="CLEAR" selected>☀️ Clear Sky (Golden Alpine Sunlight)</option>
            <option value="CLOUDY">⛅ Overcast (Soft Diffuse Lighting)</option>
            <option value="LIGHT_RAIN">🌦️ Light Rain (Wet Road Sheen & Tire Spray)</option>
            <option value="HEAVY_RAIN">🌧️ Heavy Rain (Thunder & Low Visibility)</option>
            <option value="CYCLE">🔄 Dynamic Weather Cycle</option>
          </select>
        </div>

        <!-- AI Grid & Difficulty -->
        <div style="display: flex; gap: 14px; margin-bottom: 20px;">
          <div style="flex: 1;">
            <label style="display: block; font-size: 11px; font-weight: 700; color: #8b949e; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.08em;">AI Opponents</label>
            <select id="setting-ai-count" style="width: 100%; background: #161d27; border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 8px 10px; border-radius: 6px; font-size: 12px; font-family: monospace; cursor: pointer;">
              <option value="7">7 AI (8 Cars Total)</option>
              <option value="5" selected>5 AI (6 Cars Total)</option>
              <option value="3">3 AI (4 Cars Total)</option>
              <option value="1">1 AI (1v1 Duel)</option>
            </select>
          </div>
          <div style="flex: 1;">
            <label style="display: block; font-size: 11px; font-weight: 700; color: #8b949e; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.08em;">AI Difficulty</label>
            <select id="setting-ai-difficulty" style="width: 100%; background: #161d27; border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 8px 10px; border-radius: 6px; font-size: 12px; font-family: monospace; cursor: pointer;">
              <option value="EASY">Easy (Relaxed)</option>
              <option value="NORMAL" selected>Normal (Balanced)</option>
              <option value="HARD">Hard (Aggressive)</option>
              <option value="EXPERT">Expert (Flawless)</option>
            </select>
          </div>
        </div>

        <!-- Graphics & Environment Quality -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 11px; font-weight: 700; color: #8b949e; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.08em;">Environment Quality (LOD & Draw Distance)</label>
          <select id="setting-graphics-preset" style="width: 100%; background: #161d27; border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-family: monospace; cursor: pointer;">
            <option value="1.0" selected>High (Recommended — Balanced 60 FPS)</option>
            <option value="0.75">Low (Entry GPU / Increased Performance)</option>
            <option value="0.88">Medium (Mid-Range Hardware)</option>
            <option value="1.25">Ultra (Extended Range & High Density)</option>
          </select>
        </div>

        <!-- Vehicle Preset -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 11px; font-weight: 700; color: #8b949e; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.08em;">Vehicle Chassis Preset</label>
          <select id="setting-car-preset" style="width: 100%; background: #161d27; border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-family: monospace; cursor: pointer;">
            <option value="Sports">Apex GT-R (Sports Car — Balanced)</option>
            <option value="Supercar">Veloce Hyperion (Supercar — High Downforce)</option>
            <option value="Rally">Crossfire Rally (Rally — Loose Surface Drift)</option>
            <option value="Formula">Aero 1 Single-Seater (Formula — Extreme Grip)</option>
          </select>
        </div>

        <!-- Handling Preset -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 11px; font-weight: 700; color: #8b949e; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.08em;">Handling Mode Preset</label>
          <select id="setting-preset" style="width: 100%; background: #161d27; border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-family: monospace; cursor: pointer;">
            <option value="Balanced">Balanced (Recommended Default)</option>
            <option value="Arcade">Arcade (High Response & Strong Assist)</option>
            <option value="Simulation">Simulation (Pure Direct Control & Low Assist)</option>
            <option value="Custom">Custom (Manual Configuration)</option>
          </select>
        </div>

        <!-- Steering Sensitivity Slider -->
        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
            <label style="font-size: 11px; font-weight: 700; color: #8b949e; text-transform: uppercase; letter-spacing: 0.08em;">Steering Sensitivity</label>
            <span id="val-sensitivity" style="font-size: 13px; font-family: monospace; color: #7ee787; font-weight: 700;">1.00x</span>
          </div>
          <input type="range" id="setting-sensitivity" min="0.25" max="2.0" step="0.05" value="1.0" style="width: 100%; accent-color: #58a6ff; cursor: pointer;" />
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6e7681; margin-top: 2px;">
            <span>0.25x (Smooth / Slow)</span>
            <span>2.0x (Hyper Responsive)</span>
          </div>
        </div>

        <!-- Steering Return Speed Slider -->
        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
            <label style="font-size: 11px; font-weight: 700; color: #8b949e; text-transform: uppercase; letter-spacing: 0.08em;">Steering Return Speed (Centering)</label>
            <span id="val-return-speed" style="font-size: 13px; font-family: monospace; color: #7ee787; font-weight: 700;">5.5</span>
          </div>
          <input type="range" id="setting-return-speed" min="2.0" max="10.0" step="0.5" value="5.5" style="width: 100%; accent-color: #58a6ff; cursor: pointer;" />
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6e7681; margin-top: 2px;">
            <span>Slow Return</span>
            <span>Instant Snap</span>
          </div>
        </div>

        <!-- Steering Assist -->
        <div style="margin-bottom: 26px;">
          <label style="display: block; font-size: 11px; font-weight: 700; color: #8b949e; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.08em;">Counter-Steer Assist (Drift Stability)</label>
          <select id="setting-assist" style="width: 100%; background: #161d27; border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-family: monospace; cursor: pointer;">
            <option value="OFF">OFF (Full Manual Drift Counter-Steer)</option>
            <option value="LOW">LOW (Subtle Stabilization)</option>
            <option value="MEDIUM">MEDIUM (Balanced Drift Assistance)</option>
            <option value="HIGH">HIGH (Strong Slide Correction)</option>
          </select>
        </div>

        <!-- Buttons -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px;">
          <button id="btn-reset-settings" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #c9d1d9; padding: 8px 14px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: background 0.15s;">Reset Defaults</button>
          <button id="btn-apply-settings" style="background: #1f6feb; border: none; color: #fff; padding: 8px 22px; border-radius: 6px; font-size: 12px; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: background 0.15s;">Resume Racing</button>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    this.modalEl = container;

    // Cache elements
    this.trackPresetSelect = container.querySelector('#setting-track-preset') as HTMLSelectElement;
    this.weatherSelect = container.querySelector('#setting-weather-preset') as HTMLSelectElement;
    this.graphicsQualitySelect = container.querySelector('#setting-graphics-preset') as HTMLSelectElement;
    this.sensitivitySlider = container.querySelector('#setting-sensitivity') as HTMLInputElement;
    this.sensitivityVal = container.querySelector('#val-sensitivity') as HTMLElement;
    this.returnSpeedSlider = container.querySelector('#setting-return-speed') as HTMLInputElement;
    this.returnSpeedVal = container.querySelector('#val-return-speed') as HTMLElement;
    this.assistSelect = container.querySelector('#setting-assist') as HTMLSelectElement;
    this.presetSelect = container.querySelector('#setting-preset') as HTMLSelectElement;
    this.carPresetSelect = container.querySelector('#setting-car-preset') as HTMLSelectElement;
    this.aiCountSelect = container.querySelector('#setting-ai-count') as HTMLSelectElement;
    this.aiDifficultySelect = container.querySelector('#setting-ai-difficulty') as HTMLSelectElement;

    // Wire Event Listeners
    container.querySelector('#btn-close-settings')?.addEventListener('click', () => this.hide());
    container.querySelector('#btn-apply-settings')?.addEventListener('click', () => this.hide());
    container.querySelector('#btn-reset-settings')?.addEventListener('click', () => {
      this.steeringSystem.resetToDefaults();
      this.syncFromSettings();
    });

    this.weatherSelect.addEventListener('change', () => {
      const w = this.weatherSelect.value as 'CLEAR' | 'CLOUDY' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'CYCLE';
      try {
        localStorage.setItem('racingGame.weather', w);
      } catch {}
      this.callbacks.onWeatherChanged?.(w);
    });

    this.aiCountSelect.addEventListener('change', () => {
      const count = parseInt(this.aiCountSelect.value, 10);
      try {
        localStorage.setItem('racingGame.aiCount', count.toString());
      } catch {}
      this.callbacks.onAICountChanged?.(count);
    });

    this.aiDifficultySelect.addEventListener('change', () => {
      const diff = this.aiDifficultySelect.value as AIDifficultyLevel;
      try {
        localStorage.setItem('racingGame.aiDifficulty', diff);
      } catch {}
      this.callbacks.onAIDifficultyChanged?.(diff);
    });

    this.trackPresetSelect.addEventListener('change', () => {
      const trackId = this.trackPresetSelect.value;
      this.callbacks.onTrackChanged(trackId);
    });

    const browseBtn = this.modalEl?.querySelector('#btn-browse-circuits');
    if (browseBtn) {
      browseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.hide();
        this.callbacks.onOpenTrackModal?.();
      });
    }

    this.graphicsQualitySelect.addEventListener('change', () => {
      const scale = parseFloat(this.graphicsQualitySelect.value);
      this.callbacks.onQualityChanged?.(scale);
    });

    this.sensitivitySlider.addEventListener('input', () => {
      const val = parseFloat(this.sensitivitySlider.value);
      this.sensitivityVal.textContent = `${val.toFixed(2)}x`;
      this.steeringSystem.settings.sensitivity = val;
      this.steeringSystem.settings.preset = 'Custom';
      this.presetSelect.value = 'Custom';
      this.steeringSystem.saveSettings();
    });

    this.returnSpeedSlider.addEventListener('input', () => {
      const val = parseFloat(this.returnSpeedSlider.value);
      this.returnSpeedVal.textContent = val.toFixed(1);
      this.steeringSystem.settings.returnSpeed = val;
      this.steeringSystem.settings.preset = 'Custom';
      this.presetSelect.value = 'Custom';
      this.steeringSystem.saveSettings();
    });

    this.assistSelect.addEventListener('change', () => {
      this.steeringSystem.settings.steeringAssist = this.assistSelect.value as SteeringAssistMode;
      this.steeringSystem.settings.preset = 'Custom';
      this.presetSelect.value = 'Custom';
      this.steeringSystem.saveSettings();
    });

    this.presetSelect.addEventListener('change', () => {
      const p = this.presetSelect.value as SteeringPreset;
      if (p !== 'Custom') {
        this.steeringSystem.applyPreset(p);
        this.syncFromSettings();
      }
    });

    this.carPresetSelect.addEventListener('change', () => {
      const key = this.carPresetSelect.value;
      const presetConfig = VEHICLE_PRESETS[key];
      if (presetConfig) {
        this.callbacks.onVehiclePresetChanged(presetConfig);
      }
    });
  }

  public setTrack(trackId: string): void {
    if (this.trackPresetSelect) {
      this.trackPresetSelect.value = trackId;
    }
  }

  public setWeather(weather: string): void {
    if (this.weatherSelect) {
      this.weatherSelect.value = weather;
    }
  }

  public setAIDifficulty(diff: AIDifficultyLevel): void {
    if (this.aiDifficultySelect) {
      this.aiDifficultySelect.value = diff;
    }
  }

  public setAICount(count: number): void {
    if (this.aiCountSelect) {
      this.aiCountSelect.value = count.toString();
    }
  }

  public syncFromSettings(): void {
    const s = this.steeringSystem.settings;
    if (this.sensitivitySlider) {
      this.sensitivitySlider.value = s.sensitivity.toString();
      this.sensitivityVal.textContent = `${s.sensitivity.toFixed(2)}x`;
    }
    if (this.returnSpeedSlider) {
      this.returnSpeedSlider.value = s.returnSpeed.toString();
      this.returnSpeedVal.textContent = s.returnSpeed.toFixed(1);
    }
    if (this.assistSelect) {
      this.assistSelect.value = s.steeringAssist;
    }
    if (this.presetSelect) {
      this.presetSelect.value = s.preset;
    }

    try {
      const savedDiff = localStorage.getItem('racingGame.aiDifficulty');
      if (savedDiff && this.aiDifficultySelect) {
        this.aiDifficultySelect.value = savedDiff;
      }
      const savedCount = localStorage.getItem('racingGame.aiCount');
      if (savedCount && this.aiCountSelect) {
        this.aiCountSelect.value = savedCount;
      }
      const savedWeather = localStorage.getItem('racingGame.weather');
      if (savedWeather && this.weatherSelect) {
        this.weatherSelect.value = savedWeather;
      }
    } catch {}
  }

  public toggle(): boolean {
    if (this.isVisible) this.hide();
    else this.show();
    return this.isVisible;
  }

  public show(): void {
    this.isVisible = true;
    this.syncFromSettings();
    if (this.modalEl) {
      this.modalEl.style.display = 'flex';
    }
  }

  public hide(): void {
    this.isVisible = false;
    if (this.modalEl) {
      this.modalEl.style.display = 'none';
    }
    this.callbacks.onClosed();
  }

  public get visible(): boolean {
    return this.isVisible;
  }
}

import { GameState, RaceState } from '../core/GameState';
import { VehiclePhysics, VehicleTelemetry } from '../physics/VehiclePhysics';
import { SurfaceType } from '../physics/SurfaceSystem';

export class HUD {
  // DOM Elements
  private speedEl: HTMLElement | null;
  private lapEl: HTMLElement | null;
  private lapStatusEl: HTMLElement | null;
  private currentTimeEl: HTMLElement | null;
  private bestTimeEl: HTMLElement | null;
  private announcementEl: HTMLElement | null;

  // Phase 2 Elements
  private gearEl: HTMLElement | null;
  private rpmBarEl: HTMLElement | null;
  private rpmTextEl: HTMLElement | null;
  private surfaceEl: HTMLElement | null;
  private driftIndicatorEl: HTMLElement | null;
  private driftDegEl: HTMLElement | null;

  // Cache values to prevent unnecessary DOM writes
  private prevSpeed: number = -1;
  private prevLapText: string = '';
  private prevLapStatusText: string = '';
  private prevCurrentTimeText: string = '';
  private prevBestTimeText: string = '';
  private prevAnnouncementText: string = '';
  private prevGear: string = '';
  private prevRpmBarWidth: string = '';
  private prevSurface: SurfaceType | '' = '';
  private prevDrifting: boolean = false;
  private prevDriftDeg: number = -1;

  constructor() {
    this.speedEl = document.getElementById('hud-speed');
    this.lapEl = document.getElementById('hud-lap');
    this.lapStatusEl = document.getElementById('hud-lap-status');
    this.currentTimeEl = document.getElementById('hud-current-time');
    this.bestTimeEl = document.getElementById('hud-best-time');
    this.announcementEl = document.getElementById('announcement-text');

    this.gearEl = document.getElementById('hud-gear');
    this.rpmBarEl = document.getElementById('hud-rpm-bar');
    this.rpmTextEl = document.getElementById('hud-rpm-text');
    this.surfaceEl = document.getElementById('hud-surface');
    this.driftIndicatorEl = document.getElementById('drift-indicator');
    this.driftDegEl = document.getElementById('hud-drift-deg');
  }

  public onSettingsButtonClick(callback: () => void): void {
    const btn = document.getElementById('btn-open-settings');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        callback();
      });
    }
  }

  /**
   * Updates HUD telemetry without forcing DOM layout reflows.
   */
  public update(gameState: GameState, vehiclePhysics: VehiclePhysics): void {
    const telem: VehicleTelemetry = vehiclePhysics.telemetry;

    // 1. Digital Speedometer
    const speed = telem.speedKmH;
    if (speed !== this.prevSpeed && this.speedEl) {
      this.speedEl.textContent = speed.toString().padStart(3, '0');
      this.prevSpeed = speed;
    }

    // 2. Gear Display
    if (telem.gear !== this.prevGear && this.gearEl) {
      this.gearEl.textContent = telem.gear;
      this.prevGear = telem.gear;
    }

    // 3. Tachometer / RPM Bar
    const rpmRatio = Math.max(0, Math.min(1.0, telem.rpmRatio));
    const barWidth = `${Math.round(rpmRatio * 100)}%`;
    if (barWidth !== this.prevRpmBarWidth && this.rpmBarEl) {
      this.rpmBarEl.style.width = barWidth;
      this.prevRpmBarWidth = barWidth;
    }
    if (this.rpmTextEl) {
      this.rpmTextEl.textContent = `${telem.rpm.toLocaleString()} RPM`;
    }

    // 4. Surface Badge
    if (telem.surface !== this.prevSurface && this.surfaceEl) {
      this.surfaceEl.textContent = telem.surface;
      if (telem.surface === SurfaceType.ASPHALT) {
        this.surfaceEl.style.color = '#8b949e';
        this.surfaceEl.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      } else if (telem.surface === SurfaceType.KERB) {
        this.surfaceEl.style.color = '#f0883e';
        this.surfaceEl.style.borderColor = '#f0883e';
      } else if (telem.surface === SurfaceType.GRASS) {
        this.surfaceEl.style.color = '#7ee787';
        this.surfaceEl.style.borderColor = '#2ea043';
      }
      this.prevSurface = telem.surface;
    }

    // 5. Drift Indicator
    if (telem.isDrifting !== this.prevDrifting && this.driftIndicatorEl) {
      this.driftIndicatorEl.style.display = telem.isDrifting ? 'block' : 'none';
      this.prevDrifting = telem.isDrifting;
    }
    if (telem.isDrifting && this.driftDegEl) {
      const roundedAngle = Math.round(telem.driftAngle);
      if (roundedAngle !== this.prevDriftDeg) {
        this.driftDegEl.textContent = roundedAngle.toString();
        this.prevDriftDeg = roundedAngle;
      }
    }

    // 6. Lap Display
    const lapText = `${gameState.currentLap} / ${gameState.totalLaps}`;
    if (lapText !== this.prevLapText && this.lapEl) {
      this.lapEl.textContent = lapText;
      this.prevLapText = lapText;
    }

    // Checkpoint Sub-status
    const statusText = `CHECKPOINT ${gameState.currentCheckpoint} / ${gameState.totalCheckpoints}`;
    if (statusText !== this.prevLapStatusText && this.lapStatusEl) {
      this.lapStatusEl.textContent = statusText;
      this.prevLapStatusText = statusText;
    }

    // 7. Race Timers
    let currentFormatted = gameState.formatTime(gameState.currentLapTime);
    if (gameState.state === RaceState.COUNTDOWN) {
      currentFormatted = '00:00.000';
    }
    if (currentFormatted !== this.prevCurrentTimeText && this.currentTimeEl) {
      this.currentTimeEl.textContent = currentFormatted;
      this.prevCurrentTimeText = currentFormatted;
    }

    const bestFormatted = gameState.bestLapTime > 0
      ? `BEST: ${gameState.formatTime(gameState.bestLapTime)}`
      : 'BEST: --:--.---';
    if (bestFormatted !== this.prevBestTimeText && this.bestTimeEl) {
      this.bestTimeEl.textContent = bestFormatted;
      this.prevBestTimeText = bestFormatted;
    }

    // 8. Announcement Overlay (3... 2... 1... GO! / FINISH)
    const announcementText = gameState.countdownText;
    if (announcementText !== this.prevAnnouncementText && this.announcementEl) {
      this.announcementEl.textContent = announcementText;
      this.prevAnnouncementText = announcementText;

      if (announcementText) {
        this.announcementEl.style.display = 'block';
        this.announcementEl.style.transform = 'scale(1.25)';
        setTimeout(() => {
          if (this.announcementEl) this.announcementEl.style.transform = 'scale(1.0)';
        }, 80);
      } else {
        this.announcementEl.style.display = 'none';
      }
    }
  }
}

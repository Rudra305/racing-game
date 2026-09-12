import { VehiclePhysics, VehicleTelemetry } from '../physics/VehiclePhysics';
import { SurfaceType } from '../physics/SurfaceSystem';
import { RaceManager } from '../game/race/RaceManager';
import { RaceState } from '../game/race/RaceState';
import { RaceTimer } from '../game/race/RaceTimer';

export class HUD {
  // DOM Elements - Gauges
  private speedEl: HTMLElement | null;
  private gearEl: HTMLElement | null;
  private rpmBarEl: HTMLElement | null;
  private rpmTextEl: HTMLElement | null;
  private surfaceEl: HTMLElement | null;
  private driftIndicatorEl: HTMLElement | null;
  private driftDegEl: HTMLElement | null;

  // DOM Elements - Race & Position
  private positionEl: HTMLElement | null;
  private posStatusEl: HTMLElement | null;
  private lapEl: HTMLElement | null;
  private lapStatusEl: HTMLElement | null;
  private currentTimeEl: HTMLElement | null;
  private bestTimeEl: HTMLElement | null;
  private announcementEl: HTMLElement | null;

  // DOM Elements - Results Modal
  private resultsOverlayEl: HTMLElement | null;
  private resultsHeadlineEl: HTMLElement | null;
  private resultsTbodyEl: HTMLElement | null;
  private restartBtnEl: HTMLElement | null;

  // Cache values to avoid layout thrashing
  private prevSpeed: number = -1;
  private prevGear: string = '';
  private prevRpmBarWidth: string = '';
  private prevSurface: SurfaceType | '' = '';
  private prevDrifting: boolean = false;
  private prevDriftDeg: number = -1;

  private prevPosText: string = '';
  private prevPosStatusText: string = '';
  private prevLapText: string = '';
  private prevLapStatusText: string = '';
  private prevCurrentTimeText: string = '';
  private prevBestTimeText: string = '';
  private prevAnnouncementText: string = '';
  private resultsDisplayed: boolean = false;

  // Throttling timer for 12.5 Hz DOM updates on text telemetry
  private textUpdateTimer: number = 0;
  private readonly textUpdateInterval: number = 0.08;

  constructor() {
    this.speedEl = document.getElementById('hud-speed');
    this.gearEl = document.getElementById('hud-gear');
    this.rpmBarEl = document.getElementById('hud-rpm-bar');
    this.rpmTextEl = document.getElementById('hud-rpm-text');
    this.surfaceEl = document.getElementById('hud-surface');
    this.driftIndicatorEl = document.getElementById('drift-indicator');
    this.driftDegEl = document.getElementById('hud-drift-deg');

    this.positionEl = document.getElementById('hud-position');
    this.posStatusEl = document.getElementById('hud-pos-status');
    this.lapEl = document.getElementById('hud-lap');
    this.lapStatusEl = document.getElementById('hud-lap-status');
    this.currentTimeEl = document.getElementById('hud-current-time');
    this.bestTimeEl = document.getElementById('hud-best-time');
    this.announcementEl = document.getElementById('announcement-text');

    this.resultsOverlayEl = document.getElementById('race-results-overlay');
    this.resultsHeadlineEl = document.getElementById('results-headline');
    this.resultsTbodyEl = document.getElementById('results-tbody');
    this.restartBtnEl = document.getElementById('btn-restart-race');
  }

  public onGarageButtonClick(callback: () => void): void {
    const btn = document.getElementById('btn-open-garage');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        callback();
      });
    }
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

  public onAudioButtonClick(callback: () => void): void {
    const btn = document.getElementById('btn-toggle-audio');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        callback();
      });
    }
  }

  public updateAudioButton(isMuted: boolean): void {
    const btn = document.getElementById('btn-toggle-audio');
    if (btn) {
      btn.textContent = isMuted ? '🔇 MUTED (M)' : '🔊 AUDIO (M)';
      btn.style.color = isMuted ? '#f85149' : '#58a6ff';
    }
  }

  public onRestartButtonClick(callback: () => void): void {
    if (this.restartBtnEl) {
      this.restartBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideResults();
        callback();
      });
    }
  }

  public hideResults(): void {
    if (this.resultsOverlayEl) {
      this.resultsOverlayEl.style.display = 'none';
    }
    this.resultsDisplayed = false;
  }

  public reset(): void {
    this.hideResults();
    this.prevPosText = '';
    this.prevPosStatusText = '';
    this.prevLapText = '';
    this.prevLapStatusText = '';
    this.prevCurrentTimeText = '';
    this.prevBestTimeText = '';
    this.prevAnnouncementText = '';
    this.textUpdateTimer = this.textUpdateInterval;
  }

  /**
   * Updates HUD telemetry without forcing DOM layout reflows.
   * High-frequency gauges (speed, rpm, drift) update per frame.
   * Lower-frequency text (position, lap, times) throttled to ~12.5 Hz.
   */
  public update(dt: number, raceManager: RaceManager, vehiclePhysics: VehiclePhysics, totalCheckpoints: number): void {
    const telem: VehicleTelemetry = vehiclePhysics.telemetry;

    // 1. Digital Speedometer (Per Frame)
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

    // 6. Announcement Overlay (3... 2... 1... GO! / FINISH)
    const announcementText = raceManager.countdownText;
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

    // 7. Throttled Text Updates (Positions, Lap, Timers, Gap) ~12.5 Hz
    this.textUpdateTimer += dt;
    if (this.textUpdateTimer >= this.textUpdateInterval) {
      this.textUpdateTimer = 0;
      this.updateThrottledText(raceManager, totalCheckpoints);
    }

    // 8. Results Modal Check
    if (raceManager.state === RaceState.RESULTS && !this.resultsDisplayed) {
      this.showResults(raceManager);
    }
  }

  private updateThrottledText(raceManager: RaceManager, totalCheckpoints: number): void {
    const totalParticipants = raceManager.positionManager.standings.length || 1;
    const playerStanding = raceManager.positionManager.getParticipant('player');
    const playerPos = playerStanding ? playerStanding.position : 1;

    // Position Display
    const posText = `P${playerPos} <span style="font-size: 16px; color: #8b949e;">/ ${totalParticipants}</span>`;
    if (posText !== this.prevPosText && this.positionEl) {
      this.positionEl.innerHTML = posText;
      this.prevPosText = posText;
    }

    // Position Status (LEADER or Gap)
    let statusText = 'LEADER';
    if (playerPos > 1) {
      const leader = raceManager.positionManager.standings[0];
      if (leader && playerStanding) {
        const distDiff = Math.max(0, leader.totalProgress - playerStanding.totalProgress);
        statusText = `-${distDiff.toFixed(0)}m`;
      }
    }
    if (statusText !== this.prevPosStatusText && this.posStatusEl) {
      this.posStatusEl.textContent = statusText;
      this.prevPosStatusText = statusText;
    }

    // Lap Display
    const lapNum = Math.min(raceManager.config.laps, raceManager.playerLapManager.currentLap);
    const lapText = `${lapNum} / ${raceManager.config.laps}`;
    if (lapText !== this.prevLapText && this.lapEl) {
      this.lapEl.textContent = lapText;
      this.prevLapText = lapText;
    }

    // Checkpoint Status
    const cpText = `CHECKPOINT ${raceManager.playerCheckpointManager.currentCheckpoint} / ${totalCheckpoints}`;
    if (cpText !== this.prevLapStatusText && this.lapStatusEl) {
      this.lapStatusEl.textContent = cpText;
      this.prevLapStatusText = cpText;
    }

    // Current Lap / Race Time
    let currentFormatted = RaceTimer.formatTime(raceManager.timer.currentLapTime);
    if (raceManager.state === RaceState.COUNTDOWN || raceManager.state === RaceState.GRID) {
      currentFormatted = '00:00.000';
    }
    if (currentFormatted !== this.prevCurrentTimeText && this.currentTimeEl) {
      this.currentTimeEl.textContent = currentFormatted;
      this.prevCurrentTimeText = currentFormatted;
    }

    // Best Lap
    const bestTime = raceManager.playerLapManager.bestLapTime;
    const bestFormatted = bestTime > 0
      ? `BEST: ${RaceTimer.formatTime(bestTime)}`
      : 'BEST: --:--.---';
    if (bestFormatted !== this.prevBestTimeText && this.bestTimeEl) {
      this.bestTimeEl.textContent = bestFormatted;
      this.prevBestTimeText = bestFormatted;
    }
  }

  private showResults(raceManager: RaceManager): void {
    this.resultsDisplayed = true;
    if (!this.resultsOverlayEl || !this.resultsTbodyEl) return;

    const results = raceManager.finishSystem.getResults(raceManager.positionManager);
    const playerResult = results.results.find(r => r.isPlayer);
    const playerPos = playerResult ? playerResult.position : 1;

    // Headline
    if (this.resultsHeadlineEl) {
      if (playerPos === 1) {
        this.resultsHeadlineEl.textContent = '🏆 VICTORY! — 1ST PLACE';
        this.resultsHeadlineEl.style.color = '#7ee787';
      } else if (playerPos === 2) {
        this.resultsHeadlineEl.textContent = '🥈 2ND PLACE PODIUM';
        this.resultsHeadlineEl.style.color = '#58a6ff';
      } else if (playerPos === 3) {
        this.resultsHeadlineEl.textContent = '🥉 3RD PLACE PODIUM';
        this.resultsHeadlineEl.style.color = '#f0883e';
      } else {
        this.resultsHeadlineEl.textContent = `FINISHED — POSITION P${playerPos}`;
        this.resultsHeadlineEl.style.color = '#c9d1d9';
      }
    }

    // Standings Table Rows
    let rowsHtml = '';
    for (const res of results.results) {
      const isPlayer = res.isPlayer;
      const rowStyle = isPlayer
        ? 'background: rgba(31, 111, 235, 0.25); font-weight: bold; color: #58a6ff;'
        : 'color: #c9d1d9;';
      const posBadge = res.position === 1 ? '🥇' : res.position === 2 ? '🥈' : res.position === 3 ? '🥉' : `P${res.position}`;

      rowsHtml += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); ${rowStyle}">
          <td style="padding: 10px 8px;">${posBadge}</td>
          <td style="padding: 10px 8px;">${res.name} ${isPlayer ? '<span style="font-size: 10px; background: #1f6feb; color: #fff; padding: 1px 5px; border-radius: 3px; margin-left: 4px;">YOU</span>' : ''}</td>
          <td style="padding: 10px 8px; text-align: right;">${res.formattedBestLap}</td>
          <td style="padding: 10px 8px; text-align: right;">${res.formattedTotalTime}</td>
          <td style="padding: 10px 8px; text-align: right;">${res.gap}</td>
        </tr>
      `;
    }

    this.resultsTbodyEl.innerHTML = rowsHtml;
    this.resultsOverlayEl.style.display = 'flex';
  }
}

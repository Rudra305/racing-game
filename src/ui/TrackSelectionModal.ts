import { TrackDefinition } from '../tracks/TrackTypes';
import { TrackManager } from '../tracks/TrackManager';

export interface TrackSelectionCallbacks {
  onSelectTrack: (trackId: string) => void;
  onClose?: () => void;
}

export class TrackSelectionModal {
  private overlay: HTMLElement;
  private callbacks: TrackSelectionCallbacks;
  private currentTrackId: string = 'alpine-circuit';
  private isOpen: boolean = false;
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;

  constructor(overlay: HTMLElement, callbacks: TrackSelectionCallbacks) {
    this.overlay = overlay;
    this.callbacks = callbacks;
  }

  public open(currentTrackId: string): void {
    this.currentTrackId = currentTrackId;
    this.isOpen = true;
    this.render();
    this.overlay.style.display = 'flex';

    this.keydownListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    window.addEventListener('keydown', this.keydownListener);
  }

  public close(): void {
    this.isOpen = false;
    this.overlay.style.display = 'none';
    this.overlay.innerHTML = '';
    if (this.keydownListener) {
      window.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = null;
    }
    if (this.callbacks.onClose) {
      this.callbacks.onClose();
    }
  }

  public get visible(): boolean {
    return this.isOpen;
  }

  private generateTrackSvg(track: TrackDefinition): string {
    const points = track.spline.points;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const pt of points) {
      const x = pt.position[0];
      const z = pt.position[2];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }

    const padding = 24;
    const rangeX = (maxX - minX) || 1;
    const rangeZ = (maxZ - minZ) || 1;
    const svgWidth = 260;
    const svgHeight = 130;

    const scale = Math.min((svgWidth - padding * 2) / rangeX, (svgHeight - padding * 2) / rangeZ);
    const midX = (minX + maxX) * 0.5;
    const midZ = (minZ + maxZ) * 0.5;

    const toSvgX = (x: number) => svgWidth * 0.5 + (x - midX) * scale;
    const toSvgY = (z: number) => svgHeight * 0.5 + (z - midZ) * scale;

    const d = points.map((pt, i) => {
      const sx = toSvgX(pt.position[0]).toFixed(1);
      const sy = toSvgY(pt.position[2]).toFixed(1);
      return `${i === 0 ? 'M' : 'L'} ${sx} ${sy}`;
    }).join(' ') + ' Z';

    const startX = toSvgX(points[0].position[0]).toFixed(1);
    const startY = toSvgY(points[0].position[2]).toFixed(1);

    return `
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 120px; display: block; overflow: visible;">
        <defs>
          <filter id="track-glow-${track.id}" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <!-- Outer Track Bed -->
        <path d="${d}" fill="rgba(88, 166, 255, 0.05)" stroke="rgba(88, 166, 255, 0.25)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Inner Centerline Racing Line -->
        <path d="${d}" fill="none" stroke="#58a6ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#track-glow-${track.id})" />
        <!-- Start/Finish Gate Marker -->
        <circle cx="${startX}" cy="${startY}" r="4.5" fill="#f1e05a" stroke="#ffffff" stroke-width="1.5" />
      </svg>
    `;
  }

  private render(): void {
    const tracks = TrackManager.getAvailableTracks();

    this.overlay.innerHTML = `
      <div style="
        position: fixed;
        inset: 0;
        background: rgba(4, 7, 12, 0.85);
        backdrop-filter: blur(16px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 120;
        padding: 24px;
        box-sizing: border-box;
      ">
        <div style="
          background: rgba(13, 17, 23, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.85);
          width: 100%;
          max-width: 1100px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #f0f6fc;
        ">
          <!-- Modal Header -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 28px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(22, 27, 34, 0.5);
          ">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                <span style="background: rgba(88, 166, 255, 0.15); color: #58a6ff; font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.12em; text-transform: uppercase;">
                  PHASE 9
                </span>
                <h2 style="font-size: 20px; font-weight: 800; letter-spacing: -0.01em; margin: 0; color: #ffffff;">
                  CIRCUIT DIRECTORY
                </h2>
              </div>
              <p style="margin: 0; font-size: 13px; color: #8b949e;">
                Select a high-fidelity racing circuit with distinct biomes, elevation relief, and tuned racing lines.
              </p>
            </div>
            <button id="btn-close-track-modal" style="
              background: rgba(255, 255, 255, 0.06);
              border: 1px solid rgba(255, 255, 255, 0.12);
              color: #8b949e;
              font-size: 16px;
              width: 36px;
              height: 36px;
              border-radius: 8px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.15s;
            ">
              ✕
            </button>
          </div>

          <!-- Circuit Grid Cards -->
          <div style="
            padding: 24px 28px;
            overflow-y: auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
          ">
            ${tracks.map((track) => {
              const isActive = track.id === this.currentTrackId ||
                               (this.currentTrackId === 'canyon-diablo' && track.id === 'desert-canyon') ||
                               (this.currentTrackId === 'grand-prix' && track.id === 'gp-technical');

              const difficultyColor = track.difficulty === 'Technical' ? '#d29922' :
                                      track.difficulty === 'High-Speed' ? '#f85149' :
                                      track.difficulty === 'Expert' ? '#a371f7' : '#3fb950';

              const biomeBadge = track.environmentPreset === 'desert' ? '🏜️ Desert Canyon' :
                                 track.environmentPreset === 'coastal' ? '🌊 Pacific Coast' :
                                 track.environmentPreset === 'grand-prix' ? '🏁 Grand Prix' : '⛰️ Alpine Pass';

              return `
                <div class="circuit-card ${isActive ? 'active' : ''}" data-track-id="${track.id}" style="
                  background: ${isActive ? 'rgba(88, 166, 255, 0.07)' : 'rgba(22, 27, 34, 0.7)'};
                  border: 1px solid ${isActive ? 'rgba(88, 166, 255, 0.6)' : 'rgba(255, 255, 255, 0.1)'};
                  border-radius: 10px;
                  padding: 16px;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  transition: all 0.2s ease;
                  position: relative;
                  cursor: pointer;
                ">
                  <!-- Badges Top Row -->
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <span style="font-size: 11px; font-weight: 700; color: #8b949e; background: rgba(255,255,255,0.06); padding: 3px 7px; border-radius: 4px;">
                        ${biomeBadge}
                      </span>
                      <span style="font-size: 11px; font-weight: 800; color: ${difficultyColor}; border: 1px solid ${difficultyColor}44; background: ${difficultyColor}18; padding: 2px 7px; border-radius: 4px; text-transform: uppercase;">
                        ${track.difficulty || 'Balanced'}
                      </span>
                    </div>

                    <!-- SVG Wireframe Preview -->
                    <div style="
                      background: rgba(10, 14, 20, 0.85);
                      border: 1px solid rgba(255, 255, 255, 0.06);
                      border-radius: 6px;
                      padding: 6px;
                      margin-bottom: 12px;
                    ">
                      ${this.generateTrackSvg(track)}
                    </div>

                    <!-- Track Titles -->
                    <h3 style="font-size: 16px; font-weight: 800; margin: 0 0 4px 0; color: #ffffff;">
                      ${track.name}
                    </h3>
                    <div style="font-size: 12px; color: #58a6ff; font-weight: 600; margin-bottom: 8px;">
                      ${track.tagline || ''}
                    </div>
                    <p style="font-size: 12px; color: #8b949e; line-height: 1.45; margin: 0 0 14px 0;">
                      ${track.description}
                    </p>

                    <!-- Circuit Specs Matrix -->
                    <div style="
                      display: grid;
                      grid-template-columns: 1fr 1fr;
                      gap: 8px;
                      padding: 10px 12px;
                      background: rgba(13, 17, 23, 0.6);
                      border-radius: 6px;
                      border: 1px solid rgba(255, 255, 255, 0.05);
                      margin-bottom: 14px;
                      font-family: monospace;
                      font-size: 11px;
                    ">
                      <div>
                        <span style="color: #8b949e; display: block; font-size: 10px;">LENGTH</span>
                        <strong style="color: #fff;">${track.lengthMeters || 1500}m</strong>
                      </div>
                      <div>
                        <span style="color: #8b949e; display: block; font-size: 10px;">RELIEF</span>
                        <strong style="color: #58a6ff;">${track.elevationRelief || 20}m</strong>
                      </div>
                      <div style="grid-column: span 2;">
                        <span style="color: #8b949e; display: block; font-size: 10px;">RECOMMENDED</span>
                        <span style="color: #3fb950; font-weight: 700; text-transform: uppercase;">
                          ${(track.recommendedVehicles || ['sports']).join(' • ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Select Button -->
                  <button class="btn-select-track" data-track-id="${track.id}" style="
                    width: 100%;
                    padding: 9px 14px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.06em;
                    cursor: pointer;
                    border: ${isActive ? '1px solid #3fb950' : '1px solid rgba(88, 166, 255, 0.4)'};
                    background: ${isActive ? '#238636' : 'rgba(88, 166, 255, 0.12)'};
                    color: #ffffff;
                    text-transform: uppercase;
                    transition: all 0.15s;
                  ">
                    ${isActive ? '✓ ACTIVE CIRCUIT' : 'SELECT CIRCUIT ➔'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Modal Footer with Keyboard Hint -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 28px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(22, 27, 34, 0.4);
            font-size: 12px;
            color: #8b949e;
          ">
            <span>Press <kbd style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #fff;">Esc</kbd> to return</span>
            <span style="font-family: monospace; color: #58a6ff;">Hotkeys: [T] Switch Circuit • [P] Settings • [G] Garage</span>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    const closeBtn = this.overlay.querySelector('#btn-close-track-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    const cards = this.overlay.querySelectorAll<HTMLElement>('.circuit-card');
    cards.forEach((card) => {
      const trackId = card.getAttribute('data-track-id');
      if (!trackId) return;

      card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'rgba(88, 166, 255, 0.8)';
        card.style.transform = 'translateY(-2px)';
      });
      card.addEventListener('mouseleave', () => {
        const isActive = trackId === this.currentTrackId;
        card.style.borderColor = isActive ? 'rgba(88, 166, 255, 0.6)' : 'rgba(255, 255, 255, 0.1)';
        card.style.transform = 'none';
      });

      card.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectTrack(trackId);
      });
    });

    const selectBtns = this.overlay.querySelectorAll<HTMLElement>('.btn-select-track');
    selectBtns.forEach((btn) => {
      const trackId = btn.getAttribute('data-track-id');
      if (!trackId) return;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectTrack(trackId);
      });
    });
  }

  private selectTrack(trackId: string): void {
    this.currentTrackId = trackId;
    this.callbacks.onSelectTrack(trackId);
    this.close();
  }
}

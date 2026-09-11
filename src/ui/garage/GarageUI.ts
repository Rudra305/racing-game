import { VehicleCategory, CATEGORY_INFO } from '../../vehicles/VehicleCategory';
import { VehicleDefinition } from '../../vehicles/VehicleDefinition';
import { VehicleCustomization } from '../../vehicles/VehicleCustomization';
import { VehicleStatsPanel } from './VehicleStatsPanel';
import { CustomizationPanel } from './CustomizationPanel';

export interface GarageUIEvents {
  onCategorySelect: (category: VehicleCategory) => void;
  onVehicleSelect: (vehicleId: string) => void;
  onCompareSelect: (vehicleId: string | null) => void;
  onCustomizationChange: (customization: VehicleCustomization) => void;
  onCustomizationReset: () => void;
  onAutoRotateToggle: () => void;
  onStartRace: () => void;
  onClose: () => void;
}

export class GarageUI {
  private overlay: HTMLElement;
  private events: GarageUIEvents;

  private statsPanel!: VehicleStatsPanel;
  private customizationPanel!: CustomizationPanel;
  public activeTab: 'stats' | 'customize' | 'tech' = 'stats';

  constructor(overlay: HTMLElement, events: GarageUIEvents) {
    this.overlay = overlay;
    this.events = events;
  }

  public renderShell(): void {
    this.overlay.innerHTML = `
      <div class="garage-container">
        <!-- TOP HEADER -->
        <header class="garage-header">
          <div class="garage-brand">
            <span class="brand-badge">PHASE 6</span>
            <span class="brand-title">APEX GARAGE & WORKSHOP</span>
          </div>

          <!-- Category Navigation Tabs -->
          <nav class="category-tabs" id="garage-category-tabs">
            ${Object.values(VehicleCategory).map(cat => `
              <button class="cat-tab" data-category="${cat}">
                ${CATEGORY_INFO[cat].name}
              </button>
            `).join('')}
          </nav>

          <button id="btn-close-garage" class="btn-close" title="Exit Garage (Esc)">
            ✕
          </button>
        </header>

        <!-- MAIN THREE-COLUMN WORKSPACE -->
        <div class="garage-body">
          <!-- LEFT RAIL: Vehicle Roster -->
          <aside class="garage-left-rail">
            <div class="rail-header">
              <span class="rail-title" id="cat-rail-title">CATEGORY ROSTER</span>
              <span class="rail-count" id="cat-vehicle-count">2 CARS</span>
            </div>
            <div class="vehicle-roster-list" id="vehicle-roster-list">
              <!-- Populated dynamically -->
            </div>
            
            <!-- Category Tagline / Info Box -->
            <div class="cat-info-card" id="cat-info-card">
              <!-- Populated dynamically -->
            </div>
          </aside>

          <!-- CENTER VIEWPORT: 3D Turntable Preview -->
          <main class="garage-center-viewport">
            <canvas id="garage-preview-canvas"></canvas>
            <div class="preview-overlay-controls">
              <button id="btn-toggle-autorotate" class="preview-ctrl-btn active">
                ⟳ Turntable [ON]
              </button>
              <div class="preview-hint">Drag to Orbit • Scroll to Zoom</div>
            </div>
          </main>

          <!-- RIGHT RAIL: Stats / Customization / Specs -->
          <aside class="garage-right-rail">
            <!-- Vehicle Identity Card -->
            <div class="selected-car-card">
              <div class="car-badge-row">
                <span class="car-cat-badge" id="car-cat-badge">SPORTS</span>
                <span class="car-diff-badge" id="car-diff-badge">NOVICE</span>
              </div>
              <h2 class="car-title" id="car-title">Apex S1</h2>
              <p class="car-role" id="car-role">Balanced All-Rounder</p>
              <p class="car-desc" id="car-desc"></p>
            </div>

            <!-- Tab Selector -->
            <div class="detail-tabs">
              <button class="detail-tab active" data-tab="stats">STATS & COMPARE</button>
              <button class="detail-tab" data-tab="customize">CUSTOMIZE</button>
              <button class="detail-tab" data-tab="tech">TECH SPECS</button>
            </div>

            <!-- Comparison Selector Bar (visible in stats tab) -->
            <div class="compare-selector-bar" id="compare-selector-bar">
              <span class="compare-label">COMPARE WITH:</span>
              <select id="compare-vehicle-select" class="compare-select">
                <option value="">None (Single Vehicle)</option>
              </select>
            </div>

            <!-- Tab Content Container -->
            <div class="detail-content-body" id="detail-content-body">
              <div id="stats-panel-container"></div>
              <div id="customize-panel-container" style="display: none;"></div>
              <div id="tech-specs-container" style="display: none;"></div>
            </div>
          </aside>
        </div>

        <!-- BOTTOM ACTION FOOTER -->
        <footer class="garage-footer">
          <div class="footer-keyhints">
            <span class="hint-item"><kbd>←</kbd> <kbd>→</kbd> Category</span>
            <span class="hint-item"><kbd>↑</kbd> <kbd>↓</kbd> Vehicle</span>
            <span class="hint-item"><kbd>Enter</kbd> Race</span>
            <span class="hint-item"><kbd>Esc</kbd> Exit</span>
          </div>

          <button id="btn-start-race" class="btn-primary-race">
            🏎️ START RACE [ENTER] ➔
          </button>
        </footer>
      </div>
    `;

    // Initialize sub-panels
    const statsContainer = this.overlay.querySelector<HTMLElement>('#stats-panel-container')!;
    this.statsPanel = new VehicleStatsPanel(statsContainer);

    const customContainer = this.overlay.querySelector<HTMLElement>('#customize-panel-container')!;
    this.customizationPanel = new CustomizationPanel(
      customContainer,
      (cust) => this.events.onCustomizationChange(cust),
      () => this.events.onCustomizationReset()
    );

    this.bindStaticEvents();
  }

  private bindStaticEvents(): void {
    // Close button
    const closeBtn = this.overlay.querySelector<HTMLButtonElement>('#btn-close-garage');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.events.onClose());
    }

    // Start race button
    const raceBtn = this.overlay.querySelector<HTMLButtonElement>('#btn-start-race');
    if (raceBtn) {
      raceBtn.addEventListener('click', () => this.events.onStartRace());
    }

    // Turntable toggle
    const rotateBtn = this.overlay.querySelector<HTMLButtonElement>('#btn-toggle-autorotate');
    if (rotateBtn) {
      rotateBtn.addEventListener('click', () => {
        this.events.onAutoRotateToggle();
      });
    }

    // Category tabs
    const catTabs = this.overlay.querySelectorAll<HTMLButtonElement>('.cat-tab');
    catTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const cat = tab.dataset.category as VehicleCategory;
        if (cat) this.events.onCategorySelect(cat);
      });
    });

    // Detail tabs (Stats vs Customize vs Tech)
    const detailTabs = this.overlay.querySelectorAll<HTMLButtonElement>('.detail-tab');
    detailTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        detailTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const targetTab = tab.dataset.tab as 'stats' | 'customize' | 'tech';
        this.switchTab(targetTab);
      });
    });

    // Compare select
    const compareSelect = this.overlay.querySelector<HTMLSelectElement>('#compare-vehicle-select');
    if (compareSelect) {
      compareSelect.addEventListener('change', () => {
        const val = compareSelect.value || null;
        this.events.onCompareSelect(val);
      });
    }
  }

  public updateCategoryNav(selectedCategory: VehicleCategory): void {
    const catTabs = this.overlay.querySelectorAll<HTMLButtonElement>('.cat-tab');
    catTabs.forEach(tab => {
      if (tab.dataset.category === selectedCategory) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update left rail category info
    const info = CATEGORY_INFO[selectedCategory];
    const infoCard = this.overlay.querySelector<HTMLElement>('#cat-info-card');
    if (infoCard && info) {
      infoCard.innerHTML = `
        <div class="cat-info-badge" style="background-color: ${info.badgeColor}22; border-color: ${info.badgeColor}; color: ${info.badgeColor};">
          ${info.name.toUpperCase()} CLASS
        </div>
        <div class="cat-info-tagline">${info.tagline}</div>
        <p class="cat-info-desc">${info.description}</p>
      `;
    }
  }

  public updateVehicleRoster(
    vehicles: VehicleDefinition[],
    selectedVehicleId: string
  ): void {
    const list = this.overlay.querySelector<HTMLElement>('#vehicle-roster-list');
    const count = this.overlay.querySelector<HTMLElement>('#cat-vehicle-count');
    if (count) count.textContent = `${vehicles.length} CARS`;
    if (!list) return;

    list.innerHTML = vehicles.map(v => {
      const isSelected = v.id === selectedVehicleId;
      return `
        <button class="roster-card ${isSelected ? 'selected' : ''}" data-vehicle-id="${v.id}">
          <div class="roster-card-header">
            <span class="roster-name">${v.name}</span>
            <span class="roster-role">${v.meta.role}</span>
          </div>
          <div class="roster-card-footer">
            <span class="roster-badge unlocked">✓ UNLOCKED</span>
            <span class="roster-drivetrain">${v.config.transmission.driveType} • ${Math.round(v.config.engine.power)} HP</span>
          </div>
        </button>
      `;
    }).join('');

    // Bind click events
    list.querySelectorAll<HTMLButtonElement>('.roster-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.vehicleId;
        if (id) this.events.onVehicleSelect(id);
      });
    });
  }

  public updateCompareDropdown(allVehicles: VehicleDefinition[], currentVehicleId: string, compareVehicleId: string | null): void {
    const select = this.overlay.querySelector<HTMLSelectElement>('#compare-vehicle-select');
    if (!select) return;

    let html = `<option value="">None (Single Vehicle)</option>`;
    for (const v of allVehicles) {
      if (v.id === currentVehicleId) continue;
      const isSel = v.id === compareVehicleId ? 'selected' : '';
      html += `<option value="${v.id}" ${isSel}>${v.name} (${CATEGORY_INFO[v.category].name})</option>`;
    }
    select.innerHTML = html;
  }

  public updateSelectedVehicle(
    def: VehicleDefinition,
    compareDef: VehicleDefinition | null,
    customization: VehicleCustomization
  ): void {
    // Identity card
    const titleEl = this.overlay.querySelector('#car-title');
    const roleEl = this.overlay.querySelector('#car-role');
    const descEl = this.overlay.querySelector('#car-desc');
    const catBadgeEl = this.overlay.querySelector('#car-cat-badge');
    const diffBadgeEl = this.overlay.querySelector('#car-diff-badge');

    if (titleEl) titleEl.textContent = def.name;
    if (roleEl) roleEl.textContent = def.meta.role;
    if (descEl) descEl.textContent = def.meta.description;
    if (catBadgeEl) {
      catBadgeEl.textContent = CATEGORY_INFO[def.category].name.toUpperCase();
      (catBadgeEl as HTMLElement).style.borderColor = CATEGORY_INFO[def.category].badgeColor;
      (catBadgeEl as HTMLElement).style.color = CATEGORY_INFO[def.category].badgeColor;
    }
    if (diffBadgeEl) diffBadgeEl.textContent = `${def.meta.difficulty.toUpperCase()} DRIVER`;

    // Render stats
    this.statsPanel.render(def, compareDef);

    // Render customization
    this.customizationPanel.render(customization);

    // Render tech specs
    this.renderTechSpecs(def);
  }

  private renderTechSpecs(def: VehicleDefinition): void {
    const container = this.overlay.querySelector<HTMLElement>('#tech-specs-container');
    if (!container) return;

    const cfg = def.config;
    container.innerHTML = `
      <div class="tech-specs-card">
        <div class="tech-title">ENGINEERING SPECIFICATIONS</div>
        <div class="tech-grid">
          <div class="tech-item"><span class="tech-k">MASS</span><span class="tech-v">${cfg.mass} kg</span></div>
          <div class="tech-item"><span class="tech-k">PEAK POWER</span><span class="tech-v">${Math.round(cfg.engine.power)} HP</span></div>
          <div class="tech-item"><span class="tech-k">PEAK TORQUE</span><span class="tech-v">${cfg.engine.peakTorque} Nm</span></div>
          <div class="tech-item"><span class="tech-k">REDLINE</span><span class="tech-v">${cfg.engine.redlineRPM} RPM</span></div>
          <div class="tech-item"><span class="tech-k">DRIVETRAIN</span><span class="tech-v">${cfg.transmission.driveType} (${cfg.transmission.gears}-SPD)</span></div>
          <div class="tech-item"><span class="tech-k">DOWNFORCE (CD/CL)</span><span class="tech-v">${cfg.aerodynamics.dragCoefficient.toFixed(2)} / ${cfg.aerodynamics.downforceCoefficient.toFixed(2)}</span></div>
          <div class="tech-item"><span class="tech-k">WHEELBASE</span><span class="tech-v">${cfg.dimensions.wheelBase} m</span></div>
          <div class="tech-item"><span class="tech-k">SUSPENSION TRAVEL</span><span class="tech-v">${Math.round(cfg.suspension.maxTravel * 100)} cm</span></div>
        </div>
      </div>
    `;
  }

  public switchTab(tab: 'stats' | 'customize' | 'tech'): void {
    this.activeTab = tab;
    const statsEl = this.overlay.querySelector<HTMLElement>('#stats-panel-container');
    const customEl = this.overlay.querySelector<HTMLElement>('#customize-panel-container');
    const techEl = this.overlay.querySelector<HTMLElement>('#tech-specs-container');
    const compareBar = this.overlay.querySelector<HTMLElement>('#compare-selector-bar');

    if (statsEl) statsEl.style.display = tab === 'stats' ? 'block' : 'none';
    if (customEl) customEl.style.display = tab === 'customize' ? 'block' : 'none';
    if (techEl) techEl.style.display = tab === 'tech' ? 'block' : 'none';
    if (compareBar) compareBar.style.display = tab === 'stats' ? 'flex' : 'none';
  }

  public updateAutoRotateBtn(active: boolean): void {
    const btn = this.overlay.querySelector<HTMLButtonElement>('#btn-toggle-autorotate');
    if (btn) {
      btn.textContent = active ? '⟳ Turntable [ON]' : '⏸ Turntable [PAUSED]';
      if (active) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  }

  public show(): void {
    this.overlay.style.display = 'flex';
  }

  public hide(): void {
    this.overlay.style.display = 'none';
  }
}

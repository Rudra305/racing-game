import { VehicleCustomization } from '../../vehicles/VehicleCustomization';
import { VehicleCustomizationCapabilities } from '../../vehicles/VehicleDefinition';

const COLOR_SWATCHES = {
  primary: [
    { label: 'Guards Red', hex: 0xd73a49 },
    { label: 'Speed Yellow', hex: 0xd29922 },
    { label: 'Apex Blue', hex: 0x1f6feb },
    { label: 'Emerald Green', hex: 0x238636 },
    { label: 'Stealth Onyx', hex: 0x161b22 },
    { label: 'Glacier White', hex: 0xf0f6fc },
    { label: 'Amethyst Violet', hex: 0x8957e5 },
    { label: 'Tangerine Orange', hex: 0xf0883e }
  ],
  secondary: [
    { label: 'Smoked Onyx', hex: 0x090d13 },
    { label: 'Carbon Gray', hex: 0x161b22 },
    { label: 'Pure White', hex: 0xf0f6fc },
    { label: 'Titanium Slate', hex: 0x30363d }
  ],
  accent: [
    { label: 'Cyan Electric', hex: 0x58a6ff },
    { label: 'Hyperion Gold', hex: 0xe3b341 },
    { label: 'Brembo Crimson', hex: 0xf85149 },
    { label: 'Acid Lime', hex: 0x3fb950 },
    { label: 'Ghost Silver', hex: 0xc9d1d9 }
  ],
  wheel: [
    { label: 'Fuchs Silver / Polish', hex: 0xc9d1d9 },
    { label: 'Satin Black', hex: 0x161b22 },
    { label: 'Hyperion Gold', hex: 0xd29922 },
    { label: 'Bronze Titanium', hex: 0x7d6f56 },
    { label: 'Pure White', hex: 0xf0f6fc }
  ]
};

export class CustomizationPanel {
  private container: HTMLElement;
  private currentCustomization!: VehicleCustomization;
  private currentCapabilities: VehicleCustomizationCapabilities = { primaryColor: true, wheelColor: true };
  private carName: string = 'Vehicle';
  private onChangeCallback: (cust: VehicleCustomization) => void;
  private onResetCallback: () => void;

  constructor(
    container: HTMLElement,
    onChange: (cust: VehicleCustomization) => void,
    onReset: () => void
  ) {
    this.container = container;
    this.onChangeCallback = onChange;
    this.onResetCallback = onReset;
  }

  public render(
    customization: VehicleCustomization,
    capabilities?: VehicleCustomizationCapabilities | boolean,
    carName: string = 'Vehicle'
  ): void {
    this.currentCustomization = { ...customization };
    this.carName = carName;

    // Normalize capabilities
    if (typeof capabilities === 'boolean') {
      this.currentCapabilities = capabilities
        ? { primaryColor: true, secondaryColor: true, accentColor: true, wheelColor: true }
        : { primaryColor: true, wheelColor: true };
    } else if (capabilities) {
      this.currentCapabilities = capabilities;
    } else {
      this.currentCapabilities = { primaryColor: true, wheelColor: true };
    }

    const caps = this.currentCapabilities;
    const toHexStr = (n: number) => '#' + n.toString(16).padStart(6, '0');

    // Count active channels for user transparency
    const activeChannels = [
      caps.primaryColor !== false ? 'Body Paint' : null,
      caps.secondaryColor ? 'Roof / Canopy' : null,
      caps.accentColor ? 'Calipers & Aero' : null,
      caps.wheelColor !== false ? 'Wheels / Rims' : null
    ].filter(Boolean);

    let html = `
      <div class="custom-card">
        <div class="custom-note" style="padding: 6px 10px; font-size: 11px; color: #58a6ff; border-left: 2px solid #58a6ff; margin-bottom: 12px; background: rgba(88,166,255,0.06);">
          Showing ${activeChannels.length} factory customization channel${activeChannels.length > 1 ? 's' : ''} for <strong>${this.carName}</strong>: ${activeChannels.join(', ')}.
        </div>
    `;

    // 1. Primary Paint (Body)
    if (caps.primaryColor !== false) {
      html += `
        <div class="custom-group">
          <div class="custom-group-header">
            <span class="custom-label">PRIMARY BODY PAINT</span>
            <input type="color" id="picker-primary" class="color-picker-input" value="${toHexStr(customization.primaryColor)}" title="Custom color" />
          </div>
          <div class="swatch-grid">
            ${COLOR_SWATCHES.primary.map(s => `
              <button class="swatch-btn ${customization.primaryColor === s.hex ? 'active' : ''}" 
                      style="background-color: ${toHexStr(s.hex)};" 
                      data-target="primary" 
                      data-hex="${s.hex}" 
                      title="${s.label}">
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 2. Secondary Paint (Cabin / Canopy / Carbon Aero / Splitter)
    if (caps.secondaryColor) {
      html += `
        <div class="custom-group">
          <div class="custom-group-header">
            <span class="custom-label">CABIN / CANOPY / ROOF</span>
            <input type="color" id="picker-secondary" class="color-picker-input" value="${toHexStr(customization.secondaryColor)}" title="Custom color" />
          </div>
          <div class="swatch-grid">
            ${COLOR_SWATCHES.secondary.map(s => `
              <button class="swatch-btn ${customization.secondaryColor === s.hex ? 'active' : ''}" 
                      style="background-color: ${toHexStr(s.hex)};" 
                      data-target="secondary" 
                      data-hex="${s.hex}" 
                      title="${s.label}">
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 3. Accent Paint (Brake Calipers & Aero Blades)
    if (caps.accentColor) {
      html += `
        <div class="custom-group">
          <div class="custom-group-header">
            <span class="custom-label">AERODYNAMIC & CALIPER ACCENT</span>
            <input type="color" id="picker-accent" class="color-picker-input" value="${toHexStr(customization.accentColor)}" title="Custom color" />
          </div>
          <div class="swatch-grid">
            ${COLOR_SWATCHES.accent.map(s => `
              <button class="swatch-btn ${customization.accentColor === s.hex ? 'active' : ''}" 
                      style="background-color: ${toHexStr(s.hex)};" 
                      data-target="accent" 
                      data-hex="${s.hex}" 
                      title="${s.label}">
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 4. Wheel & Rim Finish
    if (caps.wheelColor !== false) {
      html += `
        <div class="custom-group">
          <div class="custom-group-header">
            <span class="custom-label">WHEELS & RIMS FINISH</span>
            <input type="color" id="picker-wheel" class="color-picker-input" value="${toHexStr(customization.wheelColor)}" title="Custom color" />
          </div>
          <div class="swatch-grid">
            ${COLOR_SWATCHES.wheel.map(s => `
              <button class="swatch-btn ${customization.wheelColor === s.hex ? 'active' : ''}" 
                      style="background-color: ${toHexStr(s.hex)};" 
                      data-target="wheel" 
                      data-hex="${s.hex}" 
                      title="${s.label}">
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    html += `
        <!-- Reset Button -->
        <div class="custom-actions" style="margin-top: 14px;">
          <button id="btn-reset-customization" class="btn-secondary-reset">
            ↺ Restore Factory Defaults
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.bindEvents();
  }

  private bindEvents(): void {
    // Swatch buttons
    const swatches = this.container.querySelectorAll<HTMLButtonElement>('.swatch-btn');
    swatches.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = btn.dataset.target;
        const hex = parseInt(btn.dataset.hex || '0', 10);
        if (target === 'primary') this.currentCustomization.primaryColor = hex;
        else if (target === 'secondary') this.currentCustomization.secondaryColor = hex;
        else if (target === 'accent') this.currentCustomization.accentColor = hex;
        else if (target === 'wheel') this.currentCustomization.wheelColor = hex;

        this.onChangeCallback(this.currentCustomization);
        this.render(this.currentCustomization, this.currentCapabilities, this.carName);
      });
    });

    // Native color pickers
    const bindPicker = (id: string, targetKey: 'primaryColor' | 'secondaryColor' | 'accentColor' | 'wheelColor') => {
      const picker = this.container.querySelector<HTMLInputElement>(id);
      if (!picker) return;
      picker.addEventListener('input', () => {
        const hex = parseInt(picker.value.replace('#', ''), 16);
        this.currentCustomization[targetKey] = hex;
        this.onChangeCallback(this.currentCustomization);
      });
      picker.addEventListener('change', () => {
        this.render(this.currentCustomization, this.currentCapabilities, this.carName);
      });
    };

    bindPicker('#picker-primary', 'primaryColor');
    bindPicker('#picker-secondary', 'secondaryColor');
    bindPicker('#picker-accent', 'accentColor');
    bindPicker('#picker-wheel', 'wheelColor');

    // Reset button
    const resetBtn = this.container.querySelector<HTMLButtonElement>('#btn-reset-customization');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onResetCallback();
      });
    }
  }
}

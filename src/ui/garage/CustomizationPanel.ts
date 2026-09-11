import { VehicleCustomization, WheelStyleId } from '../../vehicles/VehicleCustomization';

const COLOR_SWATCHES = {
  primary: [
    { label: 'Apex Blue', hex: 0x1f6feb },
    { label: 'Crimson Red', hex: 0xd73a49 },
    { label: 'Speed Yellow', hex: 0xd29922 },
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
    { label: 'Neon Crimson', hex: 0xf85149 },
    { label: 'Acid Lime', hex: 0x3fb950 },
    { label: 'Ghost Silver', hex: 0xc9d1d9 }
  ],
  rim: [
    { label: 'Silver Alloy', hex: 0xc9d1d9 },
    { label: 'Gloss Black', hex: 0x161b22 },
    { label: 'Race Bronze', hex: 0x9a6700 },
    { label: 'Gold Metallic', hex: 0xe3b341 },
    { label: 'Arctic White', hex: 0xf0f6fc }
  ]
};

const WHEEL_STYLES: { id: WheelStyleId; label: string; desc: string }[] = [
  { id: 'sport_mesh', label: 'Sport Mesh', desc: 'Lightweight multi-spoke alloy' },
  { id: 'turbofan', label: 'Aero Turbofan', desc: 'High-downforce brake cooling disc' },
  { id: 'offroad_beadlock', label: 'Offroad Beadlock', desc: 'Deep-dish beadlock outer rim' },
  { id: 'formula_monoblock', label: 'Monoblock Center-Lock', desc: 'Pure racing center-nut forged wheel' }
];

export class CustomizationPanel {
  private container: HTMLElement;
  private currentCustomization!: VehicleCustomization;
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

  public render(customization: VehicleCustomization): void {
    this.currentCustomization = { ...customization };

    const toHexStr = (n: number) => '#' + n.toString(16).padStart(6, '0');

    this.container.innerHTML = `
      <div class="custom-card">
        <!-- 1. Primary Paint -->
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

        <!-- 2. Secondary Paint -->
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

        <!-- 3. Accent Paint -->
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

        <!-- 4. Wheel Rim Style -->
        <div class="custom-group">
          <span class="custom-label">WHEEL RIM ARCHITECTURE</span>
          <div class="wheel-style-grid">
            ${WHEEL_STYLES.map(w => `
              <button class="wheel-style-btn ${customization.wheelStyle === w.id ? 'active' : ''}" data-style="${w.id}">
                <div class="wheel-style-name">${w.label}</div>
                <div class="wheel-style-desc">${w.desc}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 5. Wheel Rim Paint -->
        <div class="custom-group">
          <div class="custom-group-header">
            <span class="custom-label">WHEEL FINISH</span>
            <input type="color" id="picker-rim" class="color-picker-input" value="${toHexStr(customization.wheelColor)}" title="Custom color" />
          </div>
          <div class="swatch-grid">
            ${COLOR_SWATCHES.rim.map(s => `
              <button class="swatch-btn ${customization.wheelColor === s.hex ? 'active' : ''}" 
                      style="background-color: ${toHexStr(s.hex)};" 
                      data-target="rim" 
                      data-hex="${s.hex}" 
                      title="${s.label}">
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Reset Button -->
        <div class="custom-actions">
          <button id="btn-reset-customization" class="btn-secondary-reset">
            ↺ Restore Factory Defaults
          </button>
        </div>
      </div>
    `;

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
        else if (target === 'rim') this.currentCustomization.wheelColor = hex;

        this.onChangeCallback(this.currentCustomization);
        this.render(this.currentCustomization);
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
        this.render(this.currentCustomization);
      });
    };

    bindPicker('#picker-primary', 'primaryColor');
    bindPicker('#picker-secondary', 'secondaryColor');
    bindPicker('#picker-accent', 'accentColor');
    bindPicker('#picker-rim', 'wheelColor');

    // Wheel style buttons
    const wheelBtns = this.container.querySelectorAll<HTMLButtonElement>('.wheel-style-btn');
    wheelBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const style = btn.dataset.style as WheelStyleId;
        if (style) {
          this.currentCustomization.wheelStyle = style;
          this.onChangeCallback(this.currentCustomization);
          this.render(this.currentCustomization);
        }
      });
    });

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

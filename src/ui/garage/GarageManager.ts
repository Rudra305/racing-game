import { VehicleCategory } from '../../vehicles/VehicleCategory';
import { VehicleRegistry } from '../../vehicles/VehicleRegistry';
import { VehicleDefinition } from '../../vehicles/VehicleDefinition';
import { VehicleCustomization, loadGarageSaveData, saveGarageSaveData } from '../../vehicles/VehicleCustomization';
import { GarageState } from './GarageState';
import { GarageUI } from './GarageUI';
import { VehiclePreview } from './VehiclePreview';

export interface GarageManagerCallbacks {
  onStartRace: (def: VehicleDefinition, customization: VehicleCustomization) => void;
  onSelectTrack?: () => void;
  onClose: () => void;
}

export class GarageManager {
  private state: GarageState;
  private ui: GarageUI;
  private preview: VehiclePreview;
  private callbacks: GarageManagerCallbacks;
  public isOpen: boolean = false;

  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(overlayElement: HTMLElement, callbacks: GarageManagerCallbacks) {
    this.callbacks = callbacks;
    VehicleRegistry.initialize();

    // 1. Load persisted selection & customizations
    const saved = loadGarageSaveData();

    // Verify saved vehicle exists
    let initialDef = VehicleRegistry.get(saved.selectedVehicleId);
    if (!initialDef) {
      initialDef = VehicleRegistry.getOrThrow('sports_apex_s1');
    }

    this.state = {
      selectedCategory: initialDef.category,
      selectedVehicleId: initialDef.id,
      compareVehicleId: null,
      isAutoRotating: true,
      activeTab: 'stats',
      customizations: saved.customizations || {}
    };

    // 2. Initialize UI
    this.ui = new GarageUI(overlayElement, {
      onCategorySelect: (cat) => this.selectCategory(cat),
      onVehicleSelect: (id) => this.selectVehicle(id),
      onCompareSelect: (id) => this.selectCompareVehicle(id),
      onCustomizationChange: (cust) => this.updateCustomization(cust),
      onCustomizationReset: () => this.resetCustomization(),
      onAutoRotateToggle: () => this.toggleAutoRotate(),
      onSelectTrack: () => {
        if (this.callbacks.onSelectTrack) {
          this.callbacks.onSelectTrack();
        }
      },
      onStartRace: () => this.startRace(),
      onClose: () => this.close()
    });
    this.ui.renderShell();

    // 3. Initialize 3D Preview Subsystem
    const canvas = overlayElement.querySelector<HTMLCanvasElement>('#garage-preview-canvas')!;
    this.preview = new VehiclePreview(canvas);

    // 4. Keyboard Navigation
    this.boundKeyDown = this.onKeyDown.bind(this);

    // Initial sync
    this.syncUI();
  }

  public open(): void {
    if (this.isOpen) return;
    this.isOpen = true;

    this.ui.show();
    this.preview.activate();
    
    // Load selected vehicle into preview
    const currentDef = VehicleRegistry.getOrThrow(this.state.selectedVehicleId);
    const cust = this.getActiveCustomization(currentDef);
    this.preview.loadVehicle(currentDef, cust);
    this.preview.onResize();

    this.syncUI();

    window.addEventListener('keydown', this.boundKeyDown);
  }

  public close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;

    window.removeEventListener('keydown', this.boundKeyDown);
    this.preview.deactivate();
    this.ui.hide();
    this.callbacks.onClose();
  }

  public selectCategory(cat: VehicleCategory): void {
    this.state.selectedCategory = cat;
    const categoryCars = VehicleRegistry.getByCategory(cat);

    // If currently selected car is not in this category, select first car of new category
    const currentDef = VehicleRegistry.get(this.state.selectedVehicleId);
    if (!currentDef || currentDef.category !== cat) {
      if (categoryCars.length > 0) {
        this.selectVehicle(categoryCars[0].id);
        return;
      }
    }

    this.syncUI();
  }

  public selectVehicle(vehicleId: string): void {
    const def = VehicleRegistry.get(vehicleId);
    if (!def) return;

    this.state.selectedVehicleId = def.id;
    this.state.selectedCategory = def.category;

    // Persist
    this.save();

    // Load into 3D Preview
    const cust = this.getActiveCustomization(def);
    this.preview.loadVehicle(def, cust);

    this.syncUI();
  }

  public selectCompareVehicle(vehicleId: string | null): void {
    this.state.compareVehicleId = vehicleId;
    this.syncUI();
  }

  public updateCustomization(customization: VehicleCustomization): void {
    this.state.customizations[this.state.selectedVehicleId] = { ...customization };
    this.preview.updateCustomization(customization);
    this.save();
  }

  public resetCustomization(): void {
    const def = VehicleRegistry.getOrThrow(this.state.selectedVehicleId);
    delete this.state.customizations[this.state.selectedVehicleId];
    this.save();

    const cust = { ...def.visuals.defaultColors };
    this.preview.updateCustomization(cust);
    this.syncUI();
  }

  public toggleAutoRotate(): void {
    this.state.isAutoRotating = this.preview.toggleAutoRotate();
    this.ui.updateAutoRotateBtn(this.state.isAutoRotating);
  }

  public startRace(): void {
    const def = VehicleRegistry.getOrThrow(this.state.selectedVehicleId);
    const cust = this.getActiveCustomization(def);
    this.close();
    this.callbacks.onStartRace(def, cust);
  }

  public getSelectedVehicle(): { definition: VehicleDefinition; customization: VehicleCustomization } {
    const def = VehicleRegistry.getOrThrow(this.state.selectedVehicleId);
    const cust = this.getActiveCustomization(def);
    return { definition: def, customization: cust };
  }

  private getActiveCustomization(def: VehicleDefinition): VehicleCustomization {
    const stored = this.state.customizations[def.id];
    if (stored) return { ...stored };
    return { ...def.visuals.defaultColors };
  }

  private syncUI(): void {
    const currentDef = VehicleRegistry.getOrThrow(this.state.selectedVehicleId);
    const compareDef = this.state.compareVehicleId ? VehicleRegistry.get(this.state.compareVehicleId) || null : null;
    const cust = this.getActiveCustomization(currentDef);

    const categoryCars = VehicleRegistry.getByCategory(this.state.selectedCategory);
    const allCars = VehicleRegistry.getAll();

    this.ui.updateCategoryNav(this.state.selectedCategory);
    this.ui.updateVehicleRoster(categoryCars, this.state.selectedVehicleId);
    this.ui.updateCompareDropdown(allCars, this.state.selectedVehicleId, this.state.compareVehicleId);
    this.ui.updateSelectedVehicle(currentDef, compareDef, cust);
    this.ui.updateAutoRotateBtn(this.state.isAutoRotating);
  }

  private save(): void {
    saveGarageSaveData({
      version: 1,
      selectedVehicleId: this.state.selectedVehicleId,
      selectedCategory: this.state.selectedCategory,
      customizations: this.state.customizations
    });
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (!this.isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      this.startRace();
      return;
    }

    if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      if (this.callbacks.onSelectTrack) {
        this.callbacks.onSelectTrack();
      }
      return;
    }

    const categories = VehicleRegistry.getCategories();
    const currentCatIdx = categories.indexOf(this.state.selectedCategory);

    // Left/Right: switch category
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (currentCatIdx - 1 + categories.length) % categories.length;
      this.selectCategory(categories[prevIdx]);
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (currentCatIdx + 1) % categories.length;
      this.selectCategory(categories[nextIdx]);
      return;
    }

    // Up/Down: switch vehicle in category
    const categoryCars = VehicleRegistry.getByCategory(this.state.selectedCategory);
    const currentCarIdx = categoryCars.findIndex(c => c.id === this.state.selectedVehicleId);

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (categoryCars.length > 0) {
        const prevIdx = (currentCarIdx - 1 + categoryCars.length) % categoryCars.length;
        this.selectVehicle(categoryCars[prevIdx].id);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (categoryCars.length > 0) {
        const nextIdx = (currentCarIdx + 1) % categoryCars.length;
        this.selectVehicle(categoryCars[nextIdx].id);
      }
      return;
    }
  }

  public dispose(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    this.preview.dispose();
  }
}

import { VehicleCategory } from '../../vehicles/VehicleCategory';
import { VehicleCustomization } from '../../vehicles/VehicleCustomization';

export interface GarageState {
  selectedCategory: VehicleCategory;
  selectedVehicleId: string;
  compareVehicleId: string | null;
  isAutoRotating: boolean;
  activeTab: 'stats' | 'customize' | 'tech';
  customizations: Record<string, VehicleCustomization>;
}

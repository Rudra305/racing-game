import { InputManager } from '../input/InputManager';
import { VehiclePhysics } from '../physics/VehiclePhysics';

export class VehicleController {
  private inputManager: InputManager;
  private vehiclePhysics: VehiclePhysics;
  private isEnabled: boolean = true;

  constructor(inputManager: InputManager, vehiclePhysics: VehiclePhysics) {
    this.inputManager = inputManager;
    this.vehiclePhysics = vehiclePhysics;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.vehiclePhysics.setInputs(0, 0, 0, false);
    }
  }

  public update(): void {
    if (!this.isEnabled) {
      this.vehiclePhysics.setInputs(0, 0, 0, false);
      return;
    }

    const actions = this.inputManager.getActions();

    let throttle = 0;
    let brake = 0;
    let steer = 0;

    if (actions.accelerate) throttle += 1.0;
    if (actions.brake) brake += 1.0;
    if (actions.steerLeft) steer += 1.0;  // Steer left (A / Left Arrow)
    if (actions.steerRight) steer -= 1.0; // Steer right (D / Right Arrow)

    this.vehiclePhysics.setInputs(throttle, brake, steer, actions.handbrake);
  }
}

import * as THREE from 'three';
import { Vehicle } from '../../vehicles/Vehicle';
import { VehiclePhysics } from '../../physics/VehiclePhysics';
import { VehicleConfig, DEFAULT_VEHICLE_CONFIG } from '../../vehicles/VehicleConfig';
import { AIController } from './AIController';
import { LapManager } from '../race/LapManager';
import { CheckpointManager } from '../race/CheckpointManager';
import { Checkpoint } from '../../tracks/Checkpoint';

export interface AIDriverProfile {
  id: string;
  name: string;
  color: number;
  lineOffset: number; // -1.0 (left bias) to +1.0 (right bias)
}

export class AIOpponent {
  public readonly id: string;
  public readonly name: string;
  public readonly vehicle: Vehicle;
  public readonly physics: VehiclePhysics;
  public readonly controller: AIController;
  public readonly lapManager: LapManager;
  public readonly checkpointManager: CheckpointManager;

  public closestSampleIndex: number = 0;

  constructor(
    profile: AIDriverProfile,
    checkpoints: Checkpoint[],
    totalLaps: number = 3,
    config: VehicleConfig = DEFAULT_VEHICLE_CONFIG
  ) {
    this.id = profile.id;
    this.name = profile.name;

    // Visual Vehicle with distinct color
    this.vehicle = new Vehicle(config, profile.color);

    // Physical Simulation
    this.physics = new VehiclePhysics(config);

    // AI Decision Controller
    this.controller = new AIController(profile.lineOffset);

    // Race Progress Trackers
    this.lapManager = new LapManager(totalLaps);
    this.checkpointManager = new CheckpointManager(checkpoints);
  }

  public setSpawn(position: THREE.Vector3, heading: number): void {
    this.physics.setSpawn(position, heading);
    this.vehicle.syncWithPhysics(this.physics);
    this.controller.reset();
    this.lapManager.reset();
    this.checkpointManager.reset();
  }

  public sync(): void {
    this.vehicle.syncWithPhysics(this.physics);
  }

  public dispose(): void {
    // Disposal hook
  }
}

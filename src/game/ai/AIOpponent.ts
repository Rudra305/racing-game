import * as THREE from 'three';
import { Vehicle } from '../../vehicles/Vehicle';
import { VehiclePhysics } from '../../physics/VehiclePhysics';
import { VehicleDefinition } from '../../vehicles/VehicleDefinition';
import { VehicleRegistry } from '../../vehicles/VehicleRegistry';
import { AIController } from './AIController';
import { LapManager } from '../race/LapManager';
import { CheckpointManager } from '../race/CheckpointManager';
import { Checkpoint } from '../../tracks/Checkpoint';

export interface AIDriverProfile {
  id: string;
  name: string;
  color: number;
  lineOffset: number; // -1.0 (left bias) to +1.0 (right bias)
  preferredVehicleId?: string;
}

export class AIOpponent {
  public readonly id: string;
  public readonly name: string;
  public readonly definition: VehicleDefinition;
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
    definition?: VehicleDefinition
  ) {
    this.id = profile.id;
    this.name = profile.name;

    // Use assigned definition or look up in registry
    if (definition) {
      this.definition = definition;
    } else if (profile.preferredVehicleId) {
      this.definition = VehicleRegistry.getOrThrow(profile.preferredVehicleId);
    } else {
      this.definition = VehicleRegistry.getOrThrow('sports_apex_s1');
    }

    // Visual Vehicle with distinct livery color (ultra-lightweight procedural model for AI compute preservation)
    this.vehicle = new Vehicle(this.definition, profile.color, false);

    // Physical Simulation using the canonical vehicle configuration
    this.physics = new VehiclePhysics(this.definition.config);

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
    this.vehicle.dispose();
  }
}

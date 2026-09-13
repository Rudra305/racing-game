import * as THREE from 'three';
import { AIOpponent, AIDriverProfile } from './AIOpponent';
import { AIRacingLine } from './AIRacingLine';
import { AIDifficultyLevel } from '../race/RaceConfig';
import { AI_DIFFICULTY_PROFILES, AIDifficultyProfile } from './AIDifficulty';
import { Track } from '../../tracks/Track';
import { StartGrid } from '../../tracks/StartGrid';
import { NearbyVehicleInfo } from './AICollisionAvoidance';
import { PositionManager } from '../race/PositionManager';
import { VehicleRegistry } from '../../vehicles/VehicleRegistry';

const DEFAULT_AI_ROSTER: AIDriverProfile[] = [
  { id: 'ai-1', name: 'Marco Rossi', color: 0xd62828, lineOffset: -0.2 },
  { id: 'ai-2', name: 'Elena Vance', color: 0xf77f00, lineOffset: 0.15 },
  { id: 'ai-3', name: 'Takeshi Sato', color: 0x2a9d8f, lineOffset: -0.1 },
  { id: 'ai-4', name: 'Lucas Dubois', color: 0x7209b7, lineOffset: 0.25 },
  { id: 'ai-5', name: 'Sophie Müller', color: 0x4cc9f0, lineOffset: -0.3 },
  { id: 'ai-6', name: 'Carlos Mendez', color: 0xe76f51, lineOffset: 0.05 },
  { id: 'ai-7', name: 'Aria Lindqvist', color: 0xe0e1dd, lineOffset: -0.15 },
  { id: 'ai-8', name: 'Viktor Novak', color: 0xb5179e, lineOffset: 0.3 }
];

export class AISystem {
  public opponents: AIOpponent[] = [];
  public racingLine: AIRacingLine;
  public difficulty: AIDifficultyLevel = AIDifficultyLevel.NORMAL;

  private track: Track;
  private isEnabled: boolean = false;
  private decisionTimer: number = 0;
  private readonly decisionInterval: number = 0.06; // ~16.6 Hz AI decision rate (separate from 60 Hz physics)
  private readonly _allVehicles: NearbyVehicleInfo[] = [];

  constructor(
    track: Track,
    aiCount: number = 5,
    difficulty: AIDifficultyLevel = AIDifficultyLevel.NORMAL,
    totalLaps: number = 3
  ) {
    this.track = track;
    this.difficulty = difficulty;
    this.racingLine = new AIRacingLine(track.sampler);

    this.createOpponents(aiCount, totalLaps);
  }

  public createOpponents(count: number, totalLaps: number = 3): void {
    this.opponents = [];
    const clampedCount = Math.min(DEFAULT_AI_ROSTER.length, Math.max(1, count));
    const trackPreset = this.track.definition.environmentPreset || this.track.definition.name;
    const suggestedVehicles = VehicleRegistry.getSuggestedAIVehicles(trackPreset, clampedCount);

    for (let i = 0; i < clampedCount; i++) {
      const profile = DEFAULT_AI_ROSTER[i];
      const vehicleDef = suggestedVehicles[i % suggestedVehicles.length];
      const opp = new AIOpponent(profile, this.track.checkpoints, totalLaps, vehicleDef);
      this.opponents.push(opp);
    }
  }

  public setDifficulty(level: AIDifficultyLevel): void {
    this.difficulty = level;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    for (const opp of this.opponents) {
      opp.controller.setEnabled(enabled);
    }
  }

  public registerWithPositionManager(positionManager: PositionManager): void {
    for (const opp of this.opponents) {
      positionManager.registerParticipant(opp.id, opp.name, false);
    }
  }

  /**
   * Spawns AI opponents into designated grid slots (slots 1 through N).
   */
  public spawnOnGrid(grid: StartGrid): void {
    for (let i = 0; i < this.opponents.length; i++) {
      // Slot 0 is reserved for player (P1); AI occupies slots 1..N
      const slotIndex = Math.min(grid.slots.length - 1, i + 1);
      const slot = grid.slots[slotIndex];
      this.opponents[i].setSpawn(slot.position, slot.heading);
    }
  }

  /**
   * Fixed-update AI decision step (runs at ~16 Hz, while vehicle physics runs at 60 Hz).
   */
  public update(
    dt: number,
    playerPosition: THREE.Vector3,
    playerSpeed: number,
    playerTrackDist: number,
    playerLateralDist: number,
    raceTimerSeconds: number,
    positionManager: PositionManager
  ): void {
    this.decisionTimer += dt;
    const shouldMakeDecisions = this.decisionTimer >= this.decisionInterval;
    if (shouldMakeDecisions) {
      this.decisionTimer = 0;
    }

    const profile: AIDifficultyProfile = AI_DIFFICULTY_PROFILES[this.difficulty];

    // Populate pre-allocated nearby vehicle list (slot 0 = player, slot 1..N = AI) without allocations
    const neededLen = 1 + this.opponents.length;
    while (this._allVehicles.length < neededLen) {
      this._allVehicles.push({
        position: new THREE.Vector3(),
        forwardSpeed: 0,
        distanceAlongTrack: 0,
        lateralDist: 0
      });
    }

    // Update player slot 0
    this._allVehicles[0].position = playerPosition;
    this._allVehicles[0].forwardSpeed = playerSpeed;
    this._allVehicles[0].distanceAlongTrack = playerTrackDist;
    this._allVehicles[0].lateralDist = playerLateralDist;

    // Update AI slots 1..N
    for (let j = 0; j < this.opponents.length; j++) {
      const oppPhys = this.opponents[j].physics;
      this._allVehicles[j + 1].position = oppPhys.position;
      this._allVehicles[j + 1].forwardSpeed = oppPhys.forwardSpeed;
      this._allVehicles[j + 1].distanceAlongTrack = oppPhys.trackDistance;
      this._allVehicles[j + 1].lateralDist = oppPhys.trackLateralDist;
    }

    // Step AI Opponents
    for (let i = 0; i < this.opponents.length; i++) {
      const opp = this.opponents[i];

      // Update checkpoint progression
      const cpRes = opp.checkpointManager.updateVehiclePosition(opp.physics.position);
      if (cpRes.valid && cpRes.isLapCompletion) {
        opp.lapManager.recordLap(raceTimerSeconds);
      }

      // Update position ranking manager
      positionManager.updateParticipant(
        opp.id,
        opp.lapManager.currentLap,
        opp.checkpointManager.currentCheckpoint,
        opp.physics.trackDistance,
        opp.lapManager.isFinished,
        raceTimerSeconds
      );

      // Run AI steering, throttle, and braking decision update
      if (shouldMakeDecisions && this.isEnabled && !opp.lapManager.isFinished) {
        opp.controller.updateDecision(
          opp.physics,
          this.racingLine,
          this.track.sampler,
          profile,
          this._allVehicles,
          this.decisionInterval,
          i + 1
        );
      } else if (opp.lapManager.isFinished) {
        // Finished AI coasts smoothly to a stop
        opp.physics.setInputs(0, 0.4, 0, false);
      }
    }
  }

  /**
   * Synchronize visual meshes of all AI opponents with physics positions.
   */
  public syncVisuals(alpha: number = 1.0): void {
    for (const opp of this.opponents) {
      opp.sync(alpha);
    }
  }

  public dispose(): void {
    for (const opp of this.opponents) {
      opp.dispose();
    }
    this.opponents = [];
  }
}

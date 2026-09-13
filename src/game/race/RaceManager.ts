import * as THREE from 'three';
import { RaceState } from './RaceState';
import { RaceConfig, DEFAULT_RACE_CONFIG } from './RaceConfig';
import { RaceTimer } from './RaceTimer';
import { LapManager } from './LapManager';
import { CheckpointManager } from './CheckpointManager';
import { PositionManager } from './PositionManager';
import { FinishSystem } from './FinishSystem';
import { RaceEvents, RaceEventType } from './RaceEvents';
import { Track } from '../../tracks/Track';

export class RaceManager {
  public state: RaceState = RaceState.GRID;
  public config: RaceConfig;
  public readonly timer: RaceTimer = new RaceTimer();
  public readonly playerLapManager: LapManager;
  public readonly playerCheckpointManager: CheckpointManager;
  public readonly positionManager: PositionManager;
  public readonly finishSystem: FinishSystem = new FinishSystem();
  public readonly events: RaceEvents = new RaceEvents();

  // Countdown state
  public countdownRemaining: number = 3.0;
  public countdownText: string = '3';
  private goBannerTimer: number = 0;

  constructor(track: Track, config: RaceConfig = DEFAULT_RACE_CONFIG) {
    this.config = config;
    this.playerLapManager = new LapManager(config.laps);
    this.playerCheckpointManager = new CheckpointManager(track.checkpoints);
    this.positionManager = new PositionManager(track.sampler.totalLength);

    // Register player as participant
    this.positionManager.registerParticipant('player', 'YOU', true);
  }

  private lastEmittedCountdown: string = '';

  public reset(): void {
    this.state = RaceState.COUNTDOWN;
    this.countdownRemaining = this.config.countdownDuration;
    this.countdownText = '3';
    this.lastEmittedCountdown = '';
    this.goBannerTimer = 0;

    this.timer.reset();
    this.playerLapManager.reset();
    this.playerCheckpointManager.reset();
    this.finishSystem.reset();
    this.positionManager.reset();
  }

  public setConfig(newConfig: Partial<RaceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.playerLapManager.totalLaps = this.config.laps;
  }

  public setTrack(track: Track): void {
    this.playerCheckpointManager.setCheckpoints(track.checkpoints);
    this.positionManager.setTrackLength(track.sampler.totalLength);
    this.positionManager.clearAIParticipants();
    this.reset();
  }

  public update(dt: number): void {
    // 1. Countdown State Machine
    if (this.state === RaceState.COUNTDOWN) {
      this.countdownRemaining -= dt;
      if (this.countdownRemaining > 2.0) {
        this.countdownText = '3';
      } else if (this.countdownRemaining > 1.0) {
        this.countdownText = '2';
      } else if (this.countdownRemaining > 0.0) {
        this.countdownText = '1';
      } else {
        this.countdownText = 'GO!';
        this.state = RaceState.RACING;
        this.timer.start();
        this.events.emit(RaceEventType.RACE_STARTED);
      }

      if (this.countdownText !== this.lastEmittedCountdown) {
        this.lastEmittedCountdown = this.countdownText;
        this.events.emit(RaceEventType.COUNTDOWN_TICK, {
          text: this.countdownText,
          isGo: this.countdownText === 'GO!'
        });
      }
    } else if (this.state === RaceState.RACING || this.state === RaceState.FINISHED) {
      // 2. Race Timing
      this.timer.update(dt);

      // Dismiss "GO!" banner after 0.8s
      if (this.countdownText === 'GO!') {
        this.goBannerTimer += dt;
        if (this.goBannerTimer >= 0.8) {
          this.countdownText = '';
        }
      }

      // 3. Update Positions & Standings
      this.positionManager.update(dt);

      // 4. Finish System update
      if (this.state === RaceState.FINISHED) {
        const showResults = this.finishSystem.update(dt, this.positionManager);
        if (showResults) {
          this.state = RaceState.RESULTS;
          this.events.emit(RaceEventType.RACE_FINISHED, this.finishSystem.getResults(this.positionManager));
        }
      }
    }
  }

  /**
   * Evaluates player checkpoint passing.
   */
  public updatePlayerProgression(playerPos: THREE.Vector3, distanceAlongTrack: number): void {
    if (this.state !== RaceState.RACING && this.state !== RaceState.FINISHED) return;

    // Checkpoint validation
    const cpRes = this.playerCheckpointManager.updateVehiclePosition(playerPos);

    if (cpRes.valid) {
      this.events.emit(RaceEventType.CHECKPOINT_PASSED, { isPlayer: true, index: cpRes.checkpointIndex });

      if (cpRes.isLapCompletion) {
        const lapTime = this.timer.onLapCompleted();
        const raceDone = this.playerLapManager.recordLap(lapTime);

        this.events.emit(RaceEventType.LAP_COMPLETED, {
          isPlayer: true,
          lap: this.playerLapManager.currentLap,
          lapTime
        });

        if (raceDone) {
          this.state = RaceState.FINISHED;
          this.countdownText = 'RACE FINISHED!';
          this.finishSystem.onPlayerFinished();
          this.events.emit(RaceEventType.VEHICLE_FINISHED, {
            isPlayer: true,
            totalTime: this.timer.raceTime,
            bestLap: this.playerLapManager.bestLapTime
          });
        }
      }
    }

    // Update position manager
    this.positionManager.updateParticipant(
      'player',
      this.playerLapManager.currentLap,
      this.playerCheckpointManager.currentCheckpoint,
      distanceAlongTrack,
      this.playerLapManager.isFinished,
      this.timer.raceTime
    );
  }
}

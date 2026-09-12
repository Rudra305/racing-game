import { GAME_CONFIG } from '../config/GameConfig';
import { Time } from './Time';
import { GameLoop } from './GameLoop';
import { Renderer } from '../rendering/Renderer';
import { SceneManager } from '../rendering/SceneManager';
import { CameraManager } from '../rendering/CameraManager';
import { InputManager } from '../input/InputManager';
import { Track } from '../tracks/Track';
import { TrackManager } from '../tracks/TrackManager';
import { TrackDebugRenderer } from '../debug/TrackDebugRenderer';
import { Vehicle } from '../vehicles/Vehicle';
import { VehicleController } from '../vehicles/VehicleController';
import { VehiclePhysics } from '../physics/VehiclePhysics';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { HUD } from '../ui/HUD';
import { PerformanceMonitor } from '../performance/PerformanceMonitor';
import { SettingsModal } from '../ui/SettingsModal';
import { AssetManager } from '../assets/AssetManager';
import { EnvironmentManager } from '../environment/EnvironmentManager';
import { BiomeType } from '../environment/EnvironmentTypes';
import { RaceManager } from '../game/race/RaceManager';
import { RaceState } from '../game/race/RaceState';
import { AISystem } from '../game/ai/AISystem';
import { AIDifficultyLevel, DEFAULT_RACE_CONFIG } from '../game/race/RaceConfig';
import { GarageManager } from '../ui/garage/GarageManager';
import { VehicleDefinition } from '../vehicles/VehicleDefinition';
import { VehicleCustomization } from '../vehicles/VehicleCustomization';
import { VehicleRegistry } from '../vehicles/VehicleRegistry';
import { AudioManager } from '../audio/AudioManager';

export class Game {
  // Systems
  private time!: Time;
  private raceManager!: RaceManager;
  private aiSystem!: AISystem;
  private inputManager!: InputManager;
  private renderer!: Renderer;
  private sceneManager!: SceneManager;
  private cameraManager!: CameraManager;
  private audioManager!: AudioManager;
  private trackManager!: TrackManager;
  private track!: Track;
  private trackDebugRenderer!: TrackDebugRenderer;
  private environmentManager!: EnvironmentManager;
  private vehicle!: Vehicle;
  private vehiclePhysics!: VehiclePhysics;
  private vehicleController!: VehicleController;
  private physicsWorld!: PhysicsWorld;
  private hud!: HUD;
  private perfMonitor!: PerformanceMonitor;
  private settingsModal!: SettingsModal;
  private garageManager!: GarageManager;
  private assetManager!: AssetManager;
  private gameLoop!: GameLoop;

  private boundResize: () => void;

  constructor() {
    this.boundResize = this.onWindowResize.bind(this);
  }

  public init(): void {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element #game-canvas not found.');
    }

    // 1. Core Timing & Inputs
    this.time = new Time();
    this.inputManager = new InputManager();
    this.inputManager.init();

    // 2. Rendering Subsystems
    this.renderer = new Renderer({
      canvas,
      maxPixelRatio: GAME_CONFIG.graphics.maxPixelRatio
    });
    this.sceneManager = new SceneManager();
    this.cameraManager = new CameraManager(GAME_CONFIG.camera);
    this.audioManager = new AudioManager();

    // 3. Track Generation & Insertion via TrackManager
    this.trackManager = new TrackManager();
    this.track = this.trackManager.loadTrack('alpine-circuit');
    this.sceneManager.add(this.track.group);

    // Track Debug Visualizer (F3 / K to toggle)
    this.trackDebugRenderer = new TrackDebugRenderer(this.track);
    this.sceneManager.add(this.trackDebugRenderer.group);

    // 3b. Environment Manager (Vegetation, Props, Distant Scenery, Biomes)
    const initialBiome = this.track.definition.environmentPreset === 'desert' ? BiomeType.DESERT_CANYON :
                         this.track.definition.environmentPreset === 'coastal' ? BiomeType.COASTAL :
                         BiomeType.ALPINE_FOREST;
    this.environmentManager = new EnvironmentManager(
      this.track.sampler,
      this.track.terrain,
      initialBiome,
      this.track.definition.seed
    );
    this.sceneManager.add(this.environmentManager.group);

    // Initialize VehicleRegistry
    VehicleRegistry.initialize();

    // Initialize Garage Subsystem (Phase 6)
    const garageOverlay = document.getElementById('garage-overlay') as HTMLElement;
    this.garageManager = new GarageManager(garageOverlay, {
      onStartRace: (def, cust) => {
        this.applyPlayerVehicle(def, cust);
        this.restartRace();
      },
      onClose: () => {
        canvas.focus();
      }
    });

    // 4. Player Vehicle & Physics Setup (Spawned on Grid Slot 0 with persisted vehicle selection)
    const playerSlot = this.track.startGrid.getPlayerSlot();
    const savedCar = this.garageManager.getSelectedVehicle();
    this.vehiclePhysics = new VehiclePhysics(savedCar.definition.config);
    this.vehiclePhysics.setSpawn(playerSlot.position, playerSlot.heading);
    this.audioManager.setCategory(savedCar.definition.category);

    this.vehicle = new Vehicle(savedCar.definition, savedCar.customization);
    this.vehicle.syncWithPhysics(this.vehiclePhysics);
    this.sceneManager.add(this.vehicle.group);

    this.vehicleController = new VehicleController(this.inputManager, this.vehiclePhysics);

    // 5. Physics World with Camera Impact Callback & Audio Feedback
    this.physicsWorld = new PhysicsWorld(this.track, this.vehiclePhysics, (penetration: number) => {
      this.cameraManager.addShake(Math.min(0.8, penetration * 0.9));
      this.audioManager.triggerImpact(penetration);
    });

    // 6. Camera Initial Alignment
    this.cameraManager.resetToVehicle(this.vehiclePhysics.position, this.vehiclePhysics.heading);

    // 7. Race System & AI Opponents (Phase 5 & 7)
    this.raceManager = new RaceManager(this.track, {
      laps: GAME_CONFIG.race.totalLaps,
      aiCount: DEFAULT_RACE_CONFIG.aiCount,
      countdownDuration: 3.0,
      difficulty: AIDifficultyLevel.NORMAL,
      allowRestart: true,
      rubberBanding: { enabled: false, strength: 0 }
    });

    this.aiSystem = new AISystem(this.track, DEFAULT_RACE_CONFIG.aiCount, AIDifficultyLevel.NORMAL, GAME_CONFIG.race.totalLaps);
    this.aiSystem.spawnOnGrid(this.track.startGrid);
    this.aiSystem.registerWithPositionManager(this.raceManager.positionManager);

    // Add AI visual models to scene and physics to physicsWorld
    for (const opp of this.aiSystem.opponents) {
      this.sceneManager.add(opp.vehicle.group);
      this.physicsWorld.addAIVehicle(opp.physics);
    }
    this.aiSystem.syncVisuals();

    // 8. UI, Settings & Telemetry
    this.hud = new HUD();
    this.perfMonitor = new PerformanceMonitor();
    this.assetManager = new AssetManager();

    // In-game Settings Modal (Esc / O / Button)
    this.settingsModal = new SettingsModal(this.vehiclePhysics.steeringSystem, {
      onVehiclePresetChanged: (newConfig) => {
        this.vehiclePhysics.setConfig(newConfig);
        this.vehicle.setConfig(newConfig);
        this.cameraManager.resetToVehicle(this.vehiclePhysics.position, this.vehiclePhysics.heading);
      },
      onTrackChanged: (trackId) => {
        this.switchTrack(trackId);
      },
      onQualityChanged: (scale) => {
        this.environmentManager.setLODScale(scale);
      },
      onAIDifficultyChanged: (difficulty) => {
        this.raceManager.config.difficulty = difficulty;
        this.aiSystem.setDifficulty(difficulty);
      },
      onAICountChanged: (count) => {
        this.changeAICount(count);
      },
      onClosed: () => {
        canvas.focus();
      }
    });

    this.hud.onGarageButtonClick(() => {
      this.openGarage();
    });

    this.hud.onSettingsButtonClick(() => {
      this.settingsModal.toggle();
    });

    this.hud.onAudioButtonClick(() => {
      const isMuted = this.audioManager.toggleMute();
      this.hud.updateAudioButton(isMuted);
    });

    this.hud.onRestartButtonClick(() => {
      this.restartRace();
    });

    // 9. Start Race Countdown
    this.raceManager.reset();

    // 10. Game Loop with Fixed Timestep
    this.gameLoop = new GameLoop(
      this.time,
      this.onFixedUpdate.bind(this),
      this.onRenderUpdate.bind(this)
    );

    // 11. Event Listeners
    window.addEventListener('resize', this.boundResize);
    canvas.setAttribute('tabindex', '0');
    canvas.focus();
    window.addEventListener('click', () => {
      if (!this.settingsModal.visible) {
        canvas.focus();
      }
    });

    // 12. Start Game Loop
    this.gameLoop.start();

    // 13. Open Garage Showroom as First Screen on Game Load
    this.openGarage();
  }

  private onFixedUpdate(dt: number): void {
    // 0. Poll active input states
    this.inputManager.update();

    // 1. Process Garage & Settings Modal Toggles
    if (this.inputManager.consumeToggleGarage()) {
      this.toggleGarage();
    }

    if (this.inputManager.consumeToggleSettings()) {
      if (this.garageManager.isOpen) {
        this.garageManager.close();
      } else {
        this.settingsModal.toggle();
      }
    }

    if (this.inputManager.consumeToggleAudio()) {
      const isMuted = this.audioManager.toggleMute();
      this.hud.updateAudioButton(isMuted);
    }

    // 2. Process Developer Jump Test (J)
    if (this.inputManager.consumeJump()) {
      this.vehiclePhysics.triggerJump(5.2);
      this.cameraManager.addShake(0.3);
    }

    // 3. Process One-Shot Reset Input (R)
    if (this.inputManager.consumeReset()) {
      this.resetVehicle();
    }

    // 4. Update Controller & AI based on Race / UI State
    if (this.garageManager.isOpen || this.settingsModal.visible) {
      // Pause inputs while in garage or settings menu
      this.vehicleController.setEnabled(false);
      this.aiSystem.setEnabled(false);
      return;
    }

    // Advance Race Countdown & Timers
    this.raceManager.update(dt);

    if (this.raceManager.state === RaceState.COUNTDOWN || this.raceManager.state === RaceState.GRID) {
      // Inputs locked during countdown
      this.vehicleController.setEnabled(false);
      this.aiSystem.setEnabled(false);
      this.physicsWorld.step(dt);
    } else if (this.raceManager.state === RaceState.RACING) {
      this.vehicleController.setEnabled(true);
      this.aiSystem.setEnabled(true);

      // AI Decision Step (~16.6 Hz decision throttled internally, controls fed continuously)
      this.aiSystem.update(
        dt,
        this.vehiclePhysics.position,
        this.vehiclePhysics.forwardSpeed,
        this.vehiclePhysics.trackDistance,
        this.vehiclePhysics.trackLateralDist,
        this.raceManager.timer.raceTime,
        this.raceManager.positionManager
      );

      // Player Control Step
      this.vehicleController.update();

      // Physics Step (Player + AI + Inter-vehicle 2D Collisions at 60 Hz)
      this.physicsWorld.step(dt);

      // Checkpoint & Lap Progression
      this.raceManager.updatePlayerProgression(this.vehiclePhysics.position, this.vehiclePhysics.trackDistance);
    } else if (this.raceManager.state === RaceState.FINISHED || this.raceManager.state === RaceState.RESULTS) {
      // Player coasts smoothly to halt after finish
      this.vehicleController.setEnabled(false);

      // AI continues until finished
      this.aiSystem.update(
        dt,
        this.vehiclePhysics.position,
        this.vehiclePhysics.forwardSpeed,
        this.vehiclePhysics.trackDistance,
        this.vehiclePhysics.trackLateralDist,
        this.raceManager.timer.raceTime,
        this.raceManager.positionManager
      );

      this.physicsWorld.step(dt);
    }
  }

  private onRenderUpdate(dt: number): void {
    // 1. Synchronize Visual Vehicle Meshes with Physics States
    this.vehicle.syncWithPhysics(this.vehiclePhysics);
    this.aiSystem.syncVisuals();

    // 2. Update Camera Follow, Acceleration Setback, Curb Shake & Speed-Dependent FOV
    const groundInfo = this.track.queryGroundElevation(this.cameraManager.camera.position, true);
    this.cameraManager.update(
      dt,
      this.vehiclePhysics.position,
      this.vehiclePhysics.heading,
      this.vehiclePhysics.normalizedSpeed,
      this.vehiclePhysics.acceleration,
      this.vehiclePhysics.suspensionSystem.curbVibration,
      groundInfo.height
    );

    // 2b. Update Reactive Web Audio Engine
    this.audioManager.update(
      this.vehiclePhysics.telemetry,
      this.vehiclePhysics.drivetrain.isShifting
    );

    // 3. Update Shadow Camera Target
    this.sceneManager.updateLightTarget(this.vehiclePhysics.position);

    // 4. Update Environment LOD & Distance Culling
    this.environmentManager.update(this.vehiclePhysics.position);

    // 5. Update HUD Telemetry (Throttled internally for text, per-frame for speed/RPM)
    this.hud.update(dt, this.raceManager, this.vehiclePhysics, this.track.checkpoints.length);

    // 6. Handle Developer Debug Key Toggles
    if (this.inputManager.consumeTogglePerf()) {
      this.perfMonitor.toggle();
    }
    if (this.inputManager.consumeToggleCollisions()) {
      this.physicsWorld.toggleCollisionDebug(this.sceneManager.scene);
    }
    if (this.inputManager.consumeToggleCheckpoints()) {
      this.track.toggleCheckpointDebug();
    }
    if (this.inputManager.consumeToggleTrackDebug()) {
      this.trackDebugRenderer.toggle();
    }

    // 7. Update Performance, Environment & Vehicle Telemetry
    this.perfMonitor.update(
      dt,
      this.renderer.instance,
      this.vehiclePhysics.telemetry,
      this.environmentManager.getMetrics()
    );

    // 8. Render Frame
    this.renderer.render(this.sceneManager.scene, this.cameraManager.camera);
  }

  /**
   * Restarts the current race with full grid respawn and countdown.
   */
  public restartRace(): void {
    const playerSlot = this.track.startGrid.getPlayerSlot();
    this.vehiclePhysics.setSpawn(playerSlot.position, playerSlot.heading);
    this.vehicle.syncWithPhysics(this.vehiclePhysics);

    this.aiSystem.spawnOnGrid(this.track.startGrid);
    this.aiSystem.syncVisuals();

    this.cameraManager.resetToVehicle(this.vehiclePhysics.position, this.vehiclePhysics.heading);
    this.hud.reset();
    this.raceManager.reset();
  }

  /**
   * Resets vehicle to last valid passed checkpoint or restarts race if at start.
   */
  private resetVehicle(): void {
    if (this.raceManager.state === RaceState.FINISHED || this.raceManager.state === RaceState.RESULTS) {
      this.restartRace();
      return;
    }

    let spawnPos = this.track.spawnPosition;
    let spawnHeading = this.track.spawnHeading;

    const cpIdx = this.raceManager.playerCheckpointManager.currentCheckpoint;
    if (cpIdx > 0 && cpIdx < this.track.checkpoints.length) {
      const cp = this.track.checkpoints[cpIdx];
      spawnPos = cp.position.clone().add(cp.tangent.clone().multiplyScalar(2.0));
      spawnHeading = Math.atan2(cp.tangent.x, cp.tangent.z);
    } else {
      this.restartRace();
      return;
    }

    this.vehiclePhysics.setSpawn(spawnPos, spawnHeading);
    this.vehicle.syncWithPhysics(this.vehiclePhysics);
    this.cameraManager.resetToVehicle(this.vehiclePhysics.position, this.vehiclePhysics.heading);
  }

  /**
   * Changes the number of AI opponents on the grid.
   */
  private changeAICount(count: number): void {
    // 1. Remove current AI from scene and physicsWorld
    for (const opp of this.aiSystem.opponents) {
      this.sceneManager.scene.remove(opp.vehicle.group);
    }
    this.physicsWorld.clearAIVehicles();
    this.aiSystem.dispose();

    // 2. Clear old AI participants from PositionManager so total and standings are strictly accurate
    this.raceManager.positionManager.clearAIParticipants();

    // 3. Create new AI roster
    this.raceManager.config.aiCount = count;
    this.aiSystem = new AISystem(this.track, count, this.raceManager.config.difficulty, this.raceManager.config.laps);
    this.aiSystem.spawnOnGrid(this.track.startGrid);
    this.aiSystem.registerWithPositionManager(this.raceManager.positionManager);

    for (const opp of this.aiSystem.opponents) {
      this.sceneManager.add(opp.vehicle.group);
      this.physicsWorld.addAIVehicle(opp.physics);
    }
    this.aiSystem.syncVisuals();
    this.restartRace();
  }

  /**
   * Dynamically switch circuit preset, regenerate terrain/road, and respawn cars on grid.
   */
  private switchTrack(trackId: string): void {
    // 1. Remove old track, debug renderer & environment from scene
    this.sceneManager.scene.remove(this.track.group);
    this.sceneManager.scene.remove(this.trackDebugRenderer.group);
    this.sceneManager.scene.remove(this.environmentManager.group);
    this.environmentManager.dispose();

    // 2. Remove AI from scene and physics
    for (const opp of this.aiSystem.opponents) {
      this.sceneManager.scene.remove(opp.vehicle.group);
    }
    this.physicsWorld.clearAIVehicles();
    this.aiSystem.dispose();

    // 3. Load new track
    this.track = this.trackManager.loadTrack(trackId);
    this.sceneManager.add(this.track.group);

    // 4. Rebind debug renderer
    this.trackDebugRenderer.dispose();
    this.trackDebugRenderer = new TrackDebugRenderer(this.track);
    this.sceneManager.add(this.trackDebugRenderer.group);

    // 5. Recreate environment manager for new track
    const newBiome = this.track.definition.environmentPreset === 'desert' ? BiomeType.DESERT_CANYON :
                     this.track.definition.environmentPreset === 'coastal' ? BiomeType.COASTAL :
                     BiomeType.ALPINE_FOREST;
    this.environmentManager = new EnvironmentManager(
      this.track.sampler,
      this.track.terrain,
      newBiome,
      this.track.definition.seed
    );
    this.sceneManager.add(this.environmentManager.group);

    // 6. Update PhysicsWorld with new track
    this.physicsWorld.setTrack(this.track);

    // 7. Reset player vehicle to new track grid slot
    const playerSlot = this.track.startGrid.getPlayerSlot();
    this.vehiclePhysics.setSpawn(playerSlot.position, playerSlot.heading);
    this.vehicle.syncWithPhysics(this.vehiclePhysics);
    this.cameraManager.resetToVehicle(this.vehiclePhysics.position, this.vehiclePhysics.heading);

    // 8. Rebind RaceManager to new track & clear stale AI participants
    this.raceManager.setTrack(this.track);

    // 9. Rebuild AI System for new track
    const aiCount = this.raceManager.config.aiCount;
    this.aiSystem = new AISystem(this.track, aiCount, this.raceManager.config.difficulty, this.raceManager.config.laps);
    this.aiSystem.spawnOnGrid(this.track.startGrid);
    this.aiSystem.registerWithPositionManager(this.raceManager.positionManager);

    for (const opp of this.aiSystem.opponents) {
      this.sceneManager.add(opp.vehicle.group);
      this.physicsWorld.addAIVehicle(opp.physics);
    }
    this.aiSystem.syncVisuals();

    // 10. Reset race state & start countdown
    this.hud.reset();
    this.restartRace();
  }

  private onWindowResize(): void {
    this.renderer.resize();
    this.cameraManager.resize();
  }

  public destroy(): void {
    window.removeEventListener('resize', this.boundResize);
    this.gameLoop.stop();
    this.inputManager.destroy();
    this.renderer.destroy();
    this.environmentManager.dispose();
    this.assetManager.dispose();
    this.aiSystem.dispose();
    this.garageManager.dispose();
    this.audioManager.dispose();
  }

  public openGarage(): void {
    if (this.settingsModal.visible) {
      this.settingsModal.hide();
    }
    this.garageManager.open();
  }

  public toggleGarage(): void {
    if (this.garageManager.isOpen) {
      this.garageManager.close();
    } else {
      this.openGarage();
    }
  }

  public applyPlayerVehicle(def: VehicleDefinition, cust: VehicleCustomization): void {
    this.vehiclePhysics.setConfig(def.config);
    this.vehicle.setDefinition(def, cust);
    this.cameraManager.resetToVehicle(this.vehiclePhysics.position, this.vehiclePhysics.heading);
    this.audioManager.setCategory(def.category);
  }
}

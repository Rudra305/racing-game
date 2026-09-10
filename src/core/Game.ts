import { GAME_CONFIG } from '../config/GameConfig';
import { Time } from './Time';
import { GameState, RaceState } from './GameState';
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

export class Game {
  // Systems
  private time!: Time;
  private gameState!: GameState;
  private inputManager!: InputManager;
  private renderer!: Renderer;
  private sceneManager!: SceneManager;
  private cameraManager!: CameraManager;
  private trackManager!: TrackManager;
  private track!: Track;
  private trackDebugRenderer!: TrackDebugRenderer;
  private vehicle!: Vehicle;
  private vehiclePhysics!: VehiclePhysics;
  private vehicleController!: VehicleController;
  private physicsWorld!: PhysicsWorld;
  private hud!: HUD;
  private perfMonitor!: PerformanceMonitor;
  private settingsModal!: SettingsModal;
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

    // 1. Core Timing & State
    this.time = new Time();
    this.gameState = new GameState(GAME_CONFIG.race.totalLaps);
    this.inputManager = new InputManager();
    this.inputManager.init();

    // 2. Rendering Subsystems
    this.renderer = new Renderer({
      canvas,
      maxPixelRatio: GAME_CONFIG.graphics.maxPixelRatio
    });
    this.sceneManager = new SceneManager();
    this.cameraManager = new CameraManager(GAME_CONFIG.camera);

    // 3. Track Generation & Insertion via TrackManager
    this.trackManager = new TrackManager();
    this.track = this.trackManager.loadTrack('alpine-circuit');
    this.sceneManager.add(this.track.group);

    // Track Debug Visualizer (F3 / K to toggle)
    this.trackDebugRenderer = new TrackDebugRenderer(this.track);
    this.sceneManager.add(this.trackDebugRenderer.group);

    // 4. Vehicle & Physics Setup
    this.vehiclePhysics = new VehiclePhysics();
    this.vehiclePhysics.setSpawn(this.track.spawnPosition, this.track.spawnHeading);

    this.vehicle = new Vehicle();
    this.vehicle.syncWithPhysics(this.vehiclePhysics);
    this.sceneManager.add(this.vehicle.group);

    this.vehicleController = new VehicleController(this.inputManager, this.vehiclePhysics);

    // 5. Physics World with Camera Impact Callback
    this.physicsWorld = new PhysicsWorld(this.track, this.vehiclePhysics, (penetration: number) => {
      this.cameraManager.addShake(Math.min(0.8, penetration * 0.9));
    });

    // 6. Camera Initial Alignment
    this.cameraManager.resetToVehicle(this.vehiclePhysics.position, this.vehiclePhysics.heading);

    // 7. UI, Settings & Telemetry
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
      onClosed: () => {
        canvas.focus();
      }
    });

    this.hud.onSettingsButtonClick(() => {
      this.settingsModal.toggle();
    });

    // 8. Initialize GameState with track checkpoints
    this.gameState.init(this.track.checkpoints.length);

    // 9. Game Loop with Fixed Timestep
    this.gameLoop = new GameLoop(
      this.time,
      this.onFixedUpdate.bind(this),
      this.onRenderUpdate.bind(this)
    );

    // 10. Event Listeners
    window.addEventListener('resize', this.boundResize);
    canvas.setAttribute('tabindex', '0');
    canvas.focus();
    window.addEventListener('click', () => {
      if (!this.settingsModal.visible) {
        canvas.focus();
      }
    });

    // 11. Start Game Loop
    this.gameLoop.start();
  }

  private onFixedUpdate(dt: number): void {
    // 0. Poll active input states
    this.inputManager.update();

    // 1. Process Settings Modal Toggle (Escape / O)
    if (this.inputManager.consumeToggleSettings()) {
      this.settingsModal.toggle();
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

    // 4. Update Controller & Gate Drive Input based on Race State
    if (this.settingsModal.visible) {
      // Pause inputs while in settings menu
      this.vehicleController.setEnabled(false);
      this.physicsWorld.step(dt);
    } else if (this.gameState.state === RaceState.COUNTDOWN) {
      // Inputs locked during 3-2-1 countdown
      this.vehicleController.setEnabled(false);
      this.physicsWorld.step(dt);
    } else if (this.gameState.state === RaceState.RACING) {
      this.vehicleController.setEnabled(true);
      this.vehicleController.update();
      this.physicsWorld.step(dt);

      // Checkpoint Progression Verification
      this.checkCheckpoints();
    } else if (this.gameState.state === RaceState.FINISHED) {
      // Disable power on finish; car coasts smoothly to a halt
      this.vehicleController.setEnabled(false);
      this.physicsWorld.step(dt);
    }
  }

  private onRenderUpdate(dt: number): void {
    // 1. Update Game State / Countdown / Lap Timers
    this.gameState.update(dt);

    // 2. Synchronize Visual Vehicle with Phase 2 Physics State
    this.vehicle.syncWithPhysics(this.vehiclePhysics);

    // 3. Update Camera Follow, Acceleration Setback, Curb Shake & Speed-Dependent FOV with terrain safety
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

    // 4. Update Shadow Camera Target
    this.sceneManager.updateLightTarget(this.vehiclePhysics.position);

    // 5. Update HUD Telemetry
    this.hud.update(this.gameState, this.vehiclePhysics);

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

    // 7. Update Performance & Vehicle Telemetry
    this.perfMonitor.update(dt, this.renderer.instance, this.vehiclePhysics.telemetry);

    // 8. Render Frame
    this.renderer.render(this.sceneManager.scene, this.cameraManager.camera);
  }

  /**
   * Dynamically switch circuit preset, regenerate terrain/road, and respawn car.
   */
  private switchTrack(trackId: string): void {
    // Remove old track & debug renderer from scene
    this.sceneManager.scene.remove(this.track.group);
    this.sceneManager.scene.remove(this.trackDebugRenderer.group);

    // Load new track
    this.track = this.trackManager.loadTrack(trackId);
    this.sceneManager.add(this.track.group);

    // Rebind debug renderer
    this.trackDebugRenderer.dispose();
    this.trackDebugRenderer = new TrackDebugRenderer(this.track);
    this.sceneManager.add(this.trackDebugRenderer.group);

    // Update PhysicsWorld with new track
    this.physicsWorld.setTrack(this.track);

    // Reset vehicle to new track spawn
    this.vehiclePhysics.setSpawn(this.track.spawnPosition, this.track.spawnHeading);
    this.vehicle.syncWithPhysics(this.vehiclePhysics);
    this.cameraManager.resetToVehicle(this.vehiclePhysics.position, this.vehiclePhysics.heading);

    // Reset race state
    this.gameState.init(this.track.checkpoints.length);
    this.gameState.reset();
  }

  private checkCheckpoints(): void {
    const carPos = this.vehiclePhysics.position;

    // Check all checkpoints
    for (const cp of this.track.checkpoints) {
      if (cp.isPassedByVehicle(carPos)) {
        this.gameState.onCheckpointPassed(cp.index);
      }
    }
  }

  /**
   * Resets vehicle to the last passed valid checkpoint or the start line.
   * Aligns orientation along track tangent, zeroes velocity, and realigns camera.
   */
  private resetVehicle(): void {
    let spawnPos = this.track.spawnPosition;
    let spawnHeading = this.track.spawnHeading;

    const cpIdx = this.gameState.currentCheckpoint;
    if (cpIdx > 0 && cpIdx < this.track.checkpoints.length) {
      const cp = this.track.checkpoints[cpIdx];
      spawnPos = cp.position.clone().add(cp.tangent.clone().multiplyScalar(2.0));
      spawnHeading = Math.atan2(cp.tangent.x, cp.tangent.z);
    } else {
      // At starting line: reset race state & countdown
      this.gameState.reset();
    }

    if (this.gameState.state === RaceState.FINISHED) {
      this.gameState.reset();
    }

    this.vehiclePhysics.setSpawn(spawnPos, spawnHeading);
    this.vehicle.syncWithPhysics(this.vehiclePhysics);
    this.cameraManager.resetToVehicle(this.vehiclePhysics.position, this.vehiclePhysics.heading);
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
    this.assetManager.dispose();
  }
}

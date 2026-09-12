import { Time } from './Time';
import { GAME_CONFIG } from '../config/GameConfig';

export type FixedUpdateCallback = (dt: number) => void;
export type RenderUpdateCallback = (dt: number, alpha: number) => void;

export class GameLoop {
  private time: Time;
  private onFixedUpdate: FixedUpdateCallback;
  private onRenderUpdate: RenderUpdateCallback;

  private isRunning: boolean = false;
  private animationFrameId: number = 0;
  private readonly fixedStep: number;
  private readonly maxSubSteps: number;

  constructor(
    time: Time,
    onFixedUpdate: FixedUpdateCallback,
    onRenderUpdate: RenderUpdateCallback
  ) {
    this.time = time;
    this.onFixedUpdate = onFixedUpdate;
    this.onRenderUpdate = onRenderUpdate;
    this.fixedStep = GAME_CONFIG.physics.fixedStep;
    this.maxSubSteps = GAME_CONFIG.physics.maxSubSteps;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.time.init();
    this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  private tick(): void {
    if (!this.isRunning) return;

    this.time.update();
    const dt = this.time.deltaTime;

    // Fixed timestep accumulator loop for physics stability
    let subSteps = 0;
    while (this.time.accumulator >= this.fixedStep && subSteps < this.maxSubSteps) {
      this.onFixedUpdate(this.fixedStep);
      this.time.consumeAccumulator(this.fixedStep);
      subSteps++;
    }

    // Compute interpolation alpha for smooth visual rendering between fixed physics ticks
    const alpha = Math.min(1.0, Math.max(0.0, this.time.accumulator / this.fixedStep));

    // Render update at display refresh rate with interpolation alpha
    this.onRenderUpdate(dt, alpha);

    this.animationFrameId = requestAnimationFrame(this.tick.bind(this));
  }
}

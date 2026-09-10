/**
 * High-resolution time management using performance.now()
 * Decouples rendering frame time from fixed physics timesteps.
 */
export class Time {
  private lastTime: number = 0;
  private _deltaTime: number = 0;
  private _totalTime: number = 0;
  private _accumulator: number = 0;
  private readonly maxDelta: number = 0.1; // Clamp to avoid spiral of death on tab unfocus

  public init(): void {
    this.lastTime = performance.now();
    this._deltaTime = 0;
    this._totalTime = 0;
    this._accumulator = 0;
  }

  public update(): void {
    const now = performance.now();
    const rawDelta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Clamp delta to handle lag spikes or browser tab changes smoothly
    this._deltaTime = Math.min(rawDelta, this.maxDelta);
    this._totalTime += this._deltaTime;
    this._accumulator += this._deltaTime;
  }

  public get deltaTime(): number {
    return this._deltaTime;
  }

  public get totalTime(): number {
    return this._totalTime;
  }

  public get accumulator(): number {
    return this._accumulator;
  }

  public consumeAccumulator(step: number): void {
    this._accumulator -= step;
  }
}

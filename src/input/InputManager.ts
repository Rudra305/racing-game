export interface InputActions {
  accelerate: boolean;
  brake: boolean;
  steerLeft: boolean;
  steerRight: boolean;
  handbrake: boolean;
  resetRequested: boolean;
  togglePerfRequested: boolean;
  toggleCollisionsRequested: boolean;
  toggleCheckpointsRequested: boolean;
  toggleTrackDebugRequested: boolean;
  toggleSettingsRequested: boolean;
  toggleGarageRequested: boolean;
  jumpRequested: boolean;
}

export class InputManager {
  private keyState: Map<string, boolean> = new Map();
  private actions: InputActions = {
    accelerate: false,
    brake: false,
    steerLeft: false,
    steerRight: false,
    handbrake: false,
    resetRequested: false,
    togglePerfRequested: false,
    toggleCollisionsRequested: false,
    toggleCheckpointsRequested: false,
    toggleTrackDebugRequested: false,
    toggleSettingsRequested: false,
    toggleGarageRequested: false,
    jumpRequested: false
  };

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundBlur: () => void;

  constructor() {
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
    this.boundBlur = this.onBlur.bind(this);
  }

  public init(): void {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('blur', this.boundBlur);
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('blur', this.boundBlur);
  }

  private onBlur(): void {
    this.keyState.clear();
    this.update();
  }

  private onKeyDown(event: KeyboardEvent): void {
    const code = event.code;
    const key = event.key ? event.key.toLowerCase() : '';

    this.keyState.set(code, true);
    if (key) this.keyState.set(key, true);

    // One-shot pulses
    if (code === 'KeyR' || key === 'r') {
      this.actions.resetRequested = true;
    }
    // Performance stats toggle: P, ~, or F1
    if (code === 'KeyP' || key === 'p' || code === 'Backquote' || key === '`' || code === 'F1' || key === 'f1') {
      event.preventDefault();
      this.actions.togglePerfRequested = true;
    }
    // Collision visualization toggle: C or F2
    if (code === 'KeyC' || key === 'c' || code === 'F2' || key === 'f2') {
      event.preventDefault();
      this.actions.toggleCollisionsRequested = true;
    }
    // Track & Spline debug toggle: K or F3
    if (code === 'KeyK' || key === 'k' || code === 'F3' || key === 'f3') {
      event.preventDefault();
      this.actions.toggleTrackDebugRequested = true;
    }
    // Checkpoint arches toggle: F4
    if (code === 'F4' || key === 'f4') {
      event.preventDefault();
      this.actions.toggleCheckpointsRequested = true;
    }
    // Settings modal toggle: Escape or O
    if (code === 'Escape' || code === 'KeyO' || key === 'escape' || key === 'o') {
      event.preventDefault();
      this.actions.toggleSettingsRequested = true;
    }
    // Garage toggle: G
    if (code === 'KeyG' || key === 'g') {
      event.preventDefault();
      this.actions.toggleGarageRequested = true;
    }
    // Developer Jump test: J
    if (code === 'KeyJ' || key === 'j') {
      this.actions.jumpRequested = true;
    }

    // Immediately recalculate active action states
    this.update();
  }

  private onKeyUp(event: KeyboardEvent): void {
    const code = event.code;
    const key = event.key ? event.key.toLowerCase() : '';

    this.keyState.set(code, false);
    if (key) this.keyState.set(key, false);

    this.update();
  }

  public update(): void {
    this.actions.accelerate = !!(
      this.keyState.get('KeyW') ||
      this.keyState.get('ArrowUp') ||
      this.keyState.get('w') ||
      this.keyState.get('arrowup')
    );

    this.actions.brake = !!(
      this.keyState.get('KeyS') ||
      this.keyState.get('ArrowDown') ||
      this.keyState.get('s') ||
      this.keyState.get('arrowdown')
    );

    this.actions.steerLeft = !!(
      this.keyState.get('KeyA') ||
      this.keyState.get('ArrowLeft') ||
      this.keyState.get('a') ||
      this.keyState.get('arrowleft')
    );

    this.actions.steerRight = !!(
      this.keyState.get('KeyD') ||
      this.keyState.get('ArrowRight') ||
      this.keyState.get('d') ||
      this.keyState.get('arrowright')
    );

    this.actions.handbrake = !!(
      this.keyState.get('Space') ||
      this.keyState.get(' ')
    );
  }

  public getActions(): Readonly<InputActions> {
    return this.actions;
  }

  public consumeReset(): boolean {
    const res = this.actions.resetRequested;
    this.actions.resetRequested = false;
    return res;
  }

  public consumeTogglePerf(): boolean {
    const res = this.actions.togglePerfRequested;
    this.actions.togglePerfRequested = false;
    return res;
  }

  public consumeToggleCollisions(): boolean {
    const res = this.actions.toggleCollisionsRequested;
    this.actions.toggleCollisionsRequested = false;
    return res;
  }

  public consumeToggleCheckpoints(): boolean {
    const res = this.actions.toggleCheckpointsRequested;
    this.actions.toggleCheckpointsRequested = false;
    return res;
  }

  public consumeToggleTrackDebug(): boolean {
    const res = this.actions.toggleTrackDebugRequested;
    this.actions.toggleTrackDebugRequested = false;
    return res;
  }

  public consumeToggleSettings(): boolean {
    const res = this.actions.toggleSettingsRequested;
    this.actions.toggleSettingsRequested = false;
    return res;
  }

  public consumeToggleGarage(): boolean {
    const res = this.actions.toggleGarageRequested;
    this.actions.toggleGarageRequested = false;
    return res;
  }

  public consumeJump(): boolean {
    const res = this.actions.jumpRequested;
    this.actions.jumpRequested = false;
    return res;
  }
}

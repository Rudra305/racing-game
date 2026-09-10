export interface GameConfig {
  physics: {
    fixedStep: number;
    maxSubSteps: number;
    gravity: number;
  };
  graphics: {
    maxPixelRatio: number;
    shadowMapSize: number;
  };
  race: {
    totalLaps: number;
    countdownDuration: number;
  };
  camera: {
    distance: number;
    height: number;
    lookAhead: number;
    positionDamping: number;
    rotationDamping: number;
    minFov: number;
    maxFov: number;
  };
  track: {
    width: number;
    segments: number;
    barrierHeight: number;
    barrierWidth: number;
  };
}

export const GAME_CONFIG: GameConfig = {
  physics: {
    fixedStep: 1 / 60,
    maxSubSteps: 5,
    gravity: 9.81
  },
  graphics: {
    maxPixelRatio: 1.5,
    shadowMapSize: 2048
  },
  race: {
    totalLaps: 3,
    countdownDuration: 3.0
  },
  camera: {
    distance: 5.8,
    height: 2.1,
    lookAhead: 3.5,
    positionDamping: 8.0,
    rotationDamping: 6.0,
    minFov: 60.0,
    maxFov: 78.0
  },
  track: {
    width: 14.0,
    segments: 300,
    barrierHeight: 1.2,
    barrierWidth: 0.8
  }
};

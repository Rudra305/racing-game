export enum AIDifficultyLevel {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  EXPERT = 'EXPERT'
}

export interface RubberBandingConfig {
  enabled: boolean;
  strength: number; // 0.0 to 1.0 (default 0)
}

export interface RaceConfig {
  laps: number;
  aiCount: number;
  countdownDuration: number;
  difficulty: AIDifficultyLevel;
  timeLimit?: number;
  allowRestart: boolean;
  rubberBanding: RubberBandingConfig;
}

export const DEFAULT_RACE_CONFIG: RaceConfig = {
  laps: 3,
  aiCount: 5, // 5 AI + 1 Player = 6 cars on grid
  countdownDuration: 3.0,
  difficulty: AIDifficultyLevel.NORMAL,
  allowRestart: true,
  rubberBanding: {
    enabled: false,
    strength: 0
  }
};

import { AIDifficultyLevel } from '../race/RaceConfig';

export interface AIDifficultyProfile {
  targetSpeedFactor: number;
  steeringSmoothing: number;
  lookAheadFactor: number;
  lineOffsetMax: number;
  brakingAggression: number;
  recoverySpeed: number;
  cornerExitAggression: number;
}

export const AI_DIFFICULTY_PROFILES: Record<AIDifficultyLevel, AIDifficultyProfile> = {
  [AIDifficultyLevel.EASY]: {
    targetSpeedFactor: 0.88,
    steeringSmoothing: 6.2,
    lookAheadFactor: 0.88,
    lineOffsetMax: 1.4,
    brakingAggression: 0.80,
    recoverySpeed: 0.75,
    cornerExitAggression: 0.82
  },
  [AIDifficultyLevel.NORMAL]: {
    targetSpeedFactor: 0.94,
    steeringSmoothing: 8.5,
    lookAheadFactor: 1.0,
    lineOffsetMax: 0.7,
    brakingAggression: 0.92,
    recoverySpeed: 0.90,
    cornerExitAggression: 0.92
  },
  [AIDifficultyLevel.HARD]: {
    targetSpeedFactor: 0.98,
    steeringSmoothing: 11.5,
    lookAheadFactor: 1.08,
    lineOffsetMax: 0.28,
    brakingAggression: 0.98,
    recoverySpeed: 1.05,
    cornerExitAggression: 0.98
  },
  [AIDifficultyLevel.EXPERT]: {
    targetSpeedFactor: 1.00,
    steeringSmoothing: 14.5,
    lookAheadFactor: 1.15,
    lineOffsetMax: 0.08,
    brakingAggression: 1.04,
    recoverySpeed: 1.20,
    cornerExitAggression: 1.00
  }
};

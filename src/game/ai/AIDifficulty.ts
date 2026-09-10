import { AIDifficultyLevel } from '../race/RaceConfig';

export interface AIDifficultyProfile {
  targetSpeedFactor: number;
  steeringSmoothing: number;
  lookAheadFactor: number;
  lineOffsetMax: number;
  brakingAggression: number;
  recoverySpeed: number;
}

export const AI_DIFFICULTY_PROFILES: Record<AIDifficultyLevel, AIDifficultyProfile> = {
  [AIDifficultyLevel.EASY]: {
    targetSpeedFactor: 0.76,
    steeringSmoothing: 6.0,
    lookAheadFactor: 0.85,
    lineOffsetMax: 1.6,
    brakingAggression: 0.80,
    recoverySpeed: 0.75
  },
  [AIDifficultyLevel.NORMAL]: {
    targetSpeedFactor: 0.88,
    steeringSmoothing: 8.5,
    lookAheadFactor: 1.0,
    lineOffsetMax: 0.8,
    brakingAggression: 0.92,
    recoverySpeed: 0.90
  },
  [AIDifficultyLevel.HARD]: {
    targetSpeedFactor: 0.96,
    steeringSmoothing: 11.0,
    lookAheadFactor: 1.1,
    lineOffsetMax: 0.3,
    brakingAggression: 1.0,
    recoverySpeed: 1.0
  },
  [AIDifficultyLevel.EXPERT]: {
    targetSpeedFactor: 1.02,
    steeringSmoothing: 14.0,
    lookAheadFactor: 1.2,
    lineOffsetMax: 0.05,
    brakingAggression: 1.08,
    recoverySpeed: 1.15
  }
};

import { AIDifficultyLevel } from '../race/RaceConfig';

export interface AIDifficultyProfile {
  targetSpeedFactor: number;
  maxSpeedCapMs: number;
  brakingAggression: number;
  brakingDistanceMultiplier: number;
  racingLineStrictness: number;
  apexStrictness: number;
  lineOffsetMax: number;
  driverLineOffsetMax: number;
  overtakeAggression: number;
  cornerExitAggression: number;
  steeringP: number;
  steeringD: number;
  crossTrackK: number;
  steeringSmoothing: number;
  lookAheadFactor: number;
  recoverySpeed: number;
  errorProbability: number;
  errorIntensity: number;
}

export const AI_DIFFICULTY_PROFILES: Record<AIDifficultyLevel, AIDifficultyProfile> = {
  [AIDifficultyLevel.EASY]: {
    targetSpeedFactor: 1.0,
    maxSpeedCapMs: 999.0,
    brakingAggression: 0.72,
    brakingDistanceMultiplier: 1.25,
    racingLineStrictness: 0.50,
    apexStrictness: 0.50,
    lineOffsetMax: 0.90,
    driverLineOffsetMax: 0.90,
    overtakeAggression: 0.35,
    cornerExitAggression: 0.78,
    steeringP: 1.5,
    steeringD: 0.22,
    crossTrackK: 0.65,
    steeringSmoothing: 15.0,
    lookAheadFactor: 0.96,
    recoverySpeed: 0.90,
    errorProbability: 0.04,
    errorIntensity: 0.25
  },
  [AIDifficultyLevel.NORMAL]: {
    targetSpeedFactor: 1.0,
    maxSpeedCapMs: 999.0,
    brakingAggression: 0.88,
    brakingDistanceMultiplier: 1.10,
    racingLineStrictness: 0.80,
    apexStrictness: 0.80,
    lineOffsetMax: 0.45,
    driverLineOffsetMax: 0.45,
    overtakeAggression: 0.70,
    cornerExitAggression: 0.90,
    steeringP: 1.9,
    steeringD: 0.24,
    crossTrackK: 0.85,
    steeringSmoothing: 19.0,
    lookAheadFactor: 1.00,
    recoverySpeed: 1.00,
    errorProbability: 0.015,
    errorIntensity: 0.15
  },
  [AIDifficultyLevel.HARD]: {
    targetSpeedFactor: 1.0,
    maxSpeedCapMs: 999.0,
    brakingAggression: 0.98,
    brakingDistanceMultiplier: 1.00,
    racingLineStrictness: 0.95,
    apexStrictness: 0.95,
    lineOffsetMax: 0.15,
    driverLineOffsetMax: 0.15,
    overtakeAggression: 0.92,
    cornerExitAggression: 1.00,
    steeringP: 2.4,
    steeringD: 0.26,
    crossTrackK: 1.08,
    steeringSmoothing: 24.0,
    lookAheadFactor: 1.06,
    recoverySpeed: 1.15,
    errorProbability: 0.003,
    errorIntensity: 0.06
  },
  [AIDifficultyLevel.EXPERT]: {
    targetSpeedFactor: 1.0,
    maxSpeedCapMs: 999.0,
    brakingAggression: 1.00,
    brakingDistanceMultiplier: 0.96,
    racingLineStrictness: 1.00,
    apexStrictness: 1.00,
    lineOffsetMax: 0.0,
    driverLineOffsetMax: 0.0,
    overtakeAggression: 1.00,
    cornerExitAggression: 1.00,
    steeringP: 2.7,
    steeringD: 0.28,
    crossTrackK: 1.25,
    steeringSmoothing: 28.0,
    lookAheadFactor: 1.12,
    recoverySpeed: 1.25,
    errorProbability: 0.0,
    errorIntensity: 0.0
  }
};

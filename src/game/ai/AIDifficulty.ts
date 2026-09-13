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
    targetSpeedFactor: 0.78,
    maxSpeedCapMs: 38.0,
    brakingAggression: 0.65,
    brakingDistanceMultiplier: 1.35,
    racingLineStrictness: 0.40,
    apexStrictness: 0.40,
    lineOffsetMax: 1.2,
    driverLineOffsetMax: 1.2,
    overtakeAggression: 0.30,
    cornerExitAggression: 0.70,
    steeringP: 1.4,
    steeringD: 0.22,
    crossTrackK: 0.60,
    steeringSmoothing: 14.0,
    lookAheadFactor: 0.95,
    recoverySpeed: 0.85,
    errorProbability: 0.06,
    errorIntensity: 0.35
  },
  [AIDifficultyLevel.NORMAL]: {
    targetSpeedFactor: 0.91,
    maxSpeedCapMs: 48.0,
    brakingAggression: 0.85,
    brakingDistanceMultiplier: 1.12,
    racingLineStrictness: 0.75,
    apexStrictness: 0.75,
    lineOffsetMax: 0.6,
    driverLineOffsetMax: 0.6,
    overtakeAggression: 0.65,
    cornerExitAggression: 0.88,
    steeringP: 1.8,
    steeringD: 0.24,
    crossTrackK: 0.80,
    steeringSmoothing: 18.0,
    lookAheadFactor: 1.00,
    recoverySpeed: 1.00,
    errorProbability: 0.02,
    errorIntensity: 0.20
  },
  [AIDifficultyLevel.HARD]: {
    targetSpeedFactor: 1.00,
    maxSpeedCapMs: 72.0,
    brakingAggression: 0.98,
    brakingDistanceMultiplier: 0.98,
    racingLineStrictness: 0.95,
    apexStrictness: 0.95,
    lineOffsetMax: 0.20,
    driverLineOffsetMax: 0.20,
    overtakeAggression: 0.90,
    cornerExitAggression: 1.00,
    steeringP: 2.3,
    steeringD: 0.26,
    crossTrackK: 1.05,
    steeringSmoothing: 24.0,
    lookAheadFactor: 1.06,
    recoverySpeed: 1.15,
    errorProbability: 0.005,
    errorIntensity: 0.08
  },
  [AIDifficultyLevel.EXPERT]: {
    targetSpeedFactor: 1.06,
    maxSpeedCapMs: 999.0,
    brakingAggression: 1.00,
    brakingDistanceMultiplier: 0.92,
    racingLineStrictness: 1.00,
    apexStrictness: 1.00,
    lineOffsetMax: 0.05,
    driverLineOffsetMax: 0.05,
    overtakeAggression: 1.00,
    cornerExitAggression: 1.08,
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

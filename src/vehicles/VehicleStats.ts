import { VehicleDefinition } from './VehicleDefinition';

export interface VehicleStats {
  topSpeed: number;     // 0–100
  acceleration: number; // 0–100
  braking: number;      // 0–100
  handling: number;     // 0–100
  grip: number;         // 0–100
  stability: number;    // 0–100
}

export interface StatDelta {
  key: keyof VehicleStats;
  label: string;
  current: number;
  target: number;
  delta: number; // target - current
}

/**
 * Calculates normalized 0–100 gameplay statistics from canonical physics config.
 */
export function calculateVehicleStats(def: VehicleDefinition): VehicleStats {
  const cfg = def.config;
  const massTonnes = Math.max(0.6, cfg.mass / 1000);

  // 1. Top Speed (Theoretical aero equilibrium + gear/redline ceiling)
  // Benchmark: 180 km/h = 45, 270 km/h = 75, 360 km/h = 98
  const aeroFactor = cfg.aerodynamics.dragCoefficient * cfg.aerodynamics.frontalArea;
  const powerAeroRatio = cfg.engine.power / Math.max(0.4, aeroFactor);
  const rawTopSpeed = Math.pow(powerAeroRatio, 0.333) * 38.0;
  const topSpeed = Math.round(Math.min(100, Math.max(30, (rawTopSpeed - 140) / (380 - 140) * 100)));

  // 2. Acceleration (Power-to-weight ratio & peak torque density)
  // Benchmark: 150 kW/t = 50, 300 kW/t = 75, 900 kW/t = 98
  const powerToWeight = cfg.engine.power / massTonnes;
  const torqueWeight = cfg.engine.peakTorque / massTonnes;
  const rawAccel = powerToWeight * 0.65 + torqueWeight * 0.35;
  const acceleration = Math.round(Math.min(100, Math.max(35, (rawAccel - 120) / (850 - 120) * 100)));

  // 3. Braking (Deceleration power normalized by mass)
  const brakeEffectiveness = (cfg.braking.brakePower * 1.5) / massTonnes;
  const braking = Math.round(Math.min(100, Math.max(40, (brakeEffectiveness - 35) / (220 - 35) * 100)));

  // 4. Handling (Steer angular rate, agility vs wheelbase, and high-speed stability)
  const agility = (cfg.handling.steeringSpeed * 12.0) / Math.max(2.0, cfg.dimensions.wheelBase);
  const handling = Math.round(Math.min(100, Math.max(35, (agility - 10) / (32 - 10) * 100)));

  // 5. Grip (Tire compound grip + aerodynamic downforce coefficient)
  const totalGripScore = cfg.handling.baseGrip * 1.8 + cfg.aerodynamics.downforceCoefficient * 22.0;
  const grip = Math.round(Math.min(100, Math.max(35, (totalGripScore - 40) / (120 - 40) * 100)));

  // 6. Stability (Inertia resistance, track width ratio, and anti-roll bar stiffness)
  const trackRatio = cfg.dimensions.trackWidth / Math.max(1.0, cfg.dimensions.height);
  const rollResist = cfg.suspension.antiRollBar * 1.5;
  const rawStability = trackRatio * 25.0 + rollResist * 1.2 + (massTonnes > 1.6 ? 20 : 10);
  const stability = Math.round(Math.min(100, Math.max(40, (rawStability - 35) / (85 - 35) * 100)));

  return {
    topSpeed,
    acceleration,
    braking,
    handling,
    grip,
    stability
  };
}

export const STAT_LABELS: Record<keyof VehicleStats, string> = {
  topSpeed: 'Top Speed',
  acceleration: 'Acceleration',
  braking: 'Braking',
  handling: 'Handling',
  grip: 'Grip',
  stability: 'Stability'
};

/**
 * Computes delta comparisons between current vehicle and another vehicle.
 */
export function compareVehicleStats(current: VehicleStats, target: VehicleStats): StatDelta[] {
  const keys: (keyof VehicleStats)[] = ['topSpeed', 'acceleration', 'braking', 'handling', 'grip', 'stability'];

  return keys.map((key) => ({
    key,
    label: STAT_LABELS[key],
    current: current[key],
    target: target[key],
    delta: target[key] - current[key]
  }));
}

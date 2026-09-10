export type DrivetrainType = 'RWD' | 'FWD' | 'AWD';

export interface VehicleConfig {
  name: string;
  mass: number; // kg

  dimensions: {
    length: number;
    width: number;
    height: number;
    wheelRadius: number;
    wheelWidth: number;
    wheelBase: number;
    trackWidth: number;
  };

  engine: {
    power: number; // kW or scaling factor
    peakTorque: number; // Nm
    idleRPM: number;
    maxRPM: number;
    redlineRPM: number;
  };

  transmission: {
    gears: number;
    gearRatios: number[]; // e.g. [3.82, 2.36, 1.69, 1.31, 1.00, 0.79]
    reverseRatio: number;
    finalDrive: number;
    shiftUpRPM: number;
    shiftDownRPM: number;
    shiftTime: number; // seconds
    driveType: DrivetrainType;
    torqueBias: number; // 0.0 = full front, 1.0 = full rear, 0.7 = 70% rear
  };

  handling: {
    maxSteerAngle: number; // in radians
    steeringSpeed: number;
    returnSpeed: number;
    highSpeedThreshold: number; // km/h
    highSpeedReduction: number; // factor
    baseGrip: number;
    driftGrip: number;
  };

  braking: {
    brakePower: number;
    handbrakePower: number;
    frontBias: number; // 0.6 = 60% front, 40% rear
  };

  suspension: {
    stiffness: number; // N/m equivalent
    damping: number;
    maxTravel: number; // meters
    restLength: number;
    antiRollBar: number;
  };

  aerodynamics: {
    dragCoefficient: number;
    frontalArea: number;
    downforceCoefficient: number;
  };
}

/**
 * Sports Car (Default Balanced Racing Experience)
 */
export const SPORTS_CAR_CONFIG: VehicleConfig = {
  name: 'Apex GT-R',
  mass: 1420,

  dimensions: {
    length: 4.3,
    width: 1.9,
    height: 1.15,
    wheelRadius: 0.36,
    wheelWidth: 0.28,
    wheelBase: 2.65,
    trackWidth: 1.62
  },

  engine: {
    power: 420,
    peakTorque: 510,
    idleRPM: 1000,
    maxRPM: 8200,
    redlineRPM: 7400
  },

  transmission: {
    gears: 6,
    gearRatios: [3.82, 2.36, 1.69, 1.31, 1.00, 0.79],
    reverseRatio: 3.45,
    finalDrive: 3.73,
    shiftUpRPM: 7100,
    shiftDownRPM: 3200,
    shiftTime: 0.14,
    driveType: 'RWD',
    torqueBias: 0.85
  },

  handling: {
    maxSteerAngle: 0.52, // ~30 deg
    steeringSpeed: 4.8,
    returnSpeed: 6.2,
    highSpeedThreshold: 130,
    highSpeedReduction: 0.48,
    baseGrip: 26.0,
    driftGrip: 11.5
  },

  braking: {
    brakePower: 75.0,
    handbrakePower: 95.0,
    frontBias: 0.62
  },

  suspension: {
    stiffness: 38.0,
    damping: 6.5,
    maxTravel: 0.18,
    restLength: 0.36,
    antiRollBar: 8.0
  },

  aerodynamics: {
    dragCoefficient: 0.31,
    frontalArea: 2.15,
    downforceCoefficient: 0.42
  }
};

/**
 * Supercar (Extreme Power, High Downforce & Top Speed)
 */
export const SUPERCAR_CONFIG: VehicleConfig = {
  name: 'Veloce Hyperion',
  mass: 1280,

  dimensions: {
    length: 4.5,
    width: 2.02,
    height: 1.08,
    wheelRadius: 0.37,
    wheelWidth: 0.32,
    wheelBase: 2.75,
    trackWidth: 1.72
  },

  engine: {
    power: 650,
    peakTorque: 760,
    idleRPM: 1200,
    maxRPM: 9200,
    redlineRPM: 8500
  },

  transmission: {
    gears: 7,
    gearRatios: [3.91, 2.52, 1.84, 1.42, 1.15, 0.94, 0.76],
    reverseRatio: 3.50,
    finalDrive: 3.55,
    shiftUpRPM: 8200,
    shiftDownRPM: 3800,
    shiftTime: 0.08,
    driveType: 'AWD',
    torqueBias: 0.70
  },

  handling: {
    maxSteerAngle: 0.46,
    steeringSpeed: 5.6,
    returnSpeed: 7.5,
    highSpeedThreshold: 160,
    highSpeedReduction: 0.55,
    baseGrip: 32.0,
    driftGrip: 13.0
  },

  braking: {
    brakePower: 95.0,
    handbrakePower: 110.0,
    frontBias: 0.65
  },

  suspension: {
    stiffness: 48.0,
    damping: 8.5,
    maxTravel: 0.12,
    restLength: 0.34,
    antiRollBar: 12.0
  },

  aerodynamics: {
    dragCoefficient: 0.28,
    frontalArea: 2.05,
    downforceCoefficient: 0.85
  }
};

/**
 * Rally Car (High Suspension Travel, Loose Surface Drift King)
 */
export const RALLY_CONFIG: VehicleConfig = {
  name: 'Crossfire Rally',
  mass: 1220,

  dimensions: {
    length: 4.05,
    width: 1.84,
    height: 1.35,
    wheelRadius: 0.35,
    wheelWidth: 0.26,
    wheelBase: 2.50,
    trackWidth: 1.58
  },

  engine: {
    power: 360,
    peakTorque: 580,
    idleRPM: 1100,
    maxRPM: 7800,
    redlineRPM: 7000
  },

  transmission: {
    gears: 6,
    gearRatios: [4.15, 2.78, 1.98, 1.52, 1.20, 0.96],
    reverseRatio: 3.80,
    finalDrive: 4.10,
    shiftUpRPM: 6700,
    shiftDownRPM: 3000,
    shiftTime: 0.10,
    driveType: 'AWD',
    torqueBias: 0.50
  },

  handling: {
    maxSteerAngle: 0.58,
    steeringSpeed: 5.2,
    returnSpeed: 6.8,
    highSpeedThreshold: 110,
    highSpeedReduction: 0.40,
    baseGrip: 24.0,
    driftGrip: 15.0
  },

  braking: {
    brakePower: 70.0,
    handbrakePower: 105.0,
    frontBias: 0.58
  },

  suspension: {
    stiffness: 26.0,
    damping: 5.2,
    maxTravel: 0.28,
    restLength: 0.44,
    antiRollBar: 5.5
  },

  aerodynamics: {
    dragCoefficient: 0.36,
    frontalArea: 2.25,
    downforceCoefficient: 0.35
  }
};

/**
 * Formula (Extreme Downforce & Razor-sharp Reflexes)
 */
export const FORMULA_CONFIG: VehicleConfig = {
  name: 'Aero 1 Single-Seater',
  mass: 798,

  dimensions: {
    length: 5.1,
    width: 2.0,
    height: 0.95,
    wheelRadius: 0.36,
    wheelWidth: 0.38,
    wheelBase: 3.5,
    trackWidth: 1.7
  },

  engine: {
    power: 740,
    peakTorque: 620,
    idleRPM: 2500,
    maxRPM: 12500,
    redlineRPM: 11800
  },

  transmission: {
    gears: 8,
    gearRatios: [3.40, 2.45, 1.92, 1.55, 1.30, 1.10, 0.95, 0.82],
    reverseRatio: 3.20,
    finalDrive: 3.60,
    shiftUpRPM: 11500,
    shiftDownRPM: 6000,
    shiftTime: 0.04,
    driveType: 'RWD',
    torqueBias: 1.0
  },

  handling: {
    maxSteerAngle: 0.40,
    steeringSpeed: 7.5,
    returnSpeed: 9.0,
    highSpeedThreshold: 180,
    highSpeedReduction: 0.65,
    baseGrip: 42.0,
    driftGrip: 12.0
  },

  braking: {
    brakePower: 120.0,
    handbrakePower: 80.0,
    frontBias: 0.68
  },

  suspension: {
    stiffness: 65.0,
    damping: 12.0,
    maxTravel: 0.08,
    restLength: 0.30,
    antiRollBar: 18.0
  },

  aerodynamics: {
    dragCoefficient: 0.45,
    frontalArea: 1.65,
    downforceCoefficient: 2.20
  }
};

export const VEHICLE_PRESETS: Record<string, VehicleConfig> = {
  'Sports': SPORTS_CAR_CONFIG,
  'Supercar': SUPERCAR_CONFIG,
  'Rally': RALLY_CONFIG,
  'Formula': FORMULA_CONFIG
};

export const DEFAULT_VEHICLE_CONFIG: VehicleConfig = SPORTS_CAR_CONFIG;

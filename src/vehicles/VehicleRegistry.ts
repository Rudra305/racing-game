import { VehicleCategory } from './VehicleCategory';
import { VehicleDefinition } from './VehicleDefinition';
import { getDefaultCustomization } from './VehicleCustomization';

export class VehicleRegistry {
  private static definitions: Map<string, VehicleDefinition> = new Map();
  private static initialized: boolean = false;

  public static initialize(): void {
    if (this.initialized) return;

    // 1. SPORTS CARS
    this.register({
      id: 'sports_apex_s1',
      name: 'Apex S1',
      category: VehicleCategory.SPORTS,
      config: {
        name: 'Apex S1',
        mass: 1420,
        dimensions: {
          length: 4.35,
          width: 1.88,
          height: 1.18,
          wheelRadius: 0.36,
          wheelWidth: 0.27,
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
          maxSteerAngle: 0.52,
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
      },
      visuals: {
        bodyType: 'sports',
        modelAssetId: 'muscle-car-60s',
        modelUrl: '/assets/models/polyfork/vehicles/muscle-car-60s.glb',
        defaultColors: getDefaultCustomization(0x1f6feb, 0x090d13, 0x58a6ff, 'sport_mesh', 0xc9d1d9),
        defaultWheel: { style: 'sport_mesh', color: 0xc9d1d9 }
      },
      meta: {
        role: 'Balanced All-Rounder',
        strengths: ['Predictable handling', 'Linear power curve', 'Forgiving corner recovery'],
        weaknesses: ['Moderate peak top speed', 'Standard gravel grip'],
        recommendedTerrain: 'Asphalt circuits & coastal roads',
        difficulty: 'Novice',
        description: 'The benchmark modern sports coupe. Combines a punchy twin-turbo V6 with a responsive chassis for intuitive cornering.'
      },
      availability: { unlocked: true }
    });

    this.register({
      id: 'sports_vortex_gt',
      name: 'Vortex GT',
      category: VehicleCategory.SPORTS,
      config: {
        name: 'Vortex GT',
        mass: 1310,
        dimensions: {
          length: 4.25,
          width: 1.85,
          height: 1.16,
          wheelRadius: 0.35,
          wheelWidth: 0.26,
          wheelBase: 2.58,
          trackWidth: 1.60
        },
        engine: {
          power: 390,
          peakTorque: 480,
          idleRPM: 1100,
          maxRPM: 8500,
          redlineRPM: 7800
        },
        transmission: {
          gears: 6,
          gearRatios: [3.95, 2.45, 1.75, 1.35, 1.05, 0.84],
          reverseRatio: 3.50,
          finalDrive: 3.90,
          shiftUpRPM: 7500,
          shiftDownRPM: 3400,
          shiftTime: 0.12,
          driveType: 'RWD',
          torqueBias: 0.90
        },
        handling: {
          maxSteerAngle: 0.54,
          steeringSpeed: 5.2,
          returnSpeed: 6.8,
          highSpeedThreshold: 125,
          highSpeedReduction: 0.45,
          baseGrip: 27.5,
          driftGrip: 12.5
        },
        braking: {
          brakePower: 78.0,
          handbrakePower: 98.0,
          frontBias: 0.60
        },
        suspension: {
          stiffness: 42.0,
          damping: 7.0,
          maxTravel: 0.16,
          restLength: 0.35,
          antiRollBar: 9.0
        },
        aerodynamics: {
          dragCoefficient: 0.30,
          frontalArea: 2.05,
          downforceCoefficient: 0.48
        }
      },
      visuals: {
        bodyType: 'sports',
        modelAssetId: 'race-car',
        modelUrl: '/assets/models/vehicles/race-car.gltf',
        defaultColors: getDefaultCustomization(0xd29922, 0x161b22, 0xff7b72, 'turbofan', 0x161b22),
        defaultWheel: { style: 'turbofan', color: 0x161b22 }
      },
      meta: {
        role: 'Agile Lightweight Tuner',
        strengths: ['High-RPM power', 'Nimble turn-in', 'Responsive throttle balance'],
        weaknesses: ['Snap oversteer under wet conditions', 'Firm ride'],
        recommendedTerrain: 'Technical twisty circuits',
        difficulty: 'Intermediate',
        description: 'A focused, lightweight sports car built for agile cornering and razor-sharp apex transitions.'
      },
      availability: { unlocked: true }
    });

    // 2. SUPERCAR CATEGORY
    this.register({
      id: 'supercar_venom_hyperion',
      name: 'Venom Hyperion',
      category: VehicleCategory.SUPERCAR,
      config: {
        name: 'Venom Hyperion',
        mass: 1280,
        dimensions: {
          length: 4.55,
          width: 2.02,
          height: 1.08,
          wheelRadius: 0.37,
          wheelWidth: 0.32,
          wheelBase: 2.75,
          trackWidth: 1.72
        },
        engine: {
          power: 670,
          peakTorque: 780,
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
      },
      visuals: {
        bodyType: 'supercar',
        modelAssetId: 'ferrari-gt',
        modelUrl: '/assets/models/vehicles/ferrari-gt.glb',
        modelRotationY: Math.PI,
        modelOffsetY: 0.02,
        defaultColors: getDefaultCustomization(0xd73a49, 0x090d13, 0xf85149, 'sport_mesh', 0x161b22),
        defaultWheel: { style: 'sport_mesh', color: 0x161b22 }
      },
      meta: {
        role: 'High-Performance Road Racing',
        strengths: ['V12 acceleration', 'High top speed (>330 km/h)', 'Active aero stability'],
        weaknesses: ['Demands precise throttle on exit', 'Low ground clearance'],
        recommendedTerrain: 'High-speed circuits & coastal asphalt',
        difficulty: 'Intermediate',
        description: 'A mid-engine aerodynamic hypercar that harnesses immense downforce and carbon-ceramic braking to dominate straights and sweeps.'
      },
      availability: { unlocked: true }
    });

    this.register({
      id: 'supercar_astraea_stradale',
      name: 'Astraea Stradale',
      category: VehicleCategory.SUPERCAR,
      config: {
        name: 'Astraea Stradale',
        mass: 1340,
        dimensions: {
          length: 4.60,
          width: 2.05,
          height: 1.06,
          wheelRadius: 0.37,
          wheelWidth: 0.33,
          wheelBase: 2.78,
          trackWidth: 1.74
        },
        engine: {
          power: 720,
          peakTorque: 840,
          idleRPM: 1300,
          maxRPM: 9600,
          redlineRPM: 8800
        },
        transmission: {
          gears: 7,
          gearRatios: [3.85, 2.48, 1.80, 1.38, 1.10, 0.90, 0.72],
          reverseRatio: 3.40,
          finalDrive: 3.42,
          shiftUpRPM: 8500,
          shiftDownRPM: 4000,
          shiftTime: 0.07,
          driveType: 'AWD',
          torqueBias: 0.65
        },
        handling: {
          maxSteerAngle: 0.45,
          steeringSpeed: 5.8,
          returnSpeed: 7.8,
          highSpeedThreshold: 170,
          highSpeedReduction: 0.58,
          baseGrip: 33.5,
          driftGrip: 13.5
        },
        braking: {
          brakePower: 98.0,
          handbrakePower: 115.0,
          frontBias: 0.66
        },
        suspension: {
          stiffness: 52.0,
          damping: 9.0,
          maxTravel: 0.11,
          restLength: 0.33,
          antiRollBar: 13.5
        },
        aerodynamics: {
          dragCoefficient: 0.27,
          frontalArea: 2.00,
          downforceCoefficient: 0.95
        }
      },
      visuals: {
        bodyType: 'supercar',
        defaultColors: getDefaultCustomization(0x8957e5, 0x0d1117, 0x388bfd, 'turbofan', 0x30363d),
        defaultWheel: { style: 'turbofan', color: 0x30363d }
      },
      meta: {
        role: 'Aerodynamic Hyper-Weapon',
        strengths: ['Top-tier acceleration', 'Massive high-speed downforce', 'AWD traction'],
        weaknesses: ['Heavy penalty off-track', 'Sensitive steering'],
        recommendedTerrain: 'Smooth asphalt racetracks',
        difficulty: 'Expert',
        description: 'An aggressive hybrid hypercar engineered for devastating corner exits and relentless high-speed stability.'
      },
      availability: { unlocked: true }
    });

    // 3. RALLY CATEGORY
    this.register({
      id: 'rally_terra_r1',
      name: 'Terra R1',
      category: VehicleCategory.RALLY,
      config: {
        name: 'Terra R1',
        mass: 1220,
        dimensions: {
          length: 4.10,
          width: 1.84,
          height: 1.34,
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
      },
      visuals: {
        bodyType: 'rally',
        modelAssetId: 'hatchback-80s',
        modelUrl: '/assets/models/polyfork/vehicles/hatchback-80s.glb',
        defaultColors: getDefaultCustomization(0x238636, 0x161b22, 0xe3b341, 'offroad_beadlock', 0xf0f6fc),
        defaultWheel: { style: 'offroad_beadlock', color: 0xf0f6fc }
      },
      meta: {
        role: 'Mixed-Surface / Off-Road Racing',
        strengths: ['Massive suspension travel', 'Predictable slide control', 'Punchy low-gear acceleration'],
        weaknesses: ['Limited top speed on asphalt', 'Noticeable body roll'],
        recommendedTerrain: 'Alpine gravel, dirt, and rough surfaces',
        difficulty: 'Novice',
        description: 'The quintessential stage rally car. Absorbs bumps and crests effortlessly while maintaining controlled sideways slides.'
      },
      availability: { unlocked: true }
    });

    this.register({
      id: 'rally_crossfire_rx',
      name: 'Crossfire RX',
      category: VehicleCategory.RALLY,
      config: {
        name: 'Crossfire RX',
        mass: 1260,
        dimensions: {
          length: 4.18,
          width: 1.88,
          height: 1.32,
          wheelRadius: 0.36,
          wheelWidth: 0.28,
          wheelBase: 2.54,
          trackWidth: 1.62
        },
        engine: {
          power: 410,
          peakTorque: 640,
          idleRPM: 1200,
          maxRPM: 8200,
          redlineRPM: 7400
        },
        transmission: {
          gears: 6,
          gearRatios: [3.95, 2.65, 1.88, 1.45, 1.15, 0.92],
          reverseRatio: 3.70,
          finalDrive: 3.95,
          shiftUpRPM: 7100,
          shiftDownRPM: 3200,
          shiftTime: 0.09,
          driveType: 'AWD',
          torqueBias: 0.55
        },
        handling: {
          maxSteerAngle: 0.56,
          steeringSpeed: 5.4,
          returnSpeed: 7.0,
          highSpeedThreshold: 115,
          highSpeedReduction: 0.42,
          baseGrip: 25.5,
          driftGrip: 15.5
        },
        braking: {
          brakePower: 76.0,
          handbrakePower: 112.0,
          frontBias: 0.59
        },
        suspension: {
          stiffness: 29.0,
          damping: 5.8,
          maxTravel: 0.25,
          restLength: 0.42,
          antiRollBar: 6.5
        },
        aerodynamics: {
          dragCoefficient: 0.35,
          frontalArea: 2.30,
          downforceCoefficient: 0.45
        }
      },
      visuals: {
        bodyType: 'rally',
        modelAssetId: 'hatchback-80s',
        modelUrl: '/assets/models/polyfork/vehicles/hatchback-80s.glb',
        defaultColors: getDefaultCustomization(0xf0883e, 0x090d13, 0x58a6ff, 'sport_mesh', 0xe3b341),
        defaultWheel: { style: 'sport_mesh', color: 0xe3b341 }
      },
      meta: {
        role: 'Widebody Rallycross Weapon',
        strengths: ['Violent launch torque', 'High surface adaptability', 'Aggressive drift control'],
        weaknesses: ['Slightly stiffer over deep ruts'],
        recommendedTerrain: 'Mixed dirt & asphalt circuits',
        difficulty: 'Intermediate',
        description: 'A widebody rallycross machine designed for bumper-to-bumper combat on asphalt/dirt hybrid courses.'
      },
      availability: { unlocked: true }
    });

    // 4. SUV CATEGORY
    this.register({
      id: 'suv_titan_overland',
      name: 'Titan Overland',
      category: VehicleCategory.SUV,
      config: {
        name: 'Titan Overland',
        mass: 2250,
        dimensions: {
          length: 4.85,
          width: 2.05,
          height: 1.75,
          wheelRadius: 0.44,
          wheelWidth: 0.32,
          wheelBase: 2.95,
          trackWidth: 1.76
        },
        engine: {
          power: 350,
          peakTorque: 680,
          idleRPM: 850,
          maxRPM: 6500,
          redlineRPM: 5800
        },
        transmission: {
          gears: 6,
          gearRatios: [4.40, 2.85, 1.95, 1.45, 1.10, 0.85],
          reverseRatio: 4.00,
          finalDrive: 4.25,
          shiftUpRPM: 5500,
          shiftDownRPM: 2400,
          shiftTime: 0.20,
          driveType: 'AWD',
          torqueBias: 0.50
        },
        handling: {
          maxSteerAngle: 0.48,
          steeringSpeed: 3.6,
          returnSpeed: 4.8,
          highSpeedThreshold: 100,
          highSpeedReduction: 0.38,
          baseGrip: 22.0,
          driftGrip: 13.0
        },
        braking: {
          brakePower: 82.0,
          handbrakePower: 92.0,
          frontBias: 0.65
        },
        suspension: {
          stiffness: 35.0,
          damping: 7.2,
          maxTravel: 0.32,
          restLength: 0.52,
          antiRollBar: 7.0
        },
        aerodynamics: {
          dragCoefficient: 0.42,
          frontalArea: 2.95,
          downforceCoefficient: 0.20
        }
      },
      visuals: {
        bodyType: 'suv',
        modelAssetId: 'suburban-pickup',
        modelUrl: '/assets/models/polyfork/vehicles/suburban-pickup.glb',
        defaultColors: getDefaultCustomization(0x388bfd, 0x161b22, 0x8b949e, 'offroad_beadlock', 0x161b22),
        defaultWheel: { style: 'offroad_beadlock', color: 0x161b22 }
      },
      meta: {
        role: 'Heavy Expedition All-Terrain',
        strengths: ['Unshakeable stability', 'Immense collision inertia', 'Smooth rough terrain absorption'],
        weaknesses: ['High braking distances', 'Sluggish acceleration', 'High center of gravity'],
        recommendedTerrain: 'Rough mountain passes & off-road trails',
        difficulty: 'Novice',
        description: 'A rugged 4x4 powerhouse built to conquer rough mountain elevation and shrug off heavy vehicle contact.'
      },
      availability: { unlocked: true }
    });

    this.register({
      id: 'suv_kodiak_sport_rs',
      name: 'Kodiak Sport RS',
      category: VehicleCategory.SUV,
      config: {
        name: 'Kodiak Sport RS',
        mass: 1980,
        dimensions: {
          length: 4.75,
          width: 2.00,
          height: 1.62,
          wheelRadius: 0.42,
          wheelWidth: 0.30,
          wheelBase: 2.88,
          trackWidth: 1.72
        },
        engine: {
          power: 490,
          peakTorque: 720,
          idleRPM: 950,
          maxRPM: 7400,
          redlineRPM: 6800
        },
        transmission: {
          gears: 7,
          gearRatios: [4.10, 2.65, 1.85, 1.40, 1.10, 0.90, 0.75],
          reverseRatio: 3.75,
          finalDrive: 3.85,
          shiftUpRPM: 6400,
          shiftDownRPM: 2800,
          shiftTime: 0.12,
          driveType: 'AWD',
          torqueBias: 0.60
        },
        handling: {
          maxSteerAngle: 0.50,
          steeringSpeed: 4.2,
          returnSpeed: 5.5,
          highSpeedThreshold: 120,
          highSpeedReduction: 0.42,
          baseGrip: 24.5,
          driftGrip: 13.5
        },
        braking: {
          brakePower: 88.0,
          handbrakePower: 96.0,
          frontBias: 0.64
        },
        suspension: {
          stiffness: 42.0,
          damping: 8.0,
          maxTravel: 0.24,
          restLength: 0.46,
          antiRollBar: 10.5
        },
        aerodynamics: {
          dragCoefficient: 0.38,
          frontalArea: 2.75,
          downforceCoefficient: 0.30
        }
      },
      visuals: {
        bodyType: 'suv',
        modelAssetId: 'suv-luxury',
        modelUrl: '/assets/models/vehicles/suv-luxury.gltf',
        defaultColors: getDefaultCustomization(0x2da44e, 0x090d13, 0xff7b72, 'turbofan', 0x30363d),
        defaultWheel: { style: 'turbofan', color: 0x30363d }
      },
      meta: {
        role: 'Performance Luxury SUV',
        strengths: ['Twin-turbo torque punch', 'Planted high-speed stance', 'Heavy defensive mass'],
        weaknesses: ['Substantial weight transfer in tight chicanes'],
        recommendedTerrain: 'Canyon roads & open circuits',
        difficulty: 'Intermediate',
        description: 'A muscular high-performance SUV combining sports-car acceleration with heavyweight road presence.'
      },
      availability: { unlocked: true }
    });

    // 5. FORMULA CATEGORY
    this.register({
      id: 'formula_velocity_f1',
      name: 'Velocity F1',
      category: VehicleCategory.FORMULA,
      config: {
        name: 'Velocity F1',
        mass: 798,
        dimensions: {
          length: 5.15,
          width: 2.00,
          height: 0.95,
          wheelRadius: 0.36,
          wheelWidth: 0.38,
          wheelBase: 3.50,
          trackWidth: 1.70
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
      },
      visuals: {
        bodyType: 'formula',
        modelAssetId: 'race-future',
        modelUrl: '/assets/models/vehicles/race-future.gltf',
        defaultColors: getDefaultCustomization(0xfa4549, 0x161b22, 0xffffff, 'formula_monoblock', 0x161b22),
        defaultWheel: { style: 'formula_monoblock', color: 0x161b22 }
      },
      meta: {
        role: 'Pure Circuit Performance',
        strengths: ['Unmatched aerodynamic downforce', 'Razor-sharp cornering Gs', 'Instantaneous braking'],
        weaknesses: ['Extremely low ride height', 'Unusable off-road', 'Unforgiving at limit'],
        recommendedTerrain: 'Smooth Grand Prix circuits',
        difficulty: 'Expert',
        description: 'A pure open-wheel formula machine engineered for blistering apex speeds and neck-snapping deceleration.'
      },
      availability: { unlocked: true }
    });

    this.register({
      id: 'formula_aero_apex_gp',
      name: 'Aero Apex GP',
      category: VehicleCategory.FORMULA,
      config: {
        name: 'Aero Apex GP',
        mass: 775,
        dimensions: {
          length: 5.10,
          width: 2.02,
          height: 0.94,
          wheelRadius: 0.36,
          wheelWidth: 0.38,
          wheelBase: 3.46,
          trackWidth: 1.72
        },
        engine: {
          power: 770,
          peakTorque: 640,
          idleRPM: 2600,
          maxRPM: 12800,
          redlineRPM: 12100
        },
        transmission: {
          gears: 8,
          gearRatios: [3.35, 2.40, 1.88, 1.50, 1.25, 1.05, 0.90, 0.78],
          reverseRatio: 3.10,
          finalDrive: 3.52,
          shiftUpRPM: 11800,
          shiftDownRPM: 6200,
          shiftTime: 0.035,
          driveType: 'RWD',
          torqueBias: 1.0
        },
        handling: {
          maxSteerAngle: 0.39,
          steeringSpeed: 7.8,
          returnSpeed: 9.2,
          highSpeedThreshold: 190,
          highSpeedReduction: 0.68,
          baseGrip: 43.5,
          driftGrip: 11.5
        },
        braking: {
          brakePower: 125.0,
          handbrakePower: 80.0,
          frontBias: 0.70
        },
        suspension: {
          stiffness: 68.0,
          damping: 12.5,
          maxTravel: 0.07,
          restLength: 0.29,
          antiRollBar: 19.0
        },
        aerodynamics: {
          dragCoefficient: 0.44,
          frontalArea: 1.62,
          downforceCoefficient: 2.35
        }
      },
      visuals: {
        bodyType: 'formula',
        defaultColors: getDefaultCustomization(0x00e699, 0x090d13, 0xffffff, 'formula_monoblock', 0x090d13),
        defaultWheel: { style: 'formula_monoblock', color: 0x090d13 }
      },
      meta: {
        role: 'Ground-Effect Circuit Prototype',
        strengths: ['Extreme downforce tunnel grip', 'Laser-guided steering precision', 'Ultra-high lateral G capacity'],
        weaknesses: ['Severe curb sensitivity', 'Demands total focus'],
        recommendedTerrain: 'Flat high-speed Grand Prix circuits',
        difficulty: 'Expert',
        description: 'An advanced ground-effect circuit prototype that produces suction-level road adhesion at high speeds.'
      },
      availability: { unlocked: true }
    });

    this.initialized = true;
  }

  public static register(def: VehicleDefinition): void {
    this.definitions.set(def.id, def);
  }

  public static get(id: string): VehicleDefinition | undefined {
    if (!this.initialized) this.initialize();
    return this.definitions.get(id);
  }

  public static getOrThrow(id: string): VehicleDefinition {
    const def = this.get(id);
    if (!def) {
      // Return default sports car if requested ID is missing
      const fallback = this.get('sports_apex_s1');
      if (fallback) return fallback;
      throw new Error(`Vehicle definition '${id}' not found in VehicleRegistry.`);
    }
    return def;
  }

  public static getAll(): VehicleDefinition[] {
    if (!this.initialized) this.initialize();
    return Array.from(this.definitions.values());
  }

  public static getByCategory(category: VehicleCategory): VehicleDefinition[] {
    if (!this.initialized) this.initialize();
    return this.getAll().filter(d => d.category === category);
  }

  public static getCategories(): VehicleCategory[] {
    return [
      VehicleCategory.SPORTS,
      VehicleCategory.SUPERCAR,
      VehicleCategory.RALLY,
      VehicleCategory.SUV,
      VehicleCategory.FORMULA
    ];
  }

  /**
   * Selects a diverse, track-aware lineup of AI vehicles.
   */
  public static getSuggestedAIVehicles(trackPreset: string, count: number): VehicleDefinition[] {
    if (!this.initialized) this.initialize();

    let pool: VehicleDefinition[] = [];
    const lowerPreset = trackPreset.toLowerCase();

    if (lowerPreset.includes('alpine') || lowerPreset.includes('mountain')) {
      // Mountain/Forest: Rally, Sports, and SUV
      pool = [
        ...this.getByCategory(VehicleCategory.RALLY),
        ...this.getByCategory(VehicleCategory.SPORTS),
        ...this.getByCategory(VehicleCategory.SUV)
      ];
    } else if (lowerPreset.includes('coastal')) {
      // Coastal Highway: Supercar, Sports, Formula
      pool = [
        ...this.getByCategory(VehicleCategory.SUPERCAR),
        ...this.getByCategory(VehicleCategory.SPORTS),
        ...this.getByCategory(VehicleCategory.FORMULA)
      ];
    } else {
      // Circuit / Grand Prix / Mixed: Formula, Supercar, Sports
      pool = [
        ...this.getByCategory(VehicleCategory.FORMULA),
        ...this.getByCategory(VehicleCategory.SUPERCAR),
        ...this.getByCategory(VehicleCategory.SPORTS)
      ];
    }

    if (pool.length === 0) {
      pool = this.getAll();
    }

    // Pick cars deterministically with varied spread
    const result: VehicleDefinition[] = [];
    for (let i = 0; i < count; i++) {
      result.push(pool[i % pool.length]);
    }
    return result;
  }
}

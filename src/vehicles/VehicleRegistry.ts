import { VehicleCategory } from './VehicleCategory';
import { VehicleDefinition } from './VehicleDefinition';
import { getDefaultCustomization } from './VehicleCustomization';

export class VehicleRegistry {
  private static definitions: Map<string, VehicleDefinition> = new Map();
  private static initialized: boolean = false;

  public static initialize(): void {
    if (this.initialized) return;

    // =========================================================================
    // 1. SPORTS CARS & CLASSIC GT
    // =========================================================================

    // 1.1 1982 Porsche 911 Turbo 3.3 (930)
    this.register({
      id: 'sports_porsche_930',
      name: '1982 Porsche 911 Turbo 3.3',
      category: VehicleCategory.SPORTS,
      config: {
        name: '1982 Porsche 911 Turbo 3.3',
        mass: 1300,
        dimensions: {
          length: 4.29,
          width: 1.78,
          height: 1.31,
          wheelRadius: 0.34,
          wheelWidth: 0.26,
          wheelBase: 2.27,
          trackWidth: 1.50
        },
        engine: {
          power: 300,
          peakTorque: 412,
          idleRPM: 950,
          maxRPM: 7000,
          redlineRPM: 6700
        },
        transmission: {
          gears: 4,
          gearRatios: [3.15, 1.80, 1.25, 0.89],
          reverseRatio: 3.20,
          finalDrive: 3.44,
          shiftUpRPM: 6500,
          shiftDownRPM: 3200,
          shiftTime: 0.15,
          driveType: 'RWD',
          torqueBias: 1.0
        },
        handling: {
          maxSteerAngle: 0.52,
          steeringSpeed: 5.0,
          returnSpeed: 6.5,
          highSpeedThreshold: 140,
          highSpeedReduction: 0.48,
          baseGrip: 27.0,
          driftGrip: 12.5
        },
        braking: {
          brakePower: 80.0,
          handbrakePower: 95.0,
          frontBias: 0.60
        },
        suspension: {
          stiffness: 36.0,
          damping: 6.8,
          maxTravel: 0.17,
          restLength: 0.35,
          antiRollBar: 8.5
        },
        aerodynamics: {
          dragCoefficient: 0.39,
          frontalArea: 1.95,
          downforceCoefficient: 0.40
        }
      },
      visuals: {
        bodyType: 'sports',
        modelAssetId: 'porsche-930-turbo',
        modelUrl: '/assets/models/vehicles/porsche-930-turbo.glb',
        modelRotationY: 0,
        modelOffsetY: 0.02,
        modelScaleMultiplier: 1.0,
        supportsAdvancedCustomization: false,
        applicableCustomizations: {
          primaryColor: true,
          wheelColor: true
        },
        defaultColors: getDefaultCustomization(0xd73a49, 0x161b22, 0xd29922, 'sport_mesh', 0xc9d1d9),
        defaultWheel: { style: 'sport_mesh', color: 0xc9d1d9 }
      },
      meta: {
        role: 'Legendary Turbocharged Classic',
        strengths: ['Iconic whale-tail aero', 'Violent turbo boost punch', 'Lightweight rear-engine agility'],
        weaknesses: ['Demands throttle discipline ("The Widowmaker")', 'Rear weight bias'],
        recommendedTerrain: 'Open asphalt circuits & winding mountain roads',
        difficulty: 'Intermediate',
        description: 'The definitive classic supercar. The 1982 930 Turbo pairs a 3.3L air-cooled flat-six with aggressive widebody fenders and the legendary whale-tail spoiler.'
      },
      availability: { unlocked: true }
    });

    // 1.2 Toyota Supra RZ (A80 / Mk4)
    this.register({
      id: 'sports_toyota_supra_rz',
      name: 'Toyota Supra RZ (A80)',
      category: VehicleCategory.SPORTS,
      config: {
        name: 'Toyota Supra RZ (A80)',
        mass: 1510,
        dimensions: {
          length: 4.52,
          width: 1.81,
          height: 1.27,
          wheelRadius: 0.34,
          wheelWidth: 0.26,
          wheelBase: 2.55,
          trackWidth: 1.53
        },
        engine: {
          power: 326,
          peakTorque: 451,
          idleRPM: 850,
          maxRPM: 7400,
          redlineRPM: 6800
        },
        transmission: {
          gears: 6,
          gearRatios: [3.83, 2.36, 1.69, 1.31, 1.00, 0.79],
          reverseRatio: 3.43,
          finalDrive: 3.27,
          shiftUpRPM: 6700,
          shiftDownRPM: 3400,
          shiftTime: 0.12,
          driveType: 'RWD',
          torqueBias: 1.0
        },
        handling: {
          maxSteerAngle: 0.50,
          steeringSpeed: 5.2,
          returnSpeed: 6.8,
          highSpeedThreshold: 155,
          highSpeedReduction: 0.50,
          baseGrip: 29.0,
          driftGrip: 13.5
        },
        braking: {
          brakePower: 86.0,
          handbrakePower: 100.0,
          frontBias: 0.62
        },
        suspension: {
          stiffness: 38.0,
          damping: 7.2,
          maxTravel: 0.16,
          restLength: 0.35,
          antiRollBar: 9.0
        },
        aerodynamics: {
          dragCoefficient: 0.32,
          frontalArea: 1.98,
          downforceCoefficient: 0.45
        }
      },
      visuals: {
        bodyType: 'sports',
        modelAssetId: 'toyota-supra-rz',
        modelUrl: '/assets/models/vehicles/toyota-supra-rz.glb',
        modelRotationY: 0,
        modelOffsetY: 0.02,
        modelScaleMultiplier: 1.0,
        supportsAdvancedCustomization: true,
        applicableCustomizations: {
          primaryColor: true,
          secondaryColor: true,
          accentColor: true,
          wheelColor: true
        },
        defaultColors: getDefaultCustomization(0xffffff, 0x111111, 0xd29922, 'sport_mesh', 0xd4af37),
        defaultWheel: { style: 'sport_mesh', color: 0xd4af37 }
      },
      meta: {
        role: 'Twin-Turbocharged Highway Titan',
        strengths: ['Indestructible 2JZ-GTE sequential twin-turbo', 'Superb high-speed stability', 'Huge aftermarket tuning potential'],
        weaknesses: ['Moderate curb weight', 'Boost lag transition'],
        recommendedTerrain: 'High-speed motorways & sweeping race circuits',
        difficulty: 'Novice',
        description: 'The halo Japanese grand tourer. The A80 Supra RZ is powered by the legendary 3.0L twin-turbo 2JZ-GTE inline-six, renowned for limitless power headroom and iconic hoop rear wing.'
      },
      availability: { unlocked: true }
    });

    // 1.3 2023 Toyota GR Supra RZ Pandem
    this.register({
      id: 'sports_toyota_gr_supra',
      name: 'Toyota GR Supra RZ Pandem',
      category: VehicleCategory.SPORTS,
      config: {
        name: 'Toyota GR Supra RZ Pandem',
        mass: 1495,
        dimensions: {
          length: 4.38,
          width: 1.86,
          height: 1.29,
          wheelRadius: 0.35,
          wheelWidth: 0.28,
          wheelBase: 2.47,
          trackWidth: 1.60
        },
        engine: {
          power: 382,
          peakTorque: 500,
          idleRPM: 750,
          maxRPM: 7200,
          redlineRPM: 6500
        },
        transmission: {
          gears: 8,
          gearRatios: [5.25, 3.36, 2.17, 1.72, 1.32, 1.00, 0.82, 0.64],
          reverseRatio: 3.71,
          finalDrive: 3.15,
          shiftUpRPM: 6400,
          shiftDownRPM: 3500,
          shiftTime: 0.08,
          driveType: 'RWD',
          torqueBias: 1.0
        },
        handling: {
          maxSteerAngle: 0.52,
          steeringSpeed: 5.6,
          returnSpeed: 7.2,
          highSpeedThreshold: 160,
          highSpeedReduction: 0.52,
          baseGrip: 30.5,
          driftGrip: 14.0
        },
        braking: {
          brakePower: 90.0,
          handbrakePower: 105.0,
          frontBias: 0.64
        },
        suspension: {
          stiffness: 42.0,
          damping: 7.8,
          maxTravel: 0.14,
          restLength: 0.33,
          antiRollBar: 10.5
        },
        aerodynamics: {
          dragCoefficient: 0.34,
          frontalArea: 2.05,
          downforceCoefficient: 0.60
        }
      },
      visuals: {
        bodyType: 'sports',
        modelAssetId: 'toyota-gr-supra-pandem',
        modelUrl: '/assets/models/vehicles/toyota-gr-supra-pandem.glb',
        modelRotationY: 0,
        modelOffsetY: 0.02,
        modelScaleMultiplier: 1.0,
        supportsAdvancedCustomization: true,
        applicableCustomizations: {
          primaryColor: true,
          secondaryColor: true,
          accentColor: true
        },
        defaultColors: getDefaultCustomization(0xffd700, 0x161b22, 0xd73a49, 'sport_mesh', 0x111111),
        defaultWheel: { style: 'sport_mesh', color: 0x111111 }
      },
      meta: {
        role: 'Modern Widebody Track Weapon',
        strengths: ['Instant twin-scroll turbo response', 'Short wheelbase agility', 'Pandem widebody downforce'],
        weaknesses: ['Sharp breakaway at limits'],
        recommendedTerrain: 'Tight technical circuits & hill climbs',
        difficulty: 'Intermediate',
        description: 'A modern aerodynamic beast. Equipped with the Tra-Kyoto Pandem bolt-on widebody aero kit, extended front splitter, and ducktail spoiler wrapping a 382 HP B58 turbo engine.'
      },
      availability: { unlocked: true }
    });

    // =========================================================================
    // 2. SUPERCAR & HYPERCAR CLASS
    // =========================================================================

    // 2.1 Ferrari 296 GTB Assetto Fiorano
    this.register({
      id: 'supercar_ferrari_296',
      name: 'Ferrari 296 GTB Assetto Fiorano',
      category: VehicleCategory.SUPERCAR,
      config: {
        name: 'Ferrari 296 GTB Assetto Fiorano',
        mass: 1470,
        dimensions: {
          length: 4.56,
          width: 1.96,
          height: 1.19,
          wheelRadius: 0.36,
          wheelWidth: 0.30,
          wheelBase: 2.60,
          trackWidth: 1.67
        },
        engine: {
          power: 670,
          peakTorque: 740,
          idleRPM: 1100,
          maxRPM: 8500,
          redlineRPM: 8000
        },
        transmission: {
          gears: 7,
          gearRatios: [3.18, 2.19, 1.62, 1.28, 1.03, 0.84, 0.69],
          reverseRatio: 3.12,
          finalDrive: 3.73,
          shiftUpRPM: 7800,
          shiftDownRPM: 4200,
          shiftTime: 0.08,
          driveType: 'AWD',
          torqueBias: 0.65
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
        modelScaleMultiplier: 1.0,
        supportsAdvancedCustomization: true,
        applicableCustomizations: {
          primaryColor: true,
          secondaryColor: true,
          accentColor: true,
          wheelColor: true
        },
        defaultColors: getDefaultCustomization(0xd40000, 0x111111, 0xffcc00, 'formula_monoblock', 0x161b22),
        defaultWheel: { style: 'formula_monoblock', color: 0x161b22 }
      },
      meta: {
        role: 'Mid-Rear Hybrid Thoroughbred',
        strengths: ['Blistering twin-turbo V6 punch', 'Active aero tea-tray spoiler', 'Carbon-ceramic stopping power'],
        weaknesses: ['Demands laser focus at 300+ km/h', 'Stiff competition suspension'],
        recommendedTerrain: 'High-speed GP circuits & smooth asphalt passes',
        difficulty: 'Expert',
        description: 'Maranello perfection. The Assetto Fiorano pack equips the 296 GTB with Multimatic dampers, lightweight Lexan rear window, and carbon-fiber front corner splitters delivering 360 kg downforce.'
      },
      availability: { unlocked: true }
    });

    // 2.2 2020 McLaren 765LT
    this.register({
      id: 'supercar_mclaren_765lt',
      name: '2020 McLaren 765LT',
      category: VehicleCategory.SUPERCAR,
      config: {
        name: '2020 McLaren 765LT',
        mass: 1229,
        dimensions: {
          length: 4.60,
          width: 1.93,
          height: 1.16,
          wheelRadius: 0.35,
          wheelWidth: 0.31,
          wheelBase: 2.67,
          trackWidth: 1.65
        },
        engine: {
          power: 765,
          peakTorque: 800,
          idleRPM: 1150,
          maxRPM: 8500,
          redlineRPM: 8200
        },
        transmission: {
          gears: 7,
          gearRatios: [3.98, 2.61, 1.90, 1.48, 1.16, 0.91, 0.69],
          reverseRatio: 2.80,
          finalDrive: 3.30,
          shiftUpRPM: 8100,
          shiftDownRPM: 4400,
          shiftTime: 0.05,
          driveType: 'RWD',
          torqueBias: 1.0
        },
        handling: {
          maxSteerAngle: 0.45,
          steeringSpeed: 6.0,
          returnSpeed: 8.0,
          highSpeedThreshold: 175,
          highSpeedReduction: 0.58,
          baseGrip: 33.5,
          driftGrip: 13.5
        },
        braking: {
          brakePower: 105.0,
          handbrakePower: 120.0,
          frontBias: 0.66
        },
        suspension: {
          stiffness: 52.0,
          damping: 9.0,
          maxTravel: 0.11,
          restLength: 0.32,
          antiRollBar: 13.0
        },
        aerodynamics: {
          dragCoefficient: 0.29,
          frontalArea: 1.95,
          downforceCoefficient: 0.95
        }
      },
      visuals: {
        bodyType: 'supercar',
        modelAssetId: 'mclaren-765lt',
        modelUrl: '/assets/models/vehicles/mclaren-765lt.glb',
        modelRotationY: 0,
        modelOffsetY: 0.02,
        modelScaleMultiplier: 1.0,
        supportsAdvancedCustomization: true,
        applicableCustomizations: {
          primaryColor: true,
          secondaryColor: true,
          accentColor: true,
          wheelColor: true
        },
        defaultColors: getDefaultCustomization(0x00a3e0, 0x111111, 0xff8000, 'formula_monoblock', 0x222222),
        defaultWheel: { style: 'formula_monoblock', color: 0x222222 }
      },
      meta: {
        role: 'Ultra-Lightweight Longtail Track Weapon',
        strengths: ['Featherweight 1,229 kg carbon monocoque', 'Active Longtail rear airbrake wing', 'Quad titanium exhaust symphony'],
        weaknesses: ['Ruthlessly stiff ride', 'Demands surgical driving inputs'],
        recommendedTerrain: 'High-speed flowing circuits & grand prix tarmac',
        difficulty: 'Expert',
        description: 'The pinnacle of McLaren Longtail pedigree. 765 PS, 800 Nm from a 4.0L twin-turbo V8, carbon-fiber aero package, and an active rear wing acting as a high-speed airbrake.'
      },
      availability: { unlocked: true }
    });

    // =========================================================================
    // 3. RALLY & ALL-TERRAIN CLASS
    // =========================================================================

    // 3.1 Mitsubishi Lancer Evolution VI
    this.register({
      id: 'rally_mitsubishi_evo6',
      name: 'Mitsubishi Lancer Evolution VI',
      category: VehicleCategory.RALLY,
      config: {
        name: 'Mitsubishi Lancer Evolution VI',
        mass: 1260,
        dimensions: {
          length: 4.35,
          width: 1.77,
          height: 1.42,
          wheelRadius: 0.33,
          wheelWidth: 0.25,
          wheelBase: 2.51,
          trackWidth: 1.51
        },
        engine: {
          power: 280,
          peakTorque: 373,
          idleRPM: 900,
          maxRPM: 7600,
          redlineRPM: 7000
        },
        transmission: {
          gears: 5,
          gearRatios: [2.79, 1.95, 1.44, 1.10, 0.83],
          reverseRatio: 3.17,
          finalDrive: 4.53,
          shiftUpRPM: 6800,
          shiftDownRPM: 3300,
          shiftTime: 0.12,
          driveType: 'AWD',
          torqueBias: 0.50
        },
        handling: {
          maxSteerAngle: 0.56,
          steeringSpeed: 5.5,
          returnSpeed: 7.0,
          highSpeedThreshold: 140,
          highSpeedReduction: 0.40,
          baseGrip: 28.0,
          driftGrip: 17.5
        },
        braking: {
          brakePower: 85.0,
          handbrakePower: 115.0,
          frontBias: 0.58
        },
        suspension: {
          stiffness: 30.0,
          damping: 6.5,
          maxTravel: 0.24,
          restLength: 0.40,
          antiRollBar: 7.5
        },
        aerodynamics: {
          dragCoefficient: 0.36,
          frontalArea: 2.08,
          downforceCoefficient: 0.50
        }
      },
      visuals: {
        bodyType: 'rally',
        modelAssetId: 'mitsubishi-lancer-evo-6',
        modelUrl: '/assets/models/vehicles/mitsubishi-lancer-evo-6.glb',
        modelRotationY: 0,
        modelOffsetY: 0.02,
        modelScaleMultiplier: 1.0,
        supportsAdvancedCustomization: true,
        applicableCustomizations: {
          primaryColor: true,
          secondaryColor: true,
          wheelColor: true
        },
        defaultColors: getDefaultCustomization(0xf2f2f2, 0x161b22, 0xd73a49, 'turbofan', 0xf8f9fa),
        defaultWheel: { style: 'turbofan', color: 0xf8f9fa }
      },
      meta: {
        role: 'WRC Group A Legend',
        strengths: ['Active Yaw Control (AYC) all-wheel drive', 'Phenomenal gravel & wet asphalt grip', 'Twin-blade adjustable rear wing'],
        weaknesses: ['Lower top speed gearing'],
        recommendedTerrain: 'Mixed surfaces, gravel stages & hairpin mountain passes',
        difficulty: 'Intermediate',
        description: 'Four consecutive WRC titles. The Evo VI combines the legendary 4G63T turbo engine with active center differential and signature offset front bumper cooling ducts.'
      },
      availability: { unlocked: true }
    });

    // 3.2 1999 Mitsubishi Lancer Evolution VI GSR T.M.E.
    this.register({
      id: 'rally_mitsubishi_evo_tme',
      name: 'Mitsubishi Lancer Evo VI T.M.E.',
      category: VehicleCategory.RALLY,
      config: {
        name: 'Mitsubishi Lancer Evo VI T.M.E.',
        mass: 1280,
        dimensions: {
          length: 4.35,
          width: 1.77,
          height: 1.41,
          wheelRadius: 0.33,
          wheelWidth: 0.25,
          wheelBase: 2.51,
          trackWidth: 1.51
        },
        engine: {
          power: 290,
          peakTorque: 382,
          idleRPM: 900,
          maxRPM: 7800,
          redlineRPM: 7200
        },
        transmission: {
          gears: 5,
          gearRatios: [2.79, 1.95, 1.44, 1.09, 0.82],
          reverseRatio: 3.17,
          finalDrive: 4.53,
          shiftUpRPM: 7000,
          shiftDownRPM: 3400,
          shiftTime: 0.10,
          driveType: 'AWD',
          torqueBias: 0.50
        },
        handling: {
          maxSteerAngle: 0.56,
          steeringSpeed: 5.7,
          returnSpeed: 7.2,
          highSpeedThreshold: 145,
          highSpeedReduction: 0.42,
          baseGrip: 29.0,
          driftGrip: 18.0
        },
        braking: {
          brakePower: 88.0,
          handbrakePower: 118.0,
          frontBias: 0.58
        },
        suspension: {
          stiffness: 32.0,
          damping: 6.8,
          maxTravel: 0.22,
          restLength: 0.39,
          antiRollBar: 8.0
        },
        aerodynamics: {
          dragCoefficient: 0.35,
          frontalArea: 2.05,
          downforceCoefficient: 0.52
        }
      },
      visuals: {
        bodyType: 'rally',
        modelAssetId: 'mitsubishi-lancer-evo-tme',
        modelUrl: '/assets/models/vehicles/mitsubishi-lancer-evo-tme.glb',
        modelRotationY: 0,
        modelOffsetY: 0.02,
        modelScaleMultiplier: 1.0,
        supportsAdvancedCustomization: true,
        applicableCustomizations: {
          primaryColor: true,
          secondaryColor: true,
          wheelColor: true
        },
        defaultColors: getDefaultCustomization(0xd62828, 0x111111, 0xffffff, 'turbofan', 0xffffff),
        defaultWheel: { style: 'turbofan', color: 0xffffff }
      },
      meta: {
        role: 'Tommi Mäkinen Special Edition',
        strengths: ['Titanium turbine spool-up response', 'Lowered tarmac-spec suspension', 'Enkei WRC rally wheels'],
        weaknesses: ['Firm ride over deep potholes'],
        recommendedTerrain: 'Alpine switchbacks, tarmac rally stages & mixed dirt',
        difficulty: 'Intermediate',
        description: 'Built to commemorate Tommi Mäkinen four consecutive World Rally Championships. Features redesigned front air dam, titanium turbocharger turbine, and Ralliart racing pedigree.'
      },
      availability: { unlocked: true }
    });

    // 3.3 1998 Subaru Impreza 22B STi Version
    this.register({
      id: 'rally_subaru_22b',
      name: '1998 Subaru Impreza 22B STi',
      category: VehicleCategory.RALLY,
      config: {
        name: '1998 Subaru Impreza 22B STi',
        mass: 1270,
        dimensions: {
          length: 4.37,
          width: 1.77,
          height: 1.39,
          wheelRadius: 0.33,
          wheelWidth: 0.25,
          wheelBase: 2.52,
          trackWidth: 1.50
        },
        engine: {
          power: 280,
          peakTorque: 363,
          idleRPM: 850,
          maxRPM: 8000,
          redlineRPM: 7400
        },
        transmission: {
          gears: 5,
          gearRatios: [3.17, 2.06, 1.45, 1.11, 0.83],
          reverseRatio: 3.42,
          finalDrive: 4.44,
          shiftUpRPM: 7200,
          shiftDownRPM: 3500,
          shiftTime: 0.11,
          driveType: 'AWD',
          torqueBias: 0.48
        },
        handling: {
          maxSteerAngle: 0.55,
          steeringSpeed: 5.6,
          returnSpeed: 7.2,
          highSpeedThreshold: 145,
          highSpeedReduction: 0.42,
          baseGrip: 28.5,
          driftGrip: 17.5
        },
        braking: {
          brakePower: 86.0,
          handbrakePower: 115.0,
          frontBias: 0.58
        },
        suspension: {
          stiffness: 31.0,
          damping: 6.6,
          maxTravel: 0.23,
          restLength: 0.39,
          antiRollBar: 8.0
        },
        aerodynamics: {
          dragCoefficient: 0.36,
          frontalArea: 2.02,
          downforceCoefficient: 0.48
        }
      },
      visuals: {
        bodyType: 'rally',
        modelAssetId: 'subaru-impreza-22b',
        modelUrl: '/assets/models/vehicles/subaru-impreza-22b.glb',
        modelRotationY: 0,
        modelOffsetY: 0.02,
        modelScaleMultiplier: 1.0,
        supportsAdvancedCustomization: false,
        applicableCustomizations: {
          primaryColor: true,
          wheelColor: true
        },
        defaultColors: getDefaultCustomization(0x1a3c74, 0x111111, 0xd4af37, 'turbofan', 0xd4af37),
        defaultWheel: { style: 'turbofan', color: 0xd4af37 }
      },
      meta: {
        role: 'Widebody Boxer Rally Icon',
        strengths: ['2.2L turbocharged EJ22 boxer engine', 'Bespoke hand-crafted widebody fenders', 'Gold BBS alloy rally wheels'],
        weaknesses: ['Extremely rare and sought-after'],
        recommendedTerrain: 'Gravel tracks, forest trails & winding asphalt passes',
        difficulty: 'Novice',
        description: 'The holy grail of rally cars. Built to celebrate Subaru 40th anniversary and third consecutive WRC manufacturer title, featuring flared blister fenders, Bilstein dampers, and iconic Sonic Blue paint.'
      },
      availability: { unlocked: true }
    });

    // =========================================================================
    // 4. SUV & HEAVY OFF-ROAD CLASS
    // =========================================================================

    // 4.1 2010 Ford F-150 SVT Raptor R
    this.register({
      id: 'suv_ford_f150_raptor',
      name: 'Ford F-150 SVT Raptor R',
      category: VehicleCategory.SUV,
      config: {
        name: 'Ford F-150 SVT Raptor R',
        mass: 2720,
        dimensions: {
          length: 5.61,
          width: 2.19,
          height: 1.99,
          wheelRadius: 0.45,
          wheelWidth: 0.35,
          wheelBase: 3.38,
          trackWidth: 1.87
        },
        engine: {
          power: 500,
          peakTorque: 678,
          idleRPM: 700,
          maxRPM: 6200,
          redlineRPM: 5800
        },
        transmission: {
          gears: 6,
          gearRatios: [4.17, 2.34, 1.52, 1.14, 0.86, 0.69],
          reverseRatio: 3.40,
          finalDrive: 4.10,
          shiftUpRPM: 5600,
          shiftDownRPM: 2800,
          shiftTime: 0.18,
          driveType: 'AWD',
          torqueBias: 0.50
        },
        handling: {
          maxSteerAngle: 0.48,
          steeringSpeed: 4.2,
          returnSpeed: 5.8,
          highSpeedThreshold: 120,
          highSpeedReduction: 0.45,
          baseGrip: 24.0,
          driftGrip: 15.0
        },
        braking: {
          brakePower: 88.0,
          handbrakePower: 100.0,
          frontBias: 0.62
        },
        suspension: {
          stiffness: 24.0,
          damping: 5.2,
          maxTravel: 0.34,
          restLength: 0.52,
          antiRollBar: 6.0
        },
        aerodynamics: {
          dragCoefficient: 0.44,
          frontalArea: 3.35,
          downforceCoefficient: 0.20
        }
      },
      visuals: {
        bodyType: 'suv',
        modelAssetId: 'ford-f150-raptor-r',
        modelUrl: '/assets/models/vehicles/ford-f150-raptor-r.glb',
        modelRotationY: Math.PI,
        modelOffsetY: 0.02,
        modelScaleMultiplier: 1.0,
        supportsAdvancedCustomization: true,
        applicableCustomizations: {
          primaryColor: true,
          secondaryColor: true,
          wheelColor: true
        },
        defaultColors: getDefaultCustomization(0xd94f00, 0x151515, 0xd4af37, 'offroad_beadlock', 0x151515),
        defaultWheel: { style: 'offroad_beadlock', color: 0x151515 }
      },
      meta: {
        role: 'Baja 1000 Trophy Truck Beast',
        strengths: ['Massive 35" all-terrain tires', 'Fox Racing long-travel internal bypass shocks', 'Crushing off-road momentum'],
        weaknesses: ['Heavy 2.7-ton mass', 'Wide body footprint'],
        recommendedTerrain: 'Deep desert sands, rocky trails & rough mountain terrain',
        difficulty: 'Novice',
        description: 'Born for high-speed desert dominance. The SVT Raptor R harnesses a high-output 6.2L V8, reinforced ladder-frame chassis, and long-travel Fox suspension capable of swallowing jumps with ease.'
      },
      availability: { unlocked: true }
    });

    // =========================================================================
    // 5. FORMULA & OPEN-WHEEL CLASS
    // =========================================================================

    // 5.1 McLaren MCL35M (F1 2021)
    this.register({
      id: 'formula_mclaren_mcl35m',
      name: 'McLaren MCL35M (F1 2021)',
      category: VehicleCategory.FORMULA,
      config: {
        name: 'McLaren MCL35M (F1 2021)',
        mass: 752,
        dimensions: {
          length: 5.68,
          width: 2.00,
          height: 0.95,
          wheelRadius: 0.33,
          wheelWidth: 0.38,
          wheelBase: 3.60,
          trackWidth: 1.60
        },
        engine: {
          power: 1000,
          peakTorque: 700,
          idleRPM: 4000,
          maxRPM: 15000,
          redlineRPM: 13500
        },
        transmission: {
          gears: 8,
          gearRatios: [3.40, 2.50, 1.95, 1.60, 1.35, 1.15, 1.00, 0.88],
          reverseRatio: 3.20,
          finalDrive: 4.10,
          shiftUpRPM: 13000,
          shiftDownRPM: 7000,
          shiftTime: 0.02,
          driveType: 'RWD',
          torqueBias: 1.0
        },
        handling: {
          maxSteerAngle: 0.40,
          steeringSpeed: 6.5,
          returnSpeed: 8.5,
          highSpeedThreshold: 200,
          highSpeedReduction: 0.65,
          baseGrip: 38.0,
          driftGrip: 10.0
        },
        braking: {
          brakePower: 130.0,
          handbrakePower: 60.0,
          frontBias: 0.58
        },
        suspension: {
          stiffness: 65.0,
          damping: 11.0,
          maxTravel: 0.07,
          restLength: 0.25,
          antiRollBar: 16.0
        },
        aerodynamics: {
          dragCoefficient: 0.72,
          frontalArea: 1.45,
          downforceCoefficient: 2.40
        }
      },
      visuals: {
        bodyType: 'formula',
        modelAssetId: 'mclaren-mcl35m-f1',
        modelUrl: '/assets/models/vehicles/mclaren-mcl35m-f1.glb',
        modelRotationY: 0,
        modelOffsetY: 0.02,
        modelScaleMultiplier: 1.0,
        supportsAdvancedCustomization: true,
        applicableCustomizations: {
          primaryColor: true,
          secondaryColor: true,
          wheelColor: true
        },
        defaultColors: getDefaultCustomization(0xff8000, 0x56a0d3, 0xffffff, 'formula_monoblock', 0x111111),
        defaultWheel: { style: 'formula_monoblock', color: 0x111111 }
      },
      meta: {
        role: 'Monza Grand Prix Winner',
        strengths: ['1,000 HP Mercedes V6 turbo-hybrid power unit', 'Sensational high-speed downforce', '5G cornering capabilities'],
        weaknesses: ['Extremely low ride height', 'Unforgiving grip cliff at limits'],
        recommendedTerrain: 'Grand Prix circuits & high-speed asphalt sweepers',
        difficulty: 'Expert',
        description: 'Daniel Ricciardo Monza GP winning chassis. Featuring Papaya and Gulf racing livery, high-downforce bargeboards, and a 1,000 HP power unit capable of 0-200 km/h in 4.5 seconds.'
      },
      availability: { unlocked: true }
    });

    // 5.2 Red Bull Racing F1 (RB16B)
    this.register({
      id: 'formula_red_bull_f1',
      name: 'Red Bull Racing F1 (RB16B)',
      category: VehicleCategory.FORMULA,
      config: {
        name: 'Red Bull Racing F1 (RB16B)',
        mass: 752,
        dimensions: {
          length: 5.50,
          width: 2.00,
          height: 0.95,
          wheelRadius: 0.33,
          wheelWidth: 0.38,
          wheelBase: 3.55,
          trackWidth: 1.60
        },
        engine: {
          power: 1020,
          peakTorque: 720,
          idleRPM: 4000,
          maxRPM: 15000,
          redlineRPM: 13500
        },
        transmission: {
          gears: 8,
          gearRatios: [3.40, 2.50, 1.95, 1.60, 1.35, 1.15, 1.00, 0.88],
          reverseRatio: 3.20,
          finalDrive: 4.10,
          shiftUpRPM: 13200,
          shiftDownRPM: 7200,
          shiftTime: 0.02,
          driveType: 'RWD',
          torqueBias: 1.0
        },
        handling: {
          maxSteerAngle: 0.42,
          steeringSpeed: 6.8,
          returnSpeed: 8.8,
          highSpeedThreshold: 200,
          highSpeedReduction: 0.65,
          baseGrip: 39.0,
          driftGrip: 10.0
        },
        braking: {
          brakePower: 135.0,
          handbrakePower: 60.0,
          frontBias: 0.58
        },
        suspension: {
          stiffness: 68.0,
          damping: 11.5,
          maxTravel: 0.07,
          restLength: 0.25,
          antiRollBar: 17.0
        },
        aerodynamics: {
          dragCoefficient: 0.70,
          frontalArea: 1.45,
          downforceCoefficient: 2.50
        }
      },
      visuals: {
        bodyType: 'formula',
        modelAssetId: 'red-bull-f1',
        modelUrl: '/assets/models/vehicles/red-bull-f1.glb',
        modelRotationY: 0,
        modelOffsetY: 0.02,
        modelScaleMultiplier: 1.0,
        supportsAdvancedCustomization: false,
        applicableCustomizations: {
          primaryColor: true,
          wheelColor: true
        },
        defaultColors: getDefaultCustomization(0x001a33, 0xd90429, 0xfdb813, 'formula_monoblock', 0x111111),
        defaultWheel: { style: 'formula_monoblock', color: 0x111111 }
      },
      meta: {
        role: 'World Championship Winning Ground-Effect Weapon',
        strengths: ['Adrian Newey high-rake aero masterclass', 'Detached multi-piece racing tyres', 'Lightning directional change'],
        weaknesses: ['Sensitive front floor stalling'],
        recommendedTerrain: 'High-speed race circuits & flowing tarmac',
        difficulty: 'Expert',
        description: 'The machine that brought Max Verstappen his maiden World Championship. Designed by Adrian Newey, featuring extreme high-rake aerodynamics and Honda turbo-hybrid power.'
      },
      availability: { unlocked: true }
    });

    this.initialized = true;
  }

  private static register(def: VehicleDefinition): void {
    this.definitions.set(def.id, def);
  }

  public static get(id: string): VehicleDefinition | undefined {
    if (!this.initialized) this.initialize();
    return this.definitions.get(id);
  }

  public static getOrThrow(id: string): VehicleDefinition {
    const def = this.get(id);
    if (!def) {
      const fallback = this.get('sports_porsche_930') || this.getAll()[0];
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

    if (lowerPreset.includes('alpine') || lowerPreset.includes('mountain') || lowerPreset.includes('circuit')) {
      pool = [
        ...this.getByCategory(VehicleCategory.SUPERCAR),
        ...this.getByCategory(VehicleCategory.SPORTS),
        ...this.getByCategory(VehicleCategory.RALLY)
      ];
    } else if (lowerPreset.includes('coastal')) {
      pool = [
        ...this.getByCategory(VehicleCategory.SUPERCAR),
        ...this.getByCategory(VehicleCategory.SPORTS),
        ...this.getByCategory(VehicleCategory.FORMULA)
      ];
    } else {
      pool = [
        ...this.getByCategory(VehicleCategory.RALLY),
        ...this.getByCategory(VehicleCategory.SUV),
        ...this.getByCategory(VehicleCategory.SPORTS)
      ];
    }

    if (pool.length === 0) {
      pool = this.getAll();
    }

    const result: VehicleDefinition[] = [];
    for (let i = 0; i < count; i++) {
      result.push(pool[i % pool.length]);
    }
    return result;
  }
}

import { TrackDefinition } from './TrackTypes';
import { Track } from './Track';

/**
 * 1. Alpine Test Circuit (Primary Phase 3 Test Track)
 * Mountain environment with 42m elevation difference, steep uphill climb,
 * crest launching section, downhill chicane, and a 12° banked hairpin.
 */
export const ALPINE_CIRCUIT_CONFIG: TrackDefinition = {
  id: 'alpine-circuit',
  name: 'Alpine Test Circuit',
  tagline: 'Mountain Pass & Banked Hairpin',
  description: 'Dramatic mountain pass with 42m elevation difference, steep uphill climb, summit crest, and a 12° banked hairpin.',
  roadWidth: 13.0,
  laps: 3,
  seed: 12345,
  environmentPreset: 'alpine',
  difficulty: 'Technical',
  lengthMeters: 1480,
  elevationRelief: 42,
  recommendedVehicles: ['sports', 'rally', 'supercar'],
  spline: {
    points: [
      { position: [0, 0, 0], width: 14.0, banking: 0 },             // Start/Finish straight
      { position: [140, 4, 0], width: 14.0, banking: 0 },           // High speed flat straight
      { position: [240, 16, -40], width: 13.0, banking: 0.035 },    // Uphill Turn 1 entry
      { position: [290, 28, -140], width: 13.0, banking: 0.055 },   // Sweeping mountain carousel
      { position: [220, 38, -240], width: 13.0, banking: 0.025 },   // High-altitude ridge
      { position: [110, 42, -220], width: 12.0, banking: 0 },       // Alpine Summit Crest
      { position: [30, 32, -280], width: 12.0, banking: -0.035 },   // Steep downhill plunge
      { position: [-40, 22, -240], width: 12.0, banking: 0.025 },   // Downhill chicane apex
      { position: [-140, 15, -290], width: 13.0, banking: 0.045 },  // Banked hairpin entry
      { position: [-230, 10, -210], width: 13.0, banking: 0.065 },  // Banked Hairpin Apex (~3.7° camber)
      { position: [-200, 6, -100], width: 13.0, banking: 0.035 },   // Hairpin exit
      { position: [-110, 2, -40], width: 13.0, banking: 0 },        // Lower valley S-curve
      { position: [-130, 1, 60], width: 13.0, banking: 0.025 },     // Valley corner
      { position: [-80, 0, 120], width: 14.0, banking: 0.040 },     // Final sweeping turn
      { position: [-20, 0, 40], width: 14.0, banking: 0 }           // Exit onto main straight
    ],
    closed: true,
    tension: 0.5,
    defaultWidth: 13.0,
    defaultBanking: 0,
    segments: 350
  },
  terrain: {
    size: 950,
    resolution: 130,
    seed: 12345,
    baseHeight: -4.0,
    heightScale: 32.0,
    corridorWidth: 38.0,
    corridorBlend: 20.0
  },
  boundaries: [
    { type: 'ROAD', lateralDistance: 6.5, hasPhysicalBarrier: true, barrierHeight: 1.2, barrierWidth: 0.8 },
    { type: 'PLAYABLE', lateralDistance: 24.0 },
    { type: 'RESET', lateralDistance: 55.0 }
  ],
  startGrid: {
    positions: 8,
    rowSpacing: 10.0,
    lateralSpacing: 3.5,
    offsetFromStart: 6.0
  }
};

/**
 * 2. Canyon Diablo Speedway (Desert Canyon Circuit)
 * Fast, sunbaked canyon circuit featuring a 280m high-speed canyon wash straight,
 * sweeping banked red sandstone sweepers, arroyo elevation dips, and mesa plateaus.
 */
export const CANYON_DIABLO_CONFIG: TrackDefinition = {
  id: 'desert-canyon',
  name: 'Canyon Diablo Speedway',
  tagline: 'High-Speed Desert Wash & Sandstone Mesas',
  description: 'Blistering desert circuit through red sandstone gorges, featuring a 280m high-speed straight and banked canyon sweepers.',
  roadWidth: 15.0,
  laps: 3,
  seed: 98765,
  environmentPreset: 'desert',
  difficulty: 'High-Speed',
  lengthMeters: 1720,
  elevationRelief: 28,
  recommendedVehicles: ['supercar', 'formula', 'suv', 'sports'],
  spline: {
    points: [
      { position: [0, 0, 0], width: 15.0, banking: 0 },              // Start/Finish straight (Canyon basin)
      { position: [160, 1, 0], width: 15.0, banking: 0 },            // Fast straightaway
      { position: [270, 5, -50], width: 15.0, banking: 0.045 },      // Banked turn 1 canyon entry
      { position: [340, 12, -150], width: 15.0, banking: 0.06 },     // Sweeping red sandstone wall
      { position: [310, 18, -270], width: 15.0, banking: 0.04 },     // Mesa plateau climb
      { position: [200, 24, -340], width: 14.5, banking: 0.02 },     // Upper mesa ridge
      { position: [80, 20, -320], width: 14.5, banking: -0.03 },     // Arroyo plunge
      { position: [-60, 14, -360], width: 15.0, banking: 0.05 },     // Sweeping gorge curve
      { position: [-190, 8, -300], width: 15.0, banking: 0.065 },    // Red rock canyon hairpin
      { position: [-250, 4, -180], width: 15.0, banking: 0.04 },     // Hairpin exit into lower wash
      { position: [-220, 2, -60], width: 15.0, banking: 0.02 },      // High-speed arroyo straight
      { position: [-140, 1, 60], width: 15.0, banking: 0.035 },      // Fast sweeper
      { position: [-40, 0, 50], width: 15.0, banking: 0 }            // Return onto main straight
    ],
    closed: true,
    tension: 0.5,
    defaultWidth: 15.0,
    defaultBanking: 0,
    segments: 350
  },
  terrain: {
    size: 1000,
    resolution: 130,
    seed: 98765,
    baseHeight: -2.0,
    heightScale: 38.0,
    corridorWidth: 38.0,
    corridorBlend: 24.0
  },
  boundaries: [
    { type: 'ROAD', lateralDistance: 7.5, hasPhysicalBarrier: true, barrierHeight: 1.2, barrierWidth: 0.8 },
    { type: 'PLAYABLE', lateralDistance: 28.0 },
    { type: 'RESET', lateralDistance: 65.0 }
  ],
  startGrid: {
    positions: 8,
    rowSpacing: 11.5,
    lateralSpacing: 3.8,
    offsetFromStart: 8.0
  }
};

/**
 * 3. Coastal Cruiser (High speed, wide road, gentle banking)
 * Sweeping ocean highway with long straights and smooth transitions.
 */
export const COASTAL_SPEEDWAY_CONFIG: TrackDefinition = {
  id: 'coastal-speedway',
  name: 'Coastal Speedway',
  tagline: 'Scenic Ocean Highway & Coastal Bluffs',
  description: 'Fast and scenic coastal track with sweeping high-speed corners, ocean vistas, and wide overtaking zones.',
  roadWidth: 16.0,
  laps: 3,
  seed: 67890,
  environmentPreset: 'coastal',
  difficulty: 'Balanced Flow',
  lengthMeters: 1620,
  elevationRelief: 18,
  recommendedVehicles: ['sports', 'supercar', 'formula'],
  spline: {
    points: [
      { position: [0, 0, 0], width: 16.0, banking: 0 },
      { position: [180, 2, 0], width: 16.0, banking: 0 },
      { position: [300, 8, -60], width: 16.0, banking: 0.03 },
      { position: [360, 14, -180], width: 16.0, banking: 0.05 },
      { position: [280, 16, -300], width: 16.0, banking: 0.035 },
      { position: [140, 12, -260], width: 16.0, banking: 0.02 },
      { position: [-20, 6, -300], width: 16.0, banking: -0.025 },
      { position: [-160, 4, -200], width: 16.0, banking: 0.035 },
      { position: [-220, 8, -80], width: 16.0, banking: 0.04 },
      { position: [-140, 4, 80], width: 16.0, banking: 0.025 },
      { position: [-40, 1, 60], width: 16.0, banking: 0 }
    ],
    closed: true,
    tension: 0.5,
    defaultWidth: 16.0,
    defaultBanking: 0,
    segments: 300
  },
  terrain: {
    size: 900,
    resolution: 120,
    seed: 67890,
    baseHeight: -2.0,
    heightScale: 28.0,
    corridorWidth: 36.0,
    corridorBlend: 22.0
  },
  boundaries: [
    { type: 'ROAD', lateralDistance: 8.0, hasPhysicalBarrier: true, barrierHeight: 1.2, barrierWidth: 0.8 },
    { type: 'PLAYABLE', lateralDistance: 28.0 },
    { type: 'RESET', lateralDistance: 65.0 }
  ],
  startGrid: {
    positions: 8,
    rowSpacing: 12.0,
    lateralSpacing: 4.0,
    offsetFromStart: 8.0
  }
};

/**
 * 3. Grand Prix Technical (Tight corners & chicanes)
 * Variable road width (12–14m), technical chicanes, hairpins, and elevation dips.
 */
export const GP_TECHNICAL_CONFIG: TrackDefinition = {
  id: 'gp-technical',
  name: 'Grand Prix Technical',
  tagline: 'Precision Chicanes & Grand Prix Parklands',
  description: 'Challenging technical circuit featuring tight chicanes, decreasing-radius turns, and elevation dips.',
  roadWidth: 12.5,
  laps: 3,
  seed: 54321,
  environmentPreset: 'alpine',
  difficulty: 'Expert',
  lengthMeters: 1420,
  elevationRelief: 22,
  recommendedVehicles: ['formula', 'supercar', 'sports'],
  spline: {
    points: [
      { position: [0, 0, 0], width: 14.0, banking: 0 },
      { position: [100, 2, 0], width: 13.0, banking: 0 },
      { position: [180, 8, -30], width: 12.5, banking: 0.025 },
      { position: [210, 14, -90], width: 12.0, banking: 0.045 },
      { position: [170, 12, -150], width: 12.0, banking: -0.035 },
      { position: [200, 18, -210], width: 12.0, banking: 0.045 },
      { position: [120, 22, -260], width: 12.5, banking: 0.02 },
      { position: [40, 16, -220], width: 12.0, banking: -0.025 },
      { position: [-20, 10, -260], width: 12.0, banking: 0.035 },
      { position: [-100, 8, -220], width: 12.5, banking: 0.02 },
      { position: [-170, 4, -140], width: 12.0, banking: 0.06 },
      { position: [-130, 2, -60], width: 12.0, banking: -0.04 },
      { position: [-90, 0, 20], width: 13.0, banking: 0.025 },
      { position: [-30, 0, 30], width: 14.0, banking: 0 }
    ],
    closed: true,
    tension: 0.5,
    defaultWidth: 12.5,
    defaultBanking: 0,
    segments: 340
  },
  terrain: {
    size: 850,
    resolution: 120,
    seed: 54321,
    baseHeight: -3.0,
    heightScale: 35.0,
    corridorWidth: 28.0,
    corridorBlend: 18.0
  },
  boundaries: [
    { type: 'ROAD', lateralDistance: 6.25, hasPhysicalBarrier: true, barrierHeight: 1.2, barrierWidth: 0.8 },
    { type: 'PLAYABLE', lateralDistance: 24.0 },
    { type: 'RESET', lateralDistance: 55.0 }
  ],
  startGrid: {
    positions: 8,
    rowSpacing: 11.0,
    lateralSpacing: 3.4,
    offsetFromStart: 8.0
  }
};

export const TRACK_REGISTRY: Record<string, TrackDefinition> = {
  'alpine-circuit': ALPINE_CIRCUIT_CONFIG,
  'desert-canyon': CANYON_DIABLO_CONFIG,
  'canyon-diablo': CANYON_DIABLO_CONFIG,
  'coastal-speedway': COASTAL_SPEEDWAY_CONFIG,
  'gp-technical': GP_TECHNICAL_CONFIG,
  'grand-prix': GP_TECHNICAL_CONFIG
};

export class TrackManager {
  private activeTrack: Track | null = null;
  private currentTrackId: string = 'alpine-circuit';

  public loadTrack(trackId: string): Track {
    const definition = TRACK_REGISTRY[trackId] ?? ALPINE_CIRCUIT_CONFIG;

    if (this.activeTrack) {
      this.unloadTrack();
    }

    this.currentTrackId = definition.id;
    this.activeTrack = new Track(definition);
    return this.activeTrack;
  }

  public unloadTrack(): void {
    if (this.activeTrack) {
      this.activeTrack.dispose();
      this.activeTrack = null;
    }
  }

  public getTrack(): Track {
    if (!this.activeTrack) {
      return this.loadTrack(this.currentTrackId);
    }
    return this.activeTrack;
  }

  public get activeTrackId(): string {
    return this.currentTrackId;
  }

  public static getAvailableTracks(): TrackDefinition[] {
    return [
      ALPINE_CIRCUIT_CONFIG,
      CANYON_DIABLO_CONFIG,
      COASTAL_SPEEDWAY_CONFIG,
      GP_TECHNICAL_CONFIG
    ];
  }
}

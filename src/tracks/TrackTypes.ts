export type TrackBoundaryType = 'ROAD' | 'PLAYABLE' | 'RESET';

export interface TrackBoundaryDefinition {
  type: TrackBoundaryType;
  lateralDistance: number; // meters from centerline
  barrierHeight?: number;
  barrierWidth?: number;
  hasPhysicalBarrier?: boolean;
}

export interface TrackSplinePointDefinition {
  position: [number, number, number]; // [X, Y (elevation), Z]
  width?: number;                     // Optional local road width override (meters)
  banking?: number;                   // Optional local road banking (radians, positive = banked right)
}

export interface TrackSplineDefinition {
  points: TrackSplinePointDefinition[];
  closed: boolean;
  tension?: number;                   // Catmull-Rom curve tension (default: 0.5)
  defaultWidth: number;
  defaultBanking: number;
  segments: number;                   // Discrete sampling subdivisions
}

export interface TerrainDefinition {
  size: number;                       // Total terrain plane extent in meters (e.g., 900)
  resolution: number;                 // Grid subdivisions per axis (e.g., 128)
  seed: number;                       // Deterministic noise seed
  baseHeight: number;                 // Minimum ground elevation
  heightScale: number;                // Peak-to-trough mountain relief scale
  corridorWidth: number;              // Width of road influence buffer (meters)
  corridorBlend: number;              // Distance over which terrain blends to natural height
}

export interface StartGridConfig {
  positions: number;                  // Total grid slots (e.g., 8)
  rowSpacing: number;                 // Distance between grid rows along track (meters)
  lateralSpacing: number;             // Offset across track between left/right slots (meters)
  offsetFromStart: number;            // Distance behind the finish line for P1 (meters)
}

export interface TrackDefinition {
  id: string;
  name: string;
  description: string;
  roadWidth: number;
  laps: number;
  seed: number;
  environmentPreset?: 'alpine' | 'coastal' | 'desert';
  spline: TrackSplineDefinition;
  terrain: TerrainDefinition;
  boundaries: TrackBoundaryDefinition[];
  startGrid: StartGridConfig;
}

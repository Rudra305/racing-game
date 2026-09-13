export enum WeatherType {
  CLEAR = 'CLEAR',
  CLOUDY = 'CLOUDY',
  LIGHT_RAIN = 'LIGHT_RAIN',
  HEAVY_RAIN = 'HEAVY_RAIN'
}

export interface WeatherProfile {
  type: WeatherType;
  name: string;
  sunColor: number;
  sunIntensity: number;
  skyColor: number;
  groundColor: number;
  ambientIntensity: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  skyTopColor: number;
  skyMidColor: number;
  skyBottomColor: number;
  cloudiness: number; // 0.0 (crystal clear) to 1.0 (thick overcast)
  roadWetness: number; // 0.0 (bone dry) to 1.0 (waterlogged sheen)
  wetGripModifier: number; // 1.0 (dry) to 0.82 (heavy rain)
  rainParticleCount: number; // 0 to 3500
  rainIntensity: number; // 0.0 to 1.0
  rainAudioGain: number; // 0.0 to 0.70
  tireSprayIntensity: number; // 0.0 to 1.0
}

export const WEATHER_PROFILES: Record<WeatherType, WeatherProfile> = {
  [WeatherType.CLEAR]: {
    type: WeatherType.CLEAR,
    name: 'Clear Sky',
    sunColor: 0xfff4e0, // Crisp warm alpine sun
    sunIntensity: 2.2,
    skyColor: 0xd4e7fe, // Vibrant sky ambient
    groundColor: 0x223020, // Pine ground bounce
    ambientIntensity: 0.95,
    fogColor: 0x86b0d9, // Matches horizon of clear procedural sky
    fogNear: 130,
    fogFar: 750,
    skyTopColor: 0x0a1d37,
    skyMidColor: 0x1d4a7a,
    skyBottomColor: 0x86b0d9,
    cloudiness: 0.0,
    roadWetness: 0.0,
    wetGripModifier: 1.0,
    rainParticleCount: 0,
    rainIntensity: 0.0,
    rainAudioGain: 0.0,
    tireSprayIntensity: 0.0
  },
  [WeatherType.CLOUDY]: {
    type: WeatherType.CLOUDY,
    name: 'Overcast & Cloudy',
    sunColor: 0xebf2fa, // Diffuse cool sunlight through clouds
    sunIntensity: 1.15,
    skyColor: 0xa8bac9, // High overcast sky ambient
    groundColor: 0x242d33, // Muted ground bounce
    ambientIntensity: 1.05,
    fogColor: 0x93a5b8, // Soft cool atmospheric haze
    fogNear: 75,
    fogFar: 440,
    skyTopColor: 0x253241,
    skyMidColor: 0x4f6479,
    skyBottomColor: 0x93a5b8,
    cloudiness: 0.75,
    roadWetness: 0.05, // Subtle moisture
    wetGripModifier: 0.98,
    rainParticleCount: 0,
    rainIntensity: 0.0,
    rainAudioGain: 0.0,
    tireSprayIntensity: 0.0
  },
  [WeatherType.LIGHT_RAIN]: {
    type: WeatherType.LIGHT_RAIN,
    name: 'Light Rain & Mist',
    sunColor: 0xcfd9e5, // Low diffuse skylight
    sunIntensity: 0.75,
    skyColor: 0x7b8d9e,
    groundColor: 0x1b2329,
    ambientIntensity: 0.85,
    fogColor: 0x768798, // Wet atmospheric mist
    fogNear: 45,
    fogFar: 320,
    skyTopColor: 0x1d2733,
    skyMidColor: 0x3d4e5f,
    skyBottomColor: 0x768798,
    cloudiness: 0.90,
    roadWetness: 0.60, // Glossy asphalt with water sheen
    wetGripModifier: 0.92, // Slight braking distance increase, controlled cornering
    rainParticleCount: 1600,
    rainIntensity: 0.45,
    rainAudioGain: 0.35,
    tireSprayIntensity: 0.45
  },
  [WeatherType.HEAVY_RAIN]: {
    type: WeatherType.HEAVY_RAIN,
    name: 'Heavy Downpour',
    sunColor: 0x8a99a8, // Dim storm lighting
    sunIntensity: 0.42,
    skyColor: 0x4c5b6b,
    groundColor: 0x141a20,
    ambientIntensity: 0.70,
    fogColor: 0x4b5866, // Dense storm precipitation curtain
    fogNear: 25,
    fogFar: 220,
    skyTopColor: 0x111822,
    skyMidColor: 0x273442,
    skyBottomColor: 0x4b5866,
    cloudiness: 1.0,
    roadWetness: 1.0, // Waterlogged reflective asphalt
    wetGripModifier: 0.82, // Demands throttle discipline and early braking
    rainParticleCount: 3500,
    rainIntensity: 1.0,
    rainAudioGain: 0.70,
    tireSprayIntensity: 1.0
  }
};

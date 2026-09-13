import * as THREE from 'three';

export interface LightingProfileOptions {
  sunColor?: number;
  sunIntensity?: number;
  sunDirection?: THREE.Vector3;
  skyColor?: number;
  groundColor?: number;
  ambientIntensity?: number;
}

export class EnvironmentLighting {
  public readonly group: THREE.Group = new THREE.Group();
  public readonly sunLight: THREE.DirectionalLight;
  public readonly hemiLight: THREE.HemisphereLight;
  public readonly rimLight: THREE.DirectionalLight;

  private readonly sunOffset: THREE.Vector3 = new THREE.Vector3(75, 110, 50);

  constructor(options: LightingProfileOptions = {}) {
    const sunCol = options.sunColor ?? 0xfff4e0; // Warm alpine sun
    const sunInt = options.sunIntensity ?? 2.2;
    const skyCol = options.skyColor ?? 0xd4e7fe; // Crisp mountain sky
    const gndCol = options.groundColor ?? 0x223020; // Dark alpine pine bounce
    const ambInt = options.ambientIntensity ?? 0.95;

    // 1. Ambient Hemisphere Light
    this.hemiLight = new THREE.HemisphereLight(skyCol, gndCol, ambInt);
    this.hemiLight.position.set(0, 80, 0);
    this.group.add(this.hemiLight);

    // 2. Primary Directional Sunlight with tight cascade shadow frustum
    this.sunLight = new THREE.DirectionalLight(sunCol, sunInt);
    this.sunLight.position.copy(this.sunOffset);
    this.sunLight.castShadow = true;

    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 280;

    const d = 65;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0004;
    this.sunLight.shadow.normalBias = 0.02;

    this.group.add(this.sunLight);
    this.group.add(this.sunLight.target);

    // 3. Cool Accent Rim Light
    this.rimLight = new THREE.DirectionalLight(0x76a9fa, 0.45);
    this.rimLight.position.set(-60, 40, -50);
    this.group.add(this.rimLight);
  }

  public update(targetPosition: THREE.Vector3): void {
    this.sunLight.position.set(
      targetPosition.x + this.sunOffset.x,
      targetPosition.y + this.sunOffset.y,
      targetPosition.z + this.sunOffset.z
    );
    this.sunLight.target.position.copy(targetPosition);
    this.sunLight.target.updateMatrixWorld();
  }

  public setLighting(
    sunColor: number,
    sunIntensity: number,
    skyColor: number,
    groundColor: number,
    ambientIntensity: number
  ): void {
    this.sunLight.color.setHex(sunColor);
    this.sunLight.intensity = sunIntensity;

    this.hemiLight.color.setHex(skyColor);
    this.hemiLight.groundColor.setHex(groundColor);
    this.hemiLight.intensity = ambientIntensity;

    // Rim light tracks ambient proportion
    this.rimLight.intensity = Math.max(0.1, ambientIntensity * 0.45);
  }

  public setShadowResolution(res: number): void {
    const clampedRes = Math.max(512, Math.min(2048, res));
    if (this.sunLight.shadow.map) {
      this.sunLight.shadow.map.dispose();
      this.sunLight.shadow.map = null as any;
    }
    this.sunLight.shadow.mapSize.width = clampedRes;
    this.sunLight.shadow.mapSize.height = clampedRes;
  }

  public get sunDirection(): THREE.Vector3 {
    return this.sunOffset.clone().normalize();
  }

  public dispose(): void {
    this.sunLight.dispose();
  }
}

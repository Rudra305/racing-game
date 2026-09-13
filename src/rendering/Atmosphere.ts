import * as THREE from 'three';

export interface AtmosphereOptions {
  fogColor: number;
  fogNear: number;
  fogFar: number;
  density?: number;
}

export class Atmosphere {
  public readonly fog: THREE.Fog;
  public readonly fogColor: THREE.Color;

  constructor(options: AtmosphereOptions = {
    fogColor: 0x86b0d9, // Matches horizon color of procedural Sky dome
    fogNear: 120,
    fogFar: 650
  }) {
    this.fogColor = new THREE.Color(options.fogColor);
    this.fog = new THREE.Fog(this.fogColor, options.fogNear, options.fogFar);
  }

  public applyToScene(scene: THREE.Scene): void {
    scene.fog = this.fog;
    scene.background = this.fogColor;
  }

  public setDistances(near: number, far: number): void {
    this.fog.near = near;
    this.fog.far = far;
  }

  public setColor(hex: number): void {
    this.fogColor.setHex(hex);
    this.fog.color.copy(this.fogColor);
  }

  public setAtmosphere(color: THREE.Color | number, near: number, far: number): void {
    if (typeof color === 'number') {
      this.fogColor.setHex(color);
    } else {
      this.fogColor.copy(color);
    }
    this.fog.color.copy(this.fogColor);
    this.fog.near = near;
    this.fog.far = far;
  }
}

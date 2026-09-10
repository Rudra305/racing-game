import * as THREE from 'three';
import { Sky } from './Sky';
import { Atmosphere } from './Atmosphere';
import { EnvironmentLighting } from './EnvironmentLighting';

export class SceneManager {
  public readonly scene: THREE.Scene;
  public readonly sky: Sky;
  public readonly atmosphere: Atmosphere;
  public readonly lighting: EnvironmentLighting;
  private groundMesh!: THREE.Mesh;

  constructor() {
    this.scene = new THREE.Scene();

    // 1. Procedural Sky Dome
    this.sky = new Sky(1500);
    this.scene.add(this.sky.mesh);

    // 2. Calibrated Atmosphere Fog
    this.atmosphere = new Atmosphere({
      fogColor: 0x86b0d9, // Matches horizon color of Sky
      fogNear: 80,
      fogFar: 600
    });
    this.atmosphere.applyToScene(this.scene);

    // 3. Dynamic Environment Lighting
    this.lighting = new EnvironmentLighting();
    this.scene.add(this.lighting.group);
    this.sky.setSunDirection(this.lighting.sunDirection);

    // 4. Distant Base Apron below mountains
    this.setupGround();
  }

  private setupGround(): void {
    // Deep base ground apron underneath procedural mountain terrain
    const groundGeo = new THREE.PlaneGeometry(2400, 2400, 16, 16);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x223024, // Deep alpine valley green
      roughness: 0.95,
      metalness: 0.05
    });

    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.y = -6.0;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);
  }

  /**
   * Updates sun shadow camera target and sky dome position to follow the car seamlessly
   */
  public updateLightTarget(targetPosition: THREE.Vector3): void {
    this.lighting.update(targetPosition);
    this.sky.updatePosition(targetPosition);
  }

  public add(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  public remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  public dispose(): void {
    this.sky.dispose();
    this.lighting.dispose();
    this.groundMesh.geometry.dispose();
    (this.groundMesh.material as THREE.Material).dispose();
  }
}

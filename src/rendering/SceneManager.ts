import * as THREE from 'three';

export class SceneManager {
  public readonly scene: THREE.Scene;
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private groundMesh!: THREE.Mesh;

  constructor() {
    this.scene = new THREE.Scene();
    this.setupEnvironment();
    this.setupLighting();
    this.setupGround();
  }

  private setupEnvironment(): void {
    // Crisp twilight sky with clean distance horizon
    const skyColor = new THREE.Color(0x131a26);
    this.scene.background = skyColor;
    this.scene.fog = new THREE.FogExp2(0x131a26, 0.0022);
  }

  private setupLighting(): void {
    // Balanced hemisphere lighting for natural ambient tones
    this.hemiLight = new THREE.HemisphereLight(0xecf3ff, 0x1f2735, 0.95);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Directional sunlight with tuned shadow map frustum
    this.dirLight = new THREE.DirectionalLight(0xfffaee, 2.0);
    this.dirLight.position.set(60, 100, 40);
    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 300;

    const d = 80;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;

    this.scene.add(this.dirLight);

    // Subtle accent rim light to define car silhouettes
    const rimLight = new THREE.DirectionalLight(0x58a6ff, 0.6);
    rimLight.position.set(-60, 30, -50);
    this.scene.add(rimLight);
  }

  private setupGround(): void {
    // Endless procedural ground plane
    const groundGeo = new THREE.PlaneGeometry(1200, 1200, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x141a24,
      roughness: 0.9,
      metalness: 0.1
    });

    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.y = -0.05;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // Subtle distance reference grid
    const grid = new THREE.GridHelper(1200, 120, 0x222d3d, 0x1a2330);
    grid.position.y = 0.01;
    this.scene.add(grid);
  }

  /**
   * Updates sun shadow camera target to follow the car seamlessly
   */
  public updateLightTarget(targetPosition: THREE.Vector3): void {
    this.dirLight.position.set(
      targetPosition.x + 60,
      targetPosition.y + 100,
      targetPosition.z + 40
    );
    this.dirLight.target.position.copy(targetPosition);
    this.dirLight.target.updateMatrixWorld();
  }

  public add(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  public remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }
}

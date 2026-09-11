import * as THREE from 'three';
import { Vehicle } from '../../vehicles/Vehicle';
import { VehicleDefinition } from '../../vehicles/VehicleDefinition';
import { VehicleCustomization } from '../../vehicles/VehicleCustomization';

export class VehiclePreview {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private turntableGroup: THREE.Group;
  private currentVehicle: Vehicle | null = null;

  // Orbit controls state
  private isPointerDown: boolean = false;
  private previousPointerPosition: { x: number; y: number } = { x: 0, y: 0 };
  private yaw: number = -0.6; // initial perspective angle
  private pitch: number = 0.28; // slightly elevated angle
  private targetDistance: number = 6.2;
  private currentDistance: number = 6.2;

  public isAutoRotating: boolean = true;
  private autoRotateSpeed: number = 0.45; // radians/sec

  private isActive: boolean = false;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Bound handlers for clean removal
  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;
  private boundWheel: (e: WheelEvent) => void;
  private boundResize: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // 1. Isolated Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.setSize(canvas.clientWidth || 800, canvas.clientHeight || 600, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 2. Isolated Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0d14);

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.2, 50);
    this.scene.add(this.camera);

    // 3. Turntable Root
    this.turntableGroup = new THREE.Group();
    this.scene.add(this.turntableGroup);

    // 4. Studio Environment & Lighting
    this.setupStudioEnvironment();

    // 5. Input Binding
    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundWheel = this.onWheel.bind(this);
    this.boundResize = this.onResize.bind(this);
  }

  private setupStudioEnvironment(): void {
    // Showroom Circular Turntable Floor
    const floorGeo = new THREE.CylinderGeometry(4.8, 5.0, 0.12, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f141c,
      roughness: 0.35,
      metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.06;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Outer Illuminated Floor Rim
    const ringGeo = new THREE.RingGeometry(4.75, 4.95, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x58a6ff,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.002;
    this.scene.add(ringMesh);

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    // Main Studio Key Light (Front-top-right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(5, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Cool Fill Light (Left-side fill)
    const fillLight = new THREE.DirectionalLight(0x79c0ff, 1.2);
    fillLight.position.set(-6, 4, -2);
    this.scene.add(fillLight);

    // Warm Rim Light (Rear backlight highlighting car silhouette)
    const rimLight = new THREE.DirectionalLight(0xffa657, 1.6);
    rimLight.position.set(0, 5, -7);
    this.scene.add(rimLight);

    // Soft Upward Underglow Light
    const underLight = new THREE.DirectionalLight(0x388bfd, 0.5);
    underLight.position.set(0, -3, 0);
    this.scene.add(underLight);
  }

  public loadVehicle(def: VehicleDefinition, customization: VehicleCustomization): void {
    // 1. Dispose previous preview vehicle
    this.disposeCurrentVehicle();

    // 2. Instantiate new Vehicle
    this.currentVehicle = new Vehicle(def, customization);
    this.turntableGroup.add(this.currentVehicle.group);

    // 3. Frame camera based on vehicle dimensions
    const length = def.config.dimensions.length;
    const height = def.config.dimensions.height;
    this.targetDistance = Math.max(5.0, Math.max(length * 1.25, height * 3.6));
    this.currentDistance = this.targetDistance;
  }

  public updateCustomization(customization: VehicleCustomization): void {
    if (this.currentVehicle) {
      this.currentVehicle.applyCustomization(customization);
    }
  }

  public toggleAutoRotate(): boolean {
    this.isAutoRotating = !this.isAutoRotating;
    return this.isAutoRotating;
  }

  public activate(): void {
    if (this.isActive) return;
    this.isActive = true;

    // Attach listeners
    this.canvas.addEventListener('pointerdown', this.boundPointerDown);
    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerup', this.boundPointerUp);
    this.canvas.addEventListener('wheel', this.boundWheel, { passive: false });
    window.addEventListener('resize', this.boundResize);

    this.onResize();
    this.lastTime = performance.now();
    this.startLoop();
  }

  public deactivate(): void {
    if (!this.isActive) return;
    this.isActive = false;

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);
    this.canvas.removeEventListener('wheel', this.boundWheel);
    window.removeEventListener('resize', this.boundResize);
  }

  private startLoop(): void {
    const loop = (time: number) => {
      if (!this.isActive) return;
      const dt = Math.min(0.1, (time - this.lastTime) / 1000);
      this.lastTime = time;

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private update(dt: number): void {
    // 1. Auto-rotation if enabled and not being dragged
    if (this.isAutoRotating && !this.isPointerDown) {
      this.yaw += this.autoRotateSpeed * dt;
    }

    // 2. Smooth zoom interpolation
    this.currentDistance += (this.targetDistance - this.currentDistance) * 0.1;

    // 3. Orbit camera placement
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const sinYaw = Math.sin(this.yaw);
    const cosYaw = Math.cos(this.yaw);

    const cx = this.currentDistance * cosPitch * sinYaw;
    const cy = this.currentDistance * sinPitch + 0.3; // aim slightly above ground plane
    const cz = this.currentDistance * cosPitch * cosYaw;

    this.camera.position.set(cx, cy, cz);
    this.camera.lookAt(0, 0.45, 0); // focus on car center of mass
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private onPointerDown(e: PointerEvent): void {
    this.isPointerDown = true;
    this.previousPointerPosition = { x: e.clientX, y: e.clientY };
    this.canvas.setPointerCapture(e.pointerId);
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isPointerDown) return;

    const deltaX = e.clientX - this.previousPointerPosition.x;
    const deltaY = e.clientY - this.previousPointerPosition.y;
    this.previousPointerPosition = { x: e.clientX, y: e.clientY };

    this.yaw += deltaX * 0.008;
    this.pitch = Math.max(0.08, Math.min(Math.PI * 0.42, this.pitch + deltaY * 0.006));
  }

  private onPointerUp(e: PointerEvent): void {
    this.isPointerDown = false;
    try {
      this.canvas.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.004;
    this.targetDistance = Math.max(3.8, Math.min(10.0, this.targetDistance + zoomDelta));
  }

  public onResize(): void {
    const width = this.canvas.parentElement?.clientWidth || window.innerWidth;
    const height = this.canvas.parentElement?.clientHeight || window.innerHeight;

    if (width > 0 && height > 0) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  public disposeCurrentVehicle(): void {
    if (this.currentVehicle) {
      this.turntableGroup.remove(this.currentVehicle.group);
      this.currentVehicle.dispose();
      this.currentVehicle = null;
    }
  }

  public dispose(): void {
    this.deactivate();
    this.disposeCurrentVehicle();
    this.renderer.dispose();
  }
}

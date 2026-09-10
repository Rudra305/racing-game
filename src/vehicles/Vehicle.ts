import * as THREE from 'three';
import { VehicleConfig, DEFAULT_VEHICLE_CONFIG } from './VehicleConfig';
import { VehiclePhysics } from '../physics/VehiclePhysics';

export class Vehicle {
  public readonly group: THREE.Group;
  private config: VehicleConfig;

  // Visual vehicle sub-hierarchies
  private bodyMesh!: THREE.Mesh;
  private cabinMesh!: THREE.Mesh;

  // Wheels: [0: FL, 1: FR, 2: RL, 3: RR]
  private wheelSteerPivots: THREE.Group[] = [];
  private wheelMeshes: THREE.Mesh[] = [];

  constructor(config: VehicleConfig = DEFAULT_VEHICLE_CONFIG) {
    this.config = config;
    this.group = new THREE.Group();
    this.buildProceduralCar();
  }

  public setConfig(config: VehicleConfig): void {
    this.config = config;
    // Clear and rebuild for new dimensions
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.wheelSteerPivots = [];
    this.wheelMeshes = [];
    this.buildProceduralCar();
  }

  private buildProceduralCar(): void {
    const dim = this.config.dimensions;

    // 1. Aerodynamic Main Body Chassis
    const bodyGeo = new THREE.BoxGeometry(dim.width, 0.48, dim.length);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1f6feb, // Deep electric blue
      roughness: 0.22,
      metalness: 0.88
    });
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.bodyMesh.position.y = dim.wheelRadius + 0.18;
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;
    this.group.add(this.bodyMesh);

    // 2. Tapered Cockpit / Cabin
    const cabinGeo = new THREE.BoxGeometry(dim.width * 0.78, 0.42, dim.length * 0.48);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x090d13, // Smoked glass canopy
      roughness: 0.12,
      metalness: 0.95
    });
    this.cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
    this.cabinMesh.position.set(0, this.bodyMesh.position.y + 0.38, -0.2);
    this.cabinMesh.castShadow = true;
    this.group.add(this.cabinMesh);

    // 3. Front Splitter (Dark Carbon)
    const splitterGeo = new THREE.BoxGeometry(dim.width * 1.02, 0.08, 0.4);
    const splitterMat = new THREE.MeshStandardMaterial({
      color: 0x161b22,
      roughness: 0.5,
      metalness: 0.3
    });
    const splitter = new THREE.Mesh(splitterGeo, splitterMat);
    splitter.position.set(0, dim.wheelRadius, dim.length * 0.5 + 0.1);
    splitter.castShadow = true;
    this.group.add(splitter);

    // 4. Rear Spoiler Wing
    const wingGeo = new THREE.BoxGeometry(dim.width * 0.95, 0.06, 0.32);
    const wing = new THREE.Mesh(wingGeo, splitterMat);
    wing.position.set(0, this.bodyMesh.position.y + 0.52, -dim.length * 0.5 + 0.1);
    wing.castShadow = true;
    this.group.add(wing);

    // 5. Front Headlights (Emissive Cyan/White)
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x58a6ff,
      emissiveIntensity: 3.5,
      roughness: 0.1
    });
    const headlightGeo = new THREE.BoxGeometry(0.32, 0.12, 0.08);

    const leftHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    leftHeadlight.position.set(-dim.width * 0.38, this.bodyMesh.position.y + 0.08, dim.length * 0.5 + 0.01);
    this.group.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    rightHeadlight.position.set(dim.width * 0.38, this.bodyMesh.position.y + 0.08, dim.length * 0.5 + 0.01);
    this.group.add(rightHeadlight);

    // 6. Rear Taillights (Emissive Crimson Red)
    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0x220000,
      emissive: 0xf85149,
      emissiveIntensity: 3.0,
      roughness: 0.1
    });
    const taillightGeo = new THREE.BoxGeometry(0.38, 0.08, 0.06);

    const leftTaillight = new THREE.Mesh(taillightGeo, taillightMat);
    leftTaillight.position.set(-dim.width * 0.38, this.bodyMesh.position.y + 0.08, -dim.length * 0.5 - 0.01);
    this.group.add(leftTaillight);

    const rightTaillight = new THREE.Mesh(taillightGeo, taillightMat);
    rightTaillight.position.set(dim.width * 0.38, this.bodyMesh.position.y + 0.08, -dim.length * 0.5 - 0.01);
    this.group.add(rightTaillight);

    // 7. Four Wheels (FL, FR, RL, RR)
    this.buildWheels();
  }

  private buildWheels(): void {
    const dim = this.config.dimensions;
    const halfBase = dim.wheelBase * 0.5;
    const halfTrack = dim.trackWidth * 0.5;
    const r = dim.wheelRadius;
    const w = dim.wheelWidth;

    const wheelGeo = new THREE.CylinderGeometry(r, r, w, 24);
    wheelGeo.rotateZ(Math.PI / 2); // Orient horizontally

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x111318,
      roughness: 0.85,
      metalness: 0.1
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x8b949e,
      roughness: 0.3,
      metalness: 0.8
    });

    const createWheelInstance = () => {
      const wheelGroup = new THREE.Group();
      const tireMesh = new THREE.Mesh(wheelGeo, tireMat);
      tireMesh.castShadow = true;
      wheelGroup.add(tireMesh);

      const rimGeo = new THREE.CylinderGeometry(r * 0.65, r * 0.65, w * 1.02, 12);
      rimGeo.rotateZ(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      wheelGroup.add(rimMesh);

      return { group: wheelGroup, tireMesh };
    };

    // Positions: [0: FL, 1: FR, 2: RL, 3: RR]
    const wheelPositions = [
      new THREE.Vector3(-halfTrack, r, halfBase),  // Front Left
      new THREE.Vector3(halfTrack, r, halfBase),   // Front Right
      new THREE.Vector3(-halfTrack, r, -halfBase), // Rear Left
      new THREE.Vector3(halfTrack, r, -halfBase)   // Rear Right
    ];

    for (let i = 0; i < 4; i++) {
      const steerPivot = new THREE.Group();
      steerPivot.position.copy(wheelPositions[i]);

      const { group: wheelGroup, tireMesh } = createWheelInstance();
      steerPivot.add(wheelGroup);

      this.group.add(steerPivot);
      this.wheelSteerPivots.push(steerPivot);
      this.wheelMeshes.push(tireMesh);
    }
  }

  /**
   * Synchronize visual representation with advanced Phase 2 physics state.
   * Updates suspension travel, pitch/roll weight transfer, steer, and wheel spin.
   */
  public syncWithPhysics(physics: VehiclePhysics): void {
    // 1. Position & Heading
    this.group.position.x = physics.position.x;
    this.group.position.y = physics.position.y;
    this.group.position.z = physics.position.z;

    this.group.rotation.set(0, physics.heading, 0, 'YXZ');

    // 2. Body Pitch (dive/squat) & Roll (cornering) from SuspensionSystem
    const susp = physics.suspensionSystem;
    this.bodyMesh.rotation.x = -susp.bodyPitch;
    this.bodyMesh.rotation.z = -susp.bodyRoll;
    this.cabinMesh.rotation.x = -susp.bodyPitch;
    this.cabinMesh.rotation.z = -susp.bodyRoll;

    // 3. Wheel Suspension Travel Displacement (4 wheels)
    const baseR = this.config.dimensions.wheelRadius;
    for (let i = 0; i < 4; i++) {
      const disp = susp.wheels[i] ? susp.wheels[i].displacement : 0;
      this.wheelSteerPivots[i].position.y = baseR + disp;
    }

    // 4. Steer angle on front wheels (FL: index 0, FR: index 1)
    const steerAngle = physics.steerAngle;
    this.wheelSteerPivots[0].rotation.y = steerAngle;
    this.wheelSteerPivots[1].rotation.y = steerAngle;

    // 5. Wheel spin rotation around horizontal axle
    const spin = physics.wheelRotation;
    for (let i = 0; i < 4; i++) {
      this.wheelMeshes[i].rotation.x = spin;
    }
  }
}

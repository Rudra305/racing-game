import * as THREE from 'three';
import { VehicleConfig } from './VehicleConfig';
import { VehiclePhysics } from '../physics/VehiclePhysics';
import { VehicleDefinition } from './VehicleDefinition';
import { VehicleCustomization, getDefaultCustomization } from './VehicleCustomization';
import { VehicleFactory, VehicleVisualElements } from './VehicleFactory';
import { VehicleRegistry } from './VehicleRegistry';

import { AssetManager } from '../assets/AssetManager';

export class Vehicle {
  public readonly group: THREE.Group;
  public readonly chassisGroup: THREE.Group;
  public definition!: VehicleDefinition;
  public config!: VehicleConfig;
  public customization!: VehicleCustomization;
  public readonly isPlayer: boolean;

  public visualElements!: VehicleVisualElements;
  public proceduralChassisGroup: THREE.Group = new THREE.Group();
  private externalModel: THREE.Object3D | null = null;

  // Wheels: [0: FL, 1: FR, 2: RL, 3: RR]
  public wheelSteerPivots: THREE.Group[] = [];
  public wheelMeshes: THREE.Mesh[] = [];
  private readonly _interpPos: THREE.Vector3 = new THREE.Vector3();

  constructor(
    definitionOrConfig?: VehicleDefinition | VehicleConfig,
    customizationOrColor?: VehicleCustomization | number,
    isPlayer: boolean = true
  ) {
    this.isPlayer = isPlayer;
    this.group = new THREE.Group();
    this.chassisGroup = new THREE.Group();
    this.group.add(this.chassisGroup);

    // Normalize constructor arguments for backward compatibility and new Phase 6 definitions
    if (definitionOrConfig && 'category' in definitionOrConfig && 'visuals' in definitionOrConfig) {
      this.definition = definitionOrConfig as VehicleDefinition;
      this.config = this.definition.config;
    } else {
      // Default to Apex S1 or construct fallback definition from config
      const fallbackDef = VehicleRegistry.get('sports_apex_s1');
      if (fallbackDef) {
        this.definition = fallbackDef;
        this.config = definitionOrConfig ? (definitionOrConfig as VehicleConfig) : fallbackDef.config;
      } else {
        // Registry might not be initialized yet
        VehicleRegistry.initialize();
        this.definition = VehicleRegistry.getOrThrow('sports_apex_s1');
        this.config = this.definition.config;
      }
    }

    if (typeof customizationOrColor === 'number') {
      this.customization = getDefaultCustomization(
        customizationOrColor,
        0x090d13,
        0x58a6ff,
        this.definition.visuals.defaultWheel.style,
        this.definition.visuals.defaultWheel.color
      );
    } else if (customizationOrColor) {
      this.customization = { ...customizationOrColor };
    } else {
      this.customization = { ...this.definition.visuals.defaultColors };
    }

    this.buildVehicle();
  }

  public setDefinition(definition: VehicleDefinition, customization?: VehicleCustomization): void {
    this.definition = definition;
    this.config = definition.config;
    if (customization) {
      this.customization = { ...customization };
    } else {
      this.customization = { ...definition.visuals.defaultColors };
    }
    this.rebuild();
  }

  public setConfig(config: VehicleConfig): void {
    this.config = config;
    this.rebuild();
  }

  /**
   * Applies cosmetic color, livery, and wheel customization in real time.
   */
  public applyCustomization(customization: VehicleCustomization): void {
    const wheelStyleChanged = this.customization.wheelStyle !== customization.wheelStyle;
    this.customization = { ...customization };

    if (this.visualElements && this.visualElements.materials) {
      this.visualElements.materials.primary.color.setHex(customization.primaryColor);
      this.visualElements.materials.secondary.color.setHex(customization.secondaryColor);
      this.visualElements.materials.accent.color.setHex(customization.accentColor);
      this.visualElements.materials.rim.color.setHex(customization.wheelColor);
    }

    if (wheelStyleChanged) {
      this.rebuildWheelsOnly();
    }
  }

  private rebuild(): void {
    if (this.externalModel) {
      this.chassisGroup.remove(this.externalModel);
      this.externalModel = null;
    }

    // Clear previous chassis geometry
    while (this.chassisGroup.children.length > 0) {
      const child = this.chassisGroup.children[0];
      this.chassisGroup.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    // Remove wheel pivots
    for (const pivot of this.wheelSteerPivots) {
      this.group.remove(pivot);
    }
    this.wheelSteerPivots = [];
    this.wheelMeshes = [];

    this.buildVehicle();
  }

  private rebuildWheelsOnly(): void {
    for (const pivot of this.wheelSteerPivots) {
      this.group.remove(pivot);
    }
    this.wheelSteerPivots = [];
    this.wheelMeshes = [];
    this.buildWheels();
  }

  private buildVehicle(): void {
    const bodyType = this.definition?.visuals?.bodyType || 'sports';

    // Dedicated procedural chassis group so everything procedural (lights, wings, body) can be hidden cleanly
    if (this.proceduralChassisGroup) {
      this.chassisGroup.remove(this.proceduralChassisGroup);
    }
    this.proceduralChassisGroup = new THREE.Group();
    this.chassisGroup.add(this.proceduralChassisGroup);

    // 1. Build body and chassis elements via VehicleFactory (fallback & AI fleet) into proceduralChassisGroup
    this.visualElements = VehicleFactory.buildChassisHierarchy(
      bodyType,
      this.definition,
      this.customization,
      this.proceduralChassisGroup
    );

    // 2. For PLAYER vehicle only: Asynchronously load 3D model if configured
    if (this.isPlayer && (this.definition?.visuals?.modelAssetId || this.definition?.visuals?.modelUrl)) {
      this.loadExternalModel();
    }

    // 3. Build 4 wheels
    this.buildWheels();
  }

  private async loadExternalModel(): Promise<void> {
    const assetId = this.definition?.visuals?.modelAssetId;
    const modelUrl = this.definition?.visuals?.modelUrl;
    if (!assetId && !modelUrl) return;

    try {
      const assetMgr = AssetManager.getInstance();
      let model: THREE.Object3D | null = null;
      if (assetId) {
        model = await assetMgr.loadGameAsset(assetId);
      } else if (modelUrl) {
        model = await assetMgr.loadModel(modelUrl);
      }

      if (!model) return;

      // Check if definition changed while loading
      if (this.definition.visuals.modelAssetId !== assetId && this.definition.visuals.modelUrl !== modelUrl) {
        return;
      }

      const cloned = model.clone(true);

      // Compute bounding box
      const box = new THREE.Box3().setFromObject(cloned);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const dim = this.config.dimensions;
      // Target length along Z, target width along X, target height along Y
      const scaleX = (dim.trackWidth * 1.05) / Math.max(0.1, size.x);
      const scaleY = (dim.height * 0.95) / Math.max(0.1, size.y);
      const scaleZ = (dim.length * 0.92) / Math.max(0.1, size.z);
      const scaleMultiplier = this.definition.visuals.modelScaleMultiplier ?? 1.0;
      const uniformScale = Math.min(scaleX, scaleY, scaleZ) * scaleMultiplier;

      // Wrapper group for clean centering and rotation around origin
      const modelWrapper = new THREE.Group();
      cloned.position.set(-center.x, -box.min.y, -center.z);
      modelWrapper.add(cloned);

      modelWrapper.scale.set(uniformScale, uniformScale, uniformScale);
      if (this.definition.visuals.modelRotationY) {
        modelWrapper.rotation.y = this.definition.visuals.modelRotationY;
      }
      if (this.definition.visuals.modelOffsetY) {
        modelWrapper.position.y += this.definition.visuals.modelOffsetY;
      }

      modelWrapper.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // 100% hide ALL procedural chassis elements (body, headlights, taillights, splitter, wing, etc.)
      if (this.proceduralChassisGroup) {
        this.proceduralChassisGroup.visible = false;
      }

      // Remove existing external model
      if (this.externalModel) {
        this.chassisGroup.remove(this.externalModel);
      }

      this.externalModel = modelWrapper;
      this.chassisGroup.add(modelWrapper);

      // External 3D model already has wheels modeled; hide procedural wheel meshes to avoid duplicates
      for (const pivot of this.wheelSteerPivots) {
        pivot.visible = false;
      }
    } catch (err) {
      console.warn(`[Vehicle] Failed to attach 3D model for ${this.definition.name}:`, err);
      // Fallback: make procedural elements visible
      if (this.proceduralChassisGroup) {
        this.proceduralChassisGroup.visible = true;
      }
      for (const pivot of this.wheelSteerPivots) {
        pivot.visible = true;
      }
    }
  }

  private buildWheels(): void {
    const dim = this.config.dimensions;
    const halfBase = dim.wheelBase * 0.5;
    const halfTrack = dim.trackWidth * 0.5;
    const r = dim.wheelRadius;
    const w = dim.wheelWidth;

    const wheelPositions = [
      new THREE.Vector3(-halfTrack, r, halfBase),  // Front Left
      new THREE.Vector3(halfTrack, r, halfBase),   // Front Right
      new THREE.Vector3(-halfTrack, r, -halfBase), // Rear Left
      new THREE.Vector3(halfTrack, r, -halfBase)   // Rear Right
    ];

    for (let i = 0; i < 4; i++) {
      const steerPivot = new THREE.Group();
      steerPivot.position.copy(wheelPositions[i]);

      const { group: wheelGroup, tireMesh } = VehicleFactory.createWheelInstance(
        r,
        w,
        this.customization.wheelStyle,
        this.visualElements.materials.tire,
        this.visualElements.materials.rim
      );

      steerPivot.add(wheelGroup);
      this.group.add(steerPivot);
      this.wheelSteerPivots.push(steerPivot);
      this.wheelMeshes.push(tireMesh);
    }
  }

  /**
   * Synchronize visual representation with physics state using interpolation alpha (0..1).
   */
  public syncWithPhysics(physics: VehiclePhysics, alpha: number = 1.0): void {
    // 1. Interpolated 3D Position & Orientation (Yaw, Pitch along road gradient, Roll along road banking)
    physics.getInterpolatedPosition(alpha, this._interpPos);
    this.group.position.copy(this._interpPos);

    const heading = physics.getInterpolatedHeading(alpha);
    const pitch = physics.getInterpolatedRoadPitch(alpha);
    const bank = physics.getInterpolatedRoadBank(alpha);

    this.group.rotation.set(-pitch, heading, bank, 'YXZ');

    // 2. Chassis Pitch (rear squat on accel, front dive on brake) & Roll (cornering)
    const susp = physics.suspensionSystem;
    this.chassisGroup.rotation.x = susp.bodyPitch;
    this.chassisGroup.rotation.z = susp.bodyRoll;

    // 3. Wheel Suspension Travel Displacement (smooth curb rumble)
    const baseR = this.config.dimensions.wheelRadius;
    for (let i = 0; i < 4; i++) {
      const curb = (i % 2 === 0 ? 1 : -1) * susp.curbVibration * 0.25;
      this.wheelSteerPivots[i].position.y = baseR + curb;
    }

    // 4. Steer angle on front wheels (FL: 0, FR: 1)
    const steerAngle = physics.steerAngle;
    this.wheelSteerPivots[0].rotation.y = steerAngle;
    this.wheelSteerPivots[1].rotation.y = steerAngle;

    // 5. Wheel spin rotation
    const spin = physics.wheelRotation;
    for (let i = 0; i < 4; i++) {
      this.wheelMeshes[i].rotation.x = spin;
    }
  }

  public dispose(): void {
    while (this.chassisGroup.children.length > 0) {
      const child = this.chassisGroup.children[0] as THREE.Mesh;
      this.chassisGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }
    for (const pivot of this.wheelSteerPivots) {
      this.group.remove(pivot);
    }
    this.wheelSteerPivots = [];
    this.wheelMeshes = [];
  }
}

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
      // Default to Porsche 930 or construct fallback definition from config
      const fallbackDef = VehicleRegistry.get('sports_porsche_930') || VehicleRegistry.get('sports_apex_s1');
      if (fallbackDef) {
        this.definition = fallbackDef;
        this.config = definitionOrConfig ? (definitionOrConfig as VehicleConfig) : fallbackDef.config;
      } else {
        // Registry might not be initialized yet
        VehicleRegistry.initialize();
        this.definition = VehicleRegistry.getOrThrow('sports_porsche_930');
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

    if (this.externalModel) {
      this.applyCustomizationToExternalModel(this.customization);
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
    if (assetId?.startsWith('procedural')) return;

    try {
      const assetMgr = AssetManager.getInstance();
      let model: THREE.Object3D | null = null;
      if (assetId) {
        model = await assetMgr.loadGameAsset(assetId);
      }
      if (!model && modelUrl) {
        model = await assetMgr.loadModel(modelUrl);
      }

      if (!model) return;

      // Check if definition changed while loading
      if (this.definition.visuals.modelAssetId !== assetId && this.definition.visuals.modelUrl !== modelUrl) {
        return;
      }

      const cloned = model.clone(true);

      // Clean unwanted helper meshes from external models (shadow planes, alternative rim variants, fake light glows)
      cloned.traverse((child) => {
        const name = (child.name || '').toLowerCase();
        const mat = (child as THREE.Mesh).material;
        const matName = mat
          ? (Array.isArray(mat) ? mat.map((m) => m.name || '') : [mat.name || '']).join(' ').toLowerCase()
          : '';
        if (
          name.includes('shadow') ||
          name.includes('glow') ||
          name.includes('rim_t0b') ||
          name.includes('_t0b_') ||
          name.endsWith('_t0b') ||
          matName.includes('material.010')
        ) {
          child.visible = false;
        }
      });

      // Wrapper group for clean centering and rotation around origin
      const modelWrapper = new THREE.Group();
      const innerGroup = new THREE.Group();
      innerGroup.add(cloned);

      if (this.definition.visuals.modelRotationX) {
        innerGroup.rotation.x = this.definition.visuals.modelRotationX;
      }
      if (this.definition.visuals.modelRotationY) {
        innerGroup.rotation.y = this.definition.visuals.modelRotationY;
      }
      if (this.definition.visuals.modelRotationZ) {
        innerGroup.rotation.z = this.definition.visuals.modelRotationZ;
      }
      innerGroup.updateMatrixWorld(true);

      // Compute bounding box AFTER rotation is applied so dimensions match vehicle axis conventions
      const box = new THREE.Box3();
      innerGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && child.visible) {
          box.expandByObject(child);
        }
      });
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const dim = this.config.dimensions;
      // Authentic 1:1 real-world scaling:
      // High-detail automotive 3D assets maintain accurate blueprint proportions.
      // Target bumper-to-bumper length along Z is the definitive reference dimension (since raw mesh width includes
      // side mirrors and height includes suspension travel and antennas).
      const scaleZ = dim.length / Math.max(0.0001, size.z);
      const scaleMultiplier = this.definition.visuals.modelScaleMultiplier ?? 1.0;
      const uniformScale = scaleZ * scaleMultiplier;

      // Center inner group relative to modelWrapper so base rests at y=0 and center is at (0, 0)
      innerGroup.position.set(-center.x, -box.min.y, -center.z);
      modelWrapper.add(innerGroup);

      modelWrapper.scale.set(uniformScale, uniformScale, uniformScale);
      if (this.definition.visuals.modelOffsetY) {
        modelWrapper.position.y += this.definition.visuals.modelOffsetY;
      }

      modelWrapper.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const name = (child.name || '').toLowerCase();
          const isInteriorHidden =
            name.includes('carpet') ||
            name.includes('steering') ||
            name.includes('nut') ||
            name.includes('pedal') ||
            name.includes('interior');
          child.castShadow = !isInteriorHidden;
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

      // Immediately apply active customization to the newly attached external 3D model
      this.applyCustomizationToExternalModel(this.customization);

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

  private applyCustomizationToExternalModel(customization: VehicleCustomization): void {
    if (!this.externalModel) return;

    this.externalModel.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const mat = mesh.material;
      if (!mat) return;

      // 1. Polyfork vertex-colored meshes (e.g. mesh_0 with geometry.attributes.color)
      if (mesh.geometry && mesh.geometry.attributes.color) {
        const colAttr = mesh.geometry.attributes.color as THREE.BufferAttribute;
        if (!mesh.userData.originalColors) {
          mesh.userData.originalColors = new Float32Array(colAttr.array);
        }
        const orig = mesh.userData.originalColors as Float32Array;

        const targetColor = new THREE.Color(customization.primaryColor);
        const tR = targetColor.r;
        const tG = targetColor.g;
        const tB = targetColor.b;

        // Identify primary body vertex color (most frequent non-black/non-glass vertex color)
        if (!mesh.userData.bodyHexColor) {
          const counts = new Map<string, number>();
          for (let i = 0; i < colAttr.count; i++) {
            const r = Math.round(orig[i * 3] * 255);
            const g = Math.round(orig[i * 3 + 1] * 255);
            const b = Math.round(orig[i * 3 + 2] * 255);
            if (r < 40 && g < 40 && b < 40) continue;
            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            counts.set(hex, (counts.get(hex) || 0) + 1);
          }
          let maxCount = 0;
          let bodyHex = '';
          for (const [hex, count] of counts.entries()) {
            if (count > maxCount) {
              maxCount = count;
              bodyHex = hex;
            }
          }
          mesh.userData.bodyHexColor = bodyHex;
        }

        const bodyHex = mesh.userData.bodyHexColor;
        if (bodyHex) {
          for (let i = 0; i < colAttr.count; i++) {
            const r = Math.round(orig[i * 3] * 255);
            const g = Math.round(orig[i * 3 + 1] * 255);
            const b = Math.round(orig[i * 3 + 2] * 255);
            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            if (hex === bodyHex) {
              colAttr.setXYZ(i, tR, tG, tB);
            }
          }
          colAttr.needsUpdate = true;
        }
        return;
      }

      // 2. Standard multi-material 3D models (Ferrari 296 GTB & Porsche 911 Turbo)
      const materials = Array.isArray(mat) ? mat : [mat];
      materials.forEach((m) => {
        if (!m || !('color' in m)) return;
        const matName = (m.name || '').toLowerCase();
        const meshName = (mesh.name || '').toLowerCase();

        // Guard: Do NOT tint windows, glass, headlights, tail lights, tires, interior seats, badges, or carpets
        if (
          matName.includes('window') ||
          matName.includes('glass') ||
          matName.includes('tire') ||
          matName.includes('tyre') ||
          matName.includes('cartire') ||
          matName.includes('light') ||
          matName.includes('led') ||
          matName.includes('reflector') ||
          matName.includes('windscreen') ||
          matName.includes('shadow') ||
          matName.includes('atlas') ||
          matName.includes('chrome') ||
          matName.includes('exhaust') ||
          matName.includes('metal_brushed') ||
          (matName.includes('leather') && !matName.includes('red')) ||
          matName.includes('carpet') ||
          matName.includes('interior') ||
          matName.includes('wipers')
        ) {
          return;
        }

        // 1. Primary Body Paint
        if (
          matName === 'body' ||
          matName === 'mt_body' ||
          matName === 'd5_d9_73' ||
          matName === 'material.001' ||
          matName === 'standardsurface1' ||
          matName === 'phong1' ||
          matName.includes('body_color') ||
          matName.includes('paintred') ||
          matName.includes('curacao') ||
          matName.includes('bonnetok') ||
          matName.includes('bumpfrontok') ||
          matName.includes('formula_1_car') ||
          (matName.includes('mcl35m') && !matName.includes('rim') && !matName.includes('wheel') && !matName.includes('tyre')) ||
          (matName.includes('paint') && !matName.includes('yellow') && !matName.includes('tire') && !matName.includes('tyre')) ||
          meshName.startsWith('body')
        ) {
          if (!mesh.userData.clonedPrimaryMat) {
            mesh.material = (m as THREE.MeshStandardMaterial).clone();
            mesh.userData.clonedPrimaryMat = true;
          }
          ((mesh.material as any).color as THREE.Color).setHex(customization.primaryColor);
        }
        // 2. Secondary / Canopy / Roof / Carbon Trim / Splitters / Diffuser
        else if (
          matName.includes('plastic') ||
          matName.includes('trim') ||
          matName.includes('carbon') ||
          matName.includes('abs') ||
          matName.includes('mirrorcover') ||
          matName.includes('misc') ||
          meshName.startsWith('trim') ||
          meshName.includes('roof') ||
          meshName.includes('buttress') ||
          meshName.includes('spoiler')
        ) {
          if (!mesh.userData.clonedTrimMat) {
            mesh.material = (m as THREE.MeshStandardMaterial).clone();
            mesh.userData.clonedTrimMat = true;
          }
          ((mesh.material as any).color as THREE.Color).setHex(customization.secondaryColor);
        }
        // 3. Caliper & Aerodynamic Accents
        else if (
          matName.includes('leather_red') ||
          matName.includes('accent') ||
          matName.includes('brake') ||
          matName.includes('caliper') ||
          matName.includes('brakecaliper') ||
          matName.includes('yellow_trim') ||
          meshName.includes('brake') ||
          meshName.includes('caliper')
        ) {
          if (!mesh.userData.clonedAccentMat) {
            mesh.material = (m as THREE.MeshStandardMaterial).clone();
            mesh.userData.clonedAccentMat = true;
          }
          ((mesh.material as any).color as THREE.Color).setHex(customization.accentColor);
        }
        // 4. Wheels / Rims
        else if (
          matName.includes('rim') ||
          matName.includes('wheel') ||
          matName.includes('alloywheels') ||
          matName.includes('metal_gray') ||
          matName.includes('paintyellow') ||
          matName === 'material.002' ||
          matName === '47_cf_b10' ||
          matName === 'a_53_16_ef1' ||
          matName === 'rim_png' ||
          meshName.startsWith('rim') ||
          meshName.startsWith('wheel') ||
          meshName.includes('rim')
        ) {
          if (!mesh.userData.clonedWheelMat) {
            mesh.material = (m as THREE.MeshStandardMaterial).clone();
            mesh.userData.clonedWheelMat = true;
          }
          ((mesh.material as any).color as THREE.Color).setHex(customization.wheelColor);
        }
      });
    });
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
    // 1. Dispose wheels (rims and tires)
    for (const pivot of this.wheelSteerPivots) {
      pivot.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && mesh.geometry) {
          mesh.geometry.dispose();
        }
      });
      this.group.remove(pivot);
    }
    this.wheelSteerPivots = [];
    this.wheelMeshes = [];

    // 2. Dispose chassis geometry
    this.chassisGroup.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry) {
        mesh.geometry.dispose();
      }
    });
    while (this.chassisGroup.children.length > 0) {
      this.chassisGroup.remove(this.chassisGroup.children[0]);
    }

    if (this.externalModel) {
      this.group.remove(this.externalModel);
      this.externalModel = null;
    }

    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
  }
}

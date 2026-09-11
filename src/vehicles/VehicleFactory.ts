import * as THREE from 'three';
import { VehicleDefinition, VehicleBodyType } from './VehicleDefinition';
import { VehicleCustomization, WheelStyleId } from './VehicleCustomization';

export interface VehicleVisualElements {
  bodyMeshes: THREE.Mesh[];
  cabinMeshes: THREE.Mesh[];
  accentMeshes: THREE.Mesh[];
  materials: {
    primary: THREE.MeshStandardMaterial;
    secondary: THREE.MeshStandardMaterial;
    accent: THREE.MeshStandardMaterial;
    carbon: THREE.MeshStandardMaterial;
    headlight: THREE.MeshStandardMaterial;
    taillight: THREE.MeshStandardMaterial;
    tire: THREE.MeshStandardMaterial;
    rim: THREE.MeshStandardMaterial;
  };
}

export class VehicleFactory {
  /**
   * Builds the procedural 3D chassis elements for a given body type and customization.
   */
  public static buildChassisHierarchy(
    bodyType: VehicleBodyType,
    def: VehicleDefinition,
    customization: VehicleCustomization,
    targetGroup: THREE.Group
  ): VehicleVisualElements {
    const dim = def.config.dimensions;

    // 1. Materials
    const primaryMat = new THREE.MeshStandardMaterial({
      color: customization.primaryColor,
      roughness: bodyType === 'rally' ? 0.35 : 0.22,
      metalness: bodyType === 'suv' ? 0.65 : 0.88
    });

    const secondaryMat = new THREE.MeshStandardMaterial({
      color: customization.secondaryColor,
      roughness: 0.18,
      metalness: 0.92
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: customization.accentColor,
      roughness: 0.25,
      metalness: 0.75
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x161b22,
      roughness: 0.55,
      metalness: 0.35
    });

    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x58a6ff,
      emissiveIntensity: 3.5,
      roughness: 0.1
    });

    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0x220000,
      emissive: 0xf85149,
      emissiveIntensity: 3.0,
      roughness: 0.1
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x111318,
      roughness: 0.88,
      metalness: 0.08
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: customization.wheelColor,
      roughness: 0.28,
      metalness: 0.82
    });

    const visualElements: VehicleVisualElements = {
      bodyMeshes: [],
      cabinMeshes: [],
      accentMeshes: [],
      materials: {
        primary: primaryMat,
        secondary: secondaryMat,
        accent: accentMat,
        carbon: carbonMat,
        headlight: headlightMat,
        taillight: taillightMat,
        tire: tireMat,
        rim: rimMat
      }
    };

    switch (bodyType) {
      case 'formula':
        this.buildFormulaChassis(dim, visualElements, targetGroup);
        break;
      case 'supercar':
        this.buildSupercarChassis(dim, visualElements, targetGroup);
        break;
      case 'rally':
        this.buildRallyChassis(dim, visualElements, targetGroup);
        break;
      case 'suv':
        this.buildSUVChassis(dim, visualElements, targetGroup);
        break;
      case 'sports':
      default:
        this.buildSportsChassis(dim, visualElements, targetGroup);
        break;
    }

    return visualElements;
  }

  // --- SPORTS ARCHETYPE (Balanced GT Coupe) ---
  private static buildSportsChassis(
    dim: VehicleDefinition['config']['dimensions'],
    vis: VehicleVisualElements,
    group: THREE.Group
  ): void {
    const groundY = dim.wheelRadius + 0.16;

    // Main Body
    const bodyGeo = new THREE.BoxGeometry(dim.width, 0.46, dim.length);
    const body = new THREE.Mesh(bodyGeo, vis.materials.primary);
    body.position.set(0, groundY, 0);
    body.castShadow = true;
    group.add(body);
    vis.bodyMeshes.push(body);

    // Coupe Cabin
    const cabinGeo = new THREE.BoxGeometry(dim.width * 0.76, 0.40, dim.length * 0.48);
    const cabin = new THREE.Mesh(cabinGeo, vis.materials.secondary);
    cabin.position.set(0, groundY + 0.38, -0.2);
    cabin.castShadow = true;
    group.add(cabin);
    vis.cabinMeshes.push(cabin);

    // Carbon Front Splitter
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 1.02, 0.07, 0.42), vis.materials.carbon);
    splitter.position.set(0, dim.wheelRadius, dim.length * 0.5 + 0.1);
    splitter.castShadow = true;
    group.add(splitter);

    // GT Wing
    const wing = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.94, 0.05, 0.32), vis.materials.accent);
    wing.position.set(0, groundY + 0.50, -dim.length * 0.5 + 0.1);
    wing.castShadow = true;
    group.add(wing);
    vis.accentMeshes.push(wing);

    // Headlights & Taillights
    this.addStandardLights(dim, groundY, vis, group);
  }

  // --- SUPERCAR ARCHETYPE (Low-slung Aerodynamic Hypercar) ---
  private static buildSupercarChassis(
    dim: VehicleDefinition['config']['dimensions'],
    vis: VehicleVisualElements,
    group: THREE.Group
  ): void {
    const groundY = dim.wheelRadius + 0.12;

    // Wedge Body
    const bodyGeo = new THREE.BoxGeometry(dim.width * 0.98, 0.36, dim.length);
    const body = new THREE.Mesh(bodyGeo, vis.materials.primary);
    body.position.set(0, groundY, 0);
    body.castShadow = true;
    group.add(body);
    vis.bodyMeshes.push(body);

    // Sleek Hypercar Canopy
    const canopyGeo = new THREE.BoxGeometry(dim.width * 0.65, 0.34, dim.length * 0.52);
    const canopy = new THREE.Mesh(canopyGeo, vis.materials.secondary);
    canopy.position.set(0, groundY + 0.30, -0.15);
    canopy.castShadow = true;
    group.add(canopy);
    vis.cabinMeshes.push(canopy);

    // Aggressive Side Intake Pods
    const podGeo = new THREE.BoxGeometry(0.18, 0.28, dim.length * 0.36);
    const leftPod = new THREE.Mesh(podGeo, vis.materials.carbon);
    leftPod.position.set(-dim.width * 0.50, groundY + 0.06, -0.2);
    const rightPod = new THREE.Mesh(podGeo, vis.materials.carbon);
    rightPod.position.set(dim.width * 0.50, groundY + 0.06, -0.2);
    group.add(leftPod, rightPod);

    // Large Rear Diffuser
    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.92, 0.12, 0.45), vis.materials.carbon);
    diffuser.position.set(0, dim.wheelRadius + 0.02, -dim.length * 0.5 - 0.15);
    group.add(diffuser);

    // High-Downforce Active Wing
    const wing = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 1.05, 0.04, 0.36), vis.materials.accent);
    wing.position.set(0, groundY + 0.56, -dim.length * 0.5 - 0.05);
    wing.castShadow = true;
    group.add(wing);
    vis.accentMeshes.push(wing);

    // Slim LED Blade Lights
    const headMat = vis.materials.headlight;
    const leftHead = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.05, 0.08), headMat);
    leftHead.position.set(-dim.width * 0.38, groundY + 0.04, dim.length * 0.5 + 0.01);
    const rightHead = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.05, 0.08), headMat);
    rightHead.position.set(dim.width * 0.38, groundY + 0.04, dim.length * 0.5 + 0.01);
    group.add(leftHead, rightHead);

    const tailMat = vis.materials.taillight;
    const rearLightStrip = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.85, 0.04, 0.06), tailMat);
    rearLightStrip.position.set(0, groundY + 0.08, -dim.length * 0.5 - 0.02);
    group.add(rearLightStrip);
  }

  // --- RALLY ARCHETYPE (AWD Stage Rally Hatch) ---
  private static buildRallyChassis(
    dim: VehicleDefinition['config']['dimensions'],
    vis: VehicleVisualElements,
    group: THREE.Group
  ): void {
    const groundY = dim.wheelRadius + 0.22;

    // Compact Rally Hatch Body
    const bodyGeo = new THREE.BoxGeometry(dim.width, 0.50, dim.length);
    const body = new THREE.Mesh(bodyGeo, vis.materials.primary);
    body.position.set(0, groundY, 0);
    body.castShadow = true;
    group.add(body);
    vis.bodyMeshes.push(body);

    // Boxy High-Roof Cabin
    const cabinGeo = new THREE.BoxGeometry(dim.width * 0.82, 0.44, dim.length * 0.62);
    const cabin = new THREE.Mesh(cabinGeo, vis.materials.secondary);
    cabin.position.set(0, groundY + 0.42, -0.22);
    cabin.castShadow = true;
    group.add(cabin);
    vis.cabinMeshes.push(cabin);

    // Roof Air Scoop
    const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.45), vis.materials.accent);
    scoop.position.set(0, groundY + 0.68, 0.2);
    group.add(scoop);
    vis.accentMeshes.push(scoop);

    // Front Auxiliary Rally Lamp Pod (4 Round Pods)
    for (let i = -1.5; i <= 1.5; i += 1) {
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12), vis.materials.headlight);
      lamp.rotation.x = Math.PI / 2;
      lamp.position.set(i * 0.24, groundY + 0.26, dim.length * 0.5 + 0.08);
      group.add(lamp);
    }

    // Rear Roof Spoiler
    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.88, 0.06, 0.38), vis.materials.accent);
    spoiler.position.set(0, groundY + 0.64, -dim.length * 0.5 + 0.1);
    group.add(spoiler);
    vis.accentMeshes.push(spoiler);

    // Mudflaps (Red/Dark Carbon)
    const flapMat = vis.materials.carbon;
    const leftFlap = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.02), flapMat);
    leftFlap.position.set(-dim.width * 0.48, dim.wheelRadius * 0.6, -dim.length * 0.5 - 0.05);
    const rightFlap = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.02), flapMat);
    rightFlap.position.set(dim.width * 0.48, dim.wheelRadius * 0.6, -dim.length * 0.5 - 0.05);
    group.add(leftFlap, rightFlap);

    this.addStandardLights(dim, groundY, vis, group);
  }

  // --- SUV ARCHETYPE (Heavy-Duty Rugged 4x4) ---
  private static buildSUVChassis(
    dim: VehicleDefinition['config']['dimensions'],
    vis: VehicleVisualElements,
    group: THREE.Group
  ): void {
    const groundY = dim.wheelRadius + 0.32;

    // Heavy Box Chassis
    const bodyGeo = new THREE.BoxGeometry(dim.width * 1.02, 0.62, dim.length);
    const body = new THREE.Mesh(bodyGeo, vis.materials.primary);
    body.position.set(0, groundY, 0);
    body.castShadow = true;
    group.add(body);
    vis.bodyMeshes.push(body);

    // Tall SUV Greenhouse / Cabin
    const cabinGeo = new THREE.BoxGeometry(dim.width * 0.88, 0.60, dim.length * 0.68);
    const cabin = new THREE.Mesh(cabinGeo, vis.materials.secondary);
    cabin.position.set(0, groundY + 0.58, -0.15);
    cabin.castShadow = true;
    group.add(cabin);
    vis.cabinMeshes.push(cabin);

    // Roof Utility Rails (Pair)
    const railGeo = new THREE.BoxGeometry(0.06, 0.06, dim.length * 0.65);
    const leftRail = new THREE.Mesh(railGeo, vis.materials.carbon);
    leftRail.position.set(-dim.width * 0.42, groundY + 0.92, -0.15);
    const rightRail = new THREE.Mesh(railGeo, vis.materials.carbon);
    rightRail.position.set(dim.width * 0.42, groundY + 0.92, -0.15);
    group.add(leftRail, rightRail);

    // Heavy Reinforced Front Bull-Bar
    const bullBar = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.85, 0.28, 0.16), vis.materials.carbon);
    bullBar.position.set(0, groundY - 0.08, dim.length * 0.5 + 0.12);
    group.add(bullBar);

    // Side Step Runners
    const runnerGeo = new THREE.BoxGeometry(0.12, 0.04, dim.length * 0.55);
    const leftRunner = new THREE.Mesh(runnerGeo, vis.materials.accent);
    leftRunner.position.set(-dim.width * 0.54, groundY - 0.20, 0);
    const rightRunner = new THREE.Mesh(runnerGeo, vis.materials.accent);
    rightRunner.position.set(dim.width * 0.54, groundY - 0.20, 0);
    group.add(leftRunner, rightRunner);
    vis.accentMeshes.push(leftRunner, rightRunner);

    this.addStandardLights(dim, groundY, vis, group);
  }

  // --- FORMULA ARCHETYPE (Open-Wheel Single-Seater) ---
  private static buildFormulaChassis(
    dim: VehicleDefinition['config']['dimensions'],
    vis: VehicleVisualElements,
    group: THREE.Group
  ): void {
    const groundY = dim.wheelRadius + 0.06;

    // 1. Sleek Central Monocoque Cockpit & Tapered Needle Nose
    const noseGeo = new THREE.BoxGeometry(dim.width * 0.38, 0.28, dim.length * 0.62);
    const nose = new THREE.Mesh(noseGeo, vis.materials.primary);
    nose.position.set(0, groundY + 0.04, 0.4);
    nose.castShadow = true;
    group.add(nose);
    vis.bodyMeshes.push(nose);

    // Engine Cover / Rear Cowl
    const cowlGeo = new THREE.BoxGeometry(dim.width * 0.50, 0.36, dim.length * 0.38);
    const cowl = new THREE.Mesh(cowlGeo, vis.materials.primary);
    cowl.position.set(0, groundY + 0.10, -dim.length * 0.25);
    cowl.castShadow = true;
    group.add(cowl);
    vis.bodyMeshes.push(cowl);

    // 2. Cockpit Opening & Smoked Aeroscreen
    const cockpitGeo = new THREE.BoxGeometry(dim.width * 0.32, 0.16, 0.52);
    const cockpit = new THREE.Mesh(cockpitGeo, vis.materials.secondary);
    cockpit.position.set(0, groundY + 0.20, 0.15);
    group.add(cockpit);
    vis.cabinMeshes.push(cockpit);

    // Halo Safety Bar
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 16, Math.PI), vis.materials.carbon);
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, groundY + 0.34, 0.28);
    group.add(halo);

    // 3. Side Radiator Pods (Aero Sidepods)
    const podGeo = new THREE.BoxGeometry(0.32, 0.22, dim.length * 0.35);
    const leftPod = new THREE.Mesh(podGeo, vis.materials.primary);
    leftPod.position.set(-dim.width * 0.36, groundY + 0.02, -0.2);
    const rightPod = new THREE.Mesh(podGeo, vis.materials.primary);
    rightPod.position.set(dim.width * 0.36, groundY + 0.02, -0.2);
    group.add(leftPod, rightPod);
    vis.bodyMeshes.push(leftPod, rightPod);

    // 4. Massive Multi-Element Front Wing
    const frontWing = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.98, 0.04, 0.45), vis.materials.accent);
    frontWing.position.set(0, dim.wheelRadius * 0.6, dim.length * 0.5 + 0.15);
    frontWing.castShadow = true;
    group.add(frontWing);
    vis.accentMeshes.push(frontWing);

    // Front Wing Endplates
    const endplateGeo = new THREE.BoxGeometry(0.04, 0.20, 0.46);
    const leftEndplate = new THREE.Mesh(endplateGeo, vis.materials.carbon);
    leftEndplate.position.set(-dim.width * 0.49, dim.wheelRadius * 0.8, dim.length * 0.5 + 0.15);
    const rightEndplate = new THREE.Mesh(endplateGeo, vis.materials.carbon);
    rightEndplate.position.set(dim.width * 0.49, dim.wheelRadius * 0.8, dim.length * 0.5 + 0.15);
    group.add(leftEndplate, rightEndplate);

    // 5. Tall Bi-Plane Rear Wing
    const rearWingUpper = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.78, 0.04, 0.32), vis.materials.accent);
    rearWingUpper.position.set(0, groundY + 0.58, -dim.length * 0.5 - 0.1);
    rearWingUpper.castShadow = true;
    const rearWingLower = new THREE.Mesh(new THREE.BoxGeometry(dim.width * 0.76, 0.03, 0.28), vis.materials.carbon);
    rearWingLower.position.set(0, groundY + 0.42, -dim.length * 0.5 - 0.08);
    group.add(rearWingUpper, rearWingLower);
    vis.accentMeshes.push(rearWingUpper);

    // Rear Endplates
    const rearPlateGeo = new THREE.BoxGeometry(0.03, 0.42, 0.38);
    const leftRearPlate = new THREE.Mesh(rearPlateGeo, vis.materials.carbon);
    leftRearPlate.position.set(-dim.width * 0.39, groundY + 0.50, -dim.length * 0.5 - 0.1);
    const rightRearPlate = new THREE.Mesh(rearPlateGeo, vis.materials.carbon);
    rightRearPlate.position.set(dim.width * 0.39, groundY + 0.50, -dim.length * 0.5 - 0.1);
    group.add(leftRearPlate, rightRearPlate);

    // 6. Exposed Suspension Arms (Wishbones)
    const armGeo = new THREE.CylinderGeometry(0.015, 0.015, dim.width * 0.42, 6);
    armGeo.rotateZ(Math.PI / 2);
    const frontArms = new THREE.Mesh(armGeo, vis.materials.carbon);
    frontArms.position.set(0, dim.wheelRadius * 0.9, dim.wheelBase * 0.5);
    const rearArms = new THREE.Mesh(armGeo, vis.materials.carbon);
    rearArms.position.set(0, dim.wheelRadius * 0.9, -dim.wheelBase * 0.5);
    group.add(frontArms, rearArms);

    // High-visibility Rain Light (FIA rear flasher)
    const rainLight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), vis.materials.taillight);
    rainLight.position.set(0, dim.wheelRadius * 0.8, -dim.length * 0.5 - 0.22);
    group.add(rainLight);
  }

  // --- STANDARD HEADLIGHTS & TAILLIGHTS ---
  private static addStandardLights(
    dim: VehicleDefinition['config']['dimensions'],
    groundY: number,
    vis: VehicleVisualElements,
    group: THREE.Group
  ): void {
    const headlightGeo = new THREE.BoxGeometry(0.32, 0.10, 0.08);
    const leftHeadlight = new THREE.Mesh(headlightGeo, vis.materials.headlight);
    leftHeadlight.position.set(-dim.width * 0.38, groundY + 0.08, dim.length * 0.5 + 0.01);
    const rightHeadlight = new THREE.Mesh(headlightGeo, vis.materials.headlight);
    rightHeadlight.position.set(dim.width * 0.38, groundY + 0.08, dim.length * 0.5 + 0.01);
    group.add(leftHeadlight, rightHeadlight);

    const taillightGeo = new THREE.BoxGeometry(0.36, 0.08, 0.06);
    const leftTaillight = new THREE.Mesh(taillightGeo, vis.materials.taillight);
    leftTaillight.position.set(-dim.width * 0.38, groundY + 0.08, -dim.length * 0.5 - 0.01);
    const rightTaillight = new THREE.Mesh(taillightGeo, vis.materials.taillight);
    rightTaillight.position.set(dim.width * 0.38, groundY + 0.08, -dim.length * 0.5 - 0.01);
    group.add(leftTaillight, rightTaillight);
  }

  /**
   * Creates a wheel group with distinct rims corresponding to wheel style.
   */
  public static createWheelInstance(
    radius: number,
    width: number,
    style: WheelStyleId,
    tireMat: THREE.MeshStandardMaterial,
    rimMat: THREE.MeshStandardMaterial
  ): { group: THREE.Group; tireMesh: THREE.Mesh } {
    const wheelGroup = new THREE.Group();

    // 1. Tire Rubber Outer Geometry
    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 24);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireGeo, tireMat);
    tireMesh.castShadow = true;
    wheelGroup.add(tireMesh);

    // 2. Rim / Wheel Style Geometry
    const rimRadius = radius * (style === 'offroad_beadlock' ? 0.58 : 0.68);
    const rimWidth = width * 1.02;

    switch (style) {
      case 'turbofan': {
        // Flat aerodynamic turbofan disc with cooling vent slots
        const discGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, rimWidth, 18);
        discGeo.rotateZ(Math.PI / 2);
        const discMesh = new THREE.Mesh(discGeo, rimMat);
        wheelGroup.add(discMesh);
        break;
      }
      case 'offroad_beadlock': {
        // Deep dish center with heavy outer beadlock ring
        const centerGeo = new THREE.CylinderGeometry(rimRadius * 0.85, rimRadius * 0.85, rimWidth, 12);
        centerGeo.rotateZ(Math.PI / 2);
        const centerMesh = new THREE.Mesh(centerGeo, rimMat);
        wheelGroup.add(centerMesh);
        break;
      }
      case 'formula_monoblock': {
        // Lightweight center-lock race wheel
        const monoGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, rimWidth * 0.95, 16);
        monoGeo.rotateZ(Math.PI / 2);
        const monoMesh = new THREE.Mesh(monoGeo, rimMat);
        wheelGroup.add(monoMesh);
        break;
      }
      case 'sport_mesh':
      default: {
        // Multi-spoke alloy rim
        const spokeGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, rimWidth, 14);
        spokeGeo.rotateZ(Math.PI / 2);
        const spokeMesh = new THREE.Mesh(spokeGeo, rimMat);
        wheelGroup.add(spokeMesh);
        break;
      }
    }

    return { group: wheelGroup, tireMesh };
  }
}

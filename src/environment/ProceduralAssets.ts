import * as THREE from 'three';

/**
 * High-performance procedural parametric 3D models with discrete LOD levels.
 * Built for zero runtime allocations and maximum instancing efficiency.
 */
export class ProceduralAssets {
  // Shared materials for memory efficiency
  public static trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x422a1d, // Alpine bark brown
    roughness: 0.9,
    metalness: 0.05
  });

  public static birchTrunkMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8d4cb, // Silver birch pale bark
    roughness: 0.75,
    metalness: 0.05
  });

  public static foliageFirMaterial = new THREE.MeshStandardMaterial({
    color: 0x1c3b24, // Deep alpine pine evergreen
    roughness: 0.85,
    metalness: 0.02,
    side: THREE.DoubleSide
  });

  public static foliagePineMaterial = new THREE.MeshStandardMaterial({
    color: 0x274a2e, // Scots pine olive green
    roughness: 0.85,
    metalness: 0.02,
    side: THREE.DoubleSide
  });

  public static foliageBirchMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a7c36, // Alpine deciduous bright green
    roughness: 0.8,
    metalness: 0.02,
    side: THREE.DoubleSide
  });

  public static bushMaterial = new THREE.MeshStandardMaterial({
    color: 0x2e5234, // Undergrowth shrub
    roughness: 0.85,
    metalness: 0.02
  });

  public static grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x567d38, // High mountain meadow grass
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide
  });

  public static rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x6e737c, // Alpine granite
    roughness: 0.92,
    metalness: 0.12,
    flatShading: true
  });

  public static steelMaterial = new THREE.MeshStandardMaterial({
    color: 0xadb5bd, // Galvanized zinc steel
    roughness: 0.45,
    metalness: 0.8
  });

  public static woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c4033, // Treated timber post
    roughness: 0.85,
    metalness: 0.05
  });

  public static rubberMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1e, // Matte vulcanized tire rubber
    roughness: 0.94,
    metalness: 0.06
  });

  public static cactusMaterial = new THREE.MeshStandardMaterial({
    color: 0x486b3e, // Saguaro desert olive green
    roughness: 0.88,
    metalness: 0.02
  });

  public static palmTrunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x6e523f, // Coastal palm fiber trunk
    roughness: 0.9,
    metalness: 0.04
  });

  public static palmFrondMaterial = new THREE.MeshStandardMaterial({
    color: 0x2e6f3b, // Vivid tropical palm frond
    roughness: 0.82,
    metalness: 0.02,
    side: THREE.DoubleSide
  });

  public static desertScrubMaterial = new THREE.MeshStandardMaterial({
    color: 0x9b8858, // Arid tumbleweed/scrub
    roughness: 0.92,
    metalness: 0.01
  });

  public static coastalScrubMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a7848, // Seaside bluff dune grass
    roughness: 0.88,
    metalness: 0.01,
    side: THREE.DoubleSide
  });

  public static sandstoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x9e4428, // Red canyon sandstone
    roughness: 0.94,
    metalness: 0.06,
    flatShading: true
  });

  public static coastalRockMaterial = new THREE.MeshStandardMaterial({
    color: 0x585d66, // Weathered ocean bluff rock
    roughness: 0.92,
    metalness: 0.08,
    flatShading: true
  });

  public static lighthouseMaterial = new THREE.MeshStandardMaterial({
    color: 0xeeeeee, // Crisp marine white
    roughness: 0.45,
    metalness: 0.15
  });

  public static lighthouseRedMaterial = new THREE.MeshStandardMaterial({
    color: 0xc92a2a, // Nautical signal red
    roughness: 0.45,
    metalness: 0.15
  });

  // Global singleton geometry and texture caches to eliminate GPU duplicate uploads
  private static geometryCache: Map<string, THREE.BufferGeometry> = new Map();
  private static brakeMarkerTextures: Map<number, THREE.CanvasTexture> = new Map();
  private static brakeMarkerMaterials: Map<number, THREE.MeshStandardMaterial> = new Map();
  private static brakeMarkerBoardGeo: THREE.BufferGeometry | null = null;
  private static brakeMarkerPostGeo: THREE.BufferGeometry | null = null;

  public static getFirGeometry(lod: 0 | 1 | 2): THREE.BufferGeometry {
    const key = `fir_${lod}`;
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createFirGeometry(lod));
    return this.geometryCache.get(key)!;
  }

  public static getPineGeometry(lod: 0 | 1 | 2): THREE.BufferGeometry {
    const key = `pine_${lod}`;
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createPineGeometry(lod));
    return this.geometryCache.get(key)!;
  }

  public static getBirchGeometry(lod: 0 | 1 | 2): THREE.BufferGeometry {
    const key = `birch_${lod}`;
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createBirchGeometry(lod));
    return this.geometryCache.get(key)!;
  }

  public static getBushGeometry(lod: 0 | 1): THREE.BufferGeometry {
    const key = `bush_${lod}`;
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createBushGeometry(lod));
    return this.geometryCache.get(key)!;
  }

  public static getFernGeometry(): THREE.BufferGeometry {
    const key = 'fern';
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createFernGeometry());
    return this.geometryCache.get(key)!;
  }

  public static getGrassGeometry(): THREE.BufferGeometry {
    const key = 'grass';
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createGrassGeometry());
    return this.geometryCache.get(key)!;
  }

  public static getRockGeometry(variant: 0 | 1): THREE.BufferGeometry {
    const key = `rock_${variant}`;
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createRockGeometry(variant));
    return this.geometryCache.get(key)!;
  }

  public static getSaguaroCactusGeometry(lod: 0 | 1 | 2): THREE.BufferGeometry {
    const key = `cactus_${lod}`;
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createSaguaroCactusGeometry(lod));
    return this.geometryCache.get(key)!;
  }

  public static getPalmTreeGeometry(lod: 0 | 1 | 2): THREE.BufferGeometry {
    const key = `palm_${lod}`;
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createPalmTreeGeometry(lod));
    return this.geometryCache.get(key)!;
  }

  public static getDesertScrubGeometry(): THREE.BufferGeometry {
    const key = 'desert_scrub';
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createDesertScrubGeometry());
    return this.geometryCache.get(key)!;
  }

  public static getSandstoneBoulderGeometry(variant: 0 | 1): THREE.BufferGeometry {
    const key = `sandstone_rock_${variant}`;
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createSandstoneBoulderGeometry(variant));
    return this.geometryCache.get(key)!;
  }

  public static getCoastalScrubGeometry(): THREE.BufferGeometry {
    const key = 'coastal_scrub';
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createCoastalScrubGeometry());
    return this.geometryCache.get(key)!;
  }

  public static getCoastalRockGeometry(variant: 0 | 1): THREE.BufferGeometry {
    const key = `coastal_rock_${variant}`;
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createCoastalRockGeometry(variant));
    return this.geometryCache.get(key)!;
  }

  public static getGuardrailSegmentGeometry(length: number = 4.5): THREE.BufferGeometry {
    const key = `guardrail_${length}`;
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createGuardrailSegmentGeometry(length));
    return this.geometryCache.get(key)!;
  }

  public static getReflectorPostGeometry(): THREE.BufferGeometry {
    const key = 'reflector_post';
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createReflectorPostGeometry());
    return this.geometryCache.get(key)!;
  }

  public static getTireBarrierStackGeometry(): THREE.BufferGeometry {
    const key = 'tire_barrier';
    if (!this.geometryCache.has(key)) this.geometryCache.set(key, this.createTireBarrierStackGeometry());
    return this.geometryCache.get(key)!;
  }

  /**
   * 1. Alpine Fir Tree (LOD 0, 1, 2)
   */
  public static createFirGeometry(lod: 0 | 1 | 2): THREE.BufferGeometry {
    if (lod === 2) {
      // LOD 2: Fast cross-quad billboard (2 planes intersecting at 90 degrees)
      const w = 3.2;
      const h = 8.5;
      const geo1 = new THREE.PlaneGeometry(w, h);
      geo1.translate(0, h * 0.5, 0);
      const geo2 = new THREE.PlaneGeometry(w, h);
      geo2.rotateY(Math.PI / 2);
      geo2.translate(0, h * 0.5, 0);

      // Merge into a single BufferGeometry
      return this.mergeGeometries([geo1, geo2]);
    }

    if (lod === 1) {
      // LOD 1: Low-poly conical tiers + 5-sided trunk
      const parts: THREE.BufferGeometry[] = [];
      const trunk = new THREE.CylinderGeometry(0.2, 0.35, 4.0, 5);
      trunk.translate(0, 2.0, 0);
      parts.push(trunk);

      const tiers = [
        { r: 2.2, h: 3.2, y: 3.2 },
        { r: 1.7, h: 3.0, y: 5.2 },
        { r: 1.1, h: 2.8, y: 7.0 }
      ];

      for (const t of tiers) {
        const cone = new THREE.ConeGeometry(t.r, t.h, 5);
        cone.translate(0, t.y + t.h * 0.5, 0);
        parts.push(cone);
      }

      return this.mergeGeometries(parts);
    }

    // LOD 0: High-detail multi-tiered alpine fir with layered canopy boughs
    const parts: THREE.BufferGeometry[] = [];
    const trunk = new THREE.CylinderGeometry(0.22, 0.4, 5.0, 7);
    trunk.translate(0, 2.5, 0);
    parts.push(trunk);

    const tiers = [
      { r: 2.5, h: 3.4, y: 2.4, segs: 8 },
      { r: 2.1, h: 3.2, y: 4.2, segs: 8 },
      { r: 1.6, h: 3.0, y: 5.8, segs: 7 },
      { r: 1.1, h: 2.6, y: 7.2, segs: 6 }
    ];

    for (const t of tiers) {
      const cone = new THREE.ConeGeometry(t.r, t.h, t.segs);
      // Displace vertices subtly to create natural irregular pine branch drape
      const pos = cone.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const py = pos.getY(i);
        if (py < 0) {
          const px = pos.getX(i);
          const pz = pos.getZ(i);
          const angle = Math.atan2(pz, px);
          const wobble = Math.sin(angle * 4) * 0.18;
          pos.setX(i, px * (1 + wobble));
          pos.setZ(i, pz * (1 + wobble));
        }
      }
      cone.computeVertexNormals();
      cone.translate(0, t.y + t.h * 0.5, 0);
      parts.push(cone);
    }

    return this.mergeGeometries(parts);
  }

  /**
   * 2. Scots Mountain Pine (Layered umbrella pads)
   */
  public static createPineGeometry(lod: 0 | 1 | 2): THREE.BufferGeometry {
    if (lod === 2) {
      const w = 4.2;
      const h = 7.5;
      const g1 = new THREE.PlaneGeometry(w, h);
      g1.translate(0, h * 0.5, 0);
      const g2 = new THREE.PlaneGeometry(w, h);
      g2.rotateY(Math.PI / 2);
      g2.translate(0, h * 0.5, 0);
      return this.mergeGeometries([g1, g2]);
    }

    const segs = lod === 1 ? 5 : 7;
    const parts: THREE.BufferGeometry[] = [];

    // Gnarled angled trunk
    const trunkLow = new THREE.CylinderGeometry(0.28, 0.42, 3.8, segs);
    trunkLow.translate(0, 1.9, 0);
    parts.push(trunkLow);

    // Foliage pads
    const pads = [
      { rx: -0.7, rz: 0.5, y: 4.2, r: 1.6, h: 0.9 },
      { rx: 0.8, rz: -0.4, y: 5.4, r: 1.8, h: 1.0 },
      { rx: 0.1, rz: 0.2, y: 6.8, r: 2.1, h: 1.1 }
    ];

    for (const p of pads) {
      const pad = new THREE.CylinderGeometry(p.r * 0.8, p.r, p.h, segs);
      pad.translate(p.rx, p.y + p.h * 0.5, p.rz);
      parts.push(pad);
    }

    return this.mergeGeometries(parts);
  }

  /**
   * 3. Mountain Birch (Slender pale trunk with rounded crown)
   */
  public static createBirchGeometry(lod: 0 | 1 | 2): THREE.BufferGeometry {
    if (lod === 2) {
      const w = 3.5;
      const h = 7.0;
      const g1 = new THREE.PlaneGeometry(w, h);
      g1.translate(0, h * 0.5, 0);
      const g2 = new THREE.PlaneGeometry(w, h);
      g2.rotateY(Math.PI / 2);
      g2.translate(0, h * 0.5, 0);
      return this.mergeGeometries([g1, g2]);
    }

    const segs = lod === 1 ? 5 : 7;
    const parts: THREE.BufferGeometry[] = [];

    const trunk = new THREE.CylinderGeometry(0.14, 0.25, 4.5, segs);
    trunk.translate(0, 2.25, 0);
    parts.push(trunk);

    const crown = new THREE.DodecahedronGeometry(1.9, lod === 1 ? 0 : 1);
    crown.scale(1.0, 1.35, 1.0);
    crown.translate(0, 5.2, 0);
    parts.push(crown);

    return this.mergeGeometries(parts);
  }

  /**
   * 4. Alpine Shrub / Bush (Dense rounded cluster)
   */
  public static createBushGeometry(lod: 0 | 1): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];
    const count = lod === 0 ? 3 : 2;

    const clusters = [
      { x: 0, y: 0.5, z: 0, r: 0.8 },
      { x: 0.4, y: 0.4, z: 0.3, r: 0.65 },
      { x: -0.3, y: 0.35, z: -0.2, r: 0.6 }
    ];

    for (let i = 0; i < count; i++) {
      const c = clusters[i];
      const sphere = new THREE.DodecahedronGeometry(c.r, lod === 0 ? 1 : 0);
      sphere.scale(1.1, 0.75, 1.0);
      sphere.translate(c.x, c.y, c.z);
      parts.push(sphere);
    }

    return this.mergeGeometries(parts);
  }

  /**
   * 5. Mountain Fern
   */
  public static createFernGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const frond = new THREE.PlaneGeometry(0.45, 1.1);
      frond.rotateX(Math.PI / 3);
      frond.rotateY(angle);
      frond.translate(Math.sin(angle) * 0.3, 0.35, Math.cos(angle) * 0.3);
      parts.push(frond);
    }
    return this.mergeGeometries(parts);
  }

  /**
   * 6. Alpine Grass Tufts
   */
  public static createGrassGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];
    const blades = [0, Math.PI / 3, (Math.PI * 2) / 3];
    for (const a of blades) {
      const plane = new THREE.PlaneGeometry(0.9, 0.65);
      plane.rotateY(a);
      plane.translate(0, 0.32, 0);
      parts.push(plane);
    }
    return this.mergeGeometries(parts);
  }

  /**
   * 7. Granite Boulders (Faceted sharp mountain rock)
   */
  public static createRockGeometry(variant: number = 0): THREE.BufferGeometry {
    const seed = variant === 0 ? 0.95 : 1.35;
    const geo = new THREE.DodecahedronGeometry(seed, 1);
    const pos = geo.attributes.position;

    // Displace vertices deterministically for sharp natural cleavage
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const dist = Math.sqrt(vx * vx + vy * vy + vz * vz);
      const scale = 1.0 + Math.sin(vx * 3.5 + vy * 2.1) * 0.22 + Math.cos(vz * 2.8) * 0.15;
      pos.setXYZ(i, (vx / dist) * seed * scale, (vy / dist) * (seed * 0.75) * scale, (vz / dist) * seed * scale);
    }

    geo.computeVertexNormals();
    geo.translate(0, seed * 0.5, 0);
    return geo;
  }

  /**
   * 8. Roadside Guardrail Unit Segment (3 meters long W-beam)
   */
  public static createGuardrailSegmentGeometry(length: number = 3.0): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];

    // 1. Galvanized W-beam rail (profile extruded or box with corrugated indentation)
    const rail = new THREE.BoxGeometry(length, 0.35, 0.08);
    rail.translate(0, 0.72, 0);
    parts.push(rail);

    // 2. Wooden support post at center
    const post = new THREE.BoxGeometry(0.12, 0.95, 0.12);
    post.translate(0, 0.47, -0.06);
    parts.push(post);

    return this.mergeGeometries(parts);
  }

  /**
   * 9. Directional Chevron Sign (Hairpin Curve Indicator)
   */
  public static createChevronSignGeometry(isRight: boolean = true): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];

    // Dual steel posts
    const postLeft = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6);
    postLeft.translate(-0.55, 0.9, 0);
    parts.push(postLeft);

    const postRight = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6);
    postRight.translate(0.55, 0.9, 0);
    parts.push(postRight);

    // Sign plate (1.4m wide x 0.8m high)
    const plate = new THREE.BoxGeometry(1.4, 0.8, 0.04);
    plate.translate(0, 1.35, 0.03);
    parts.push(plate);

    // Arrow chevron mesh relief
    const arrow = new THREE.ConeGeometry(0.28, 0.5, 3);
    arrow.rotateZ(isRight ? -Math.PI / 2 : Math.PI / 2);
    arrow.translate(0, 1.35, 0.06);
    parts.push(arrow);

    return this.mergeGeometries(parts);
  }

  /**
   * 10. Speed Limit Sign (Circular highway sign)
   */
  public static createSpeedSignGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];

    // Post
    const post = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6);
    post.translate(0, 1.1, 0);
    parts.push(post);

    // Circular plate
    const plate = new THREE.CylinderGeometry(0.42, 0.42, 0.03, 16);
    plate.rotateX(Math.PI / 2);
    plate.translate(0, 1.8, 0.02);
    parts.push(plate);

    return this.mergeGeometries(parts);
  }

  /**
   * 11. Road Reflector Bollard (Post with retro-reflective bands)
   */
  public static createReflectorPostGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];

    // Body (slanted top)
    const body = new THREE.CylinderGeometry(0.05, 0.06, 0.95, 8);
    body.translate(0, 0.47, 0);
    parts.push(body);

    // Reflector stud
    const stud = new THREE.BoxGeometry(0.08, 0.12, 0.04);
    stud.translate(0, 0.78, 0.04);
    parts.push(stud);

    return this.mergeGeometries(parts);
  }

  /**
   * 12. Alpine Observation Lookout Tower (Landmark)
   */
  public static createLookoutTowerGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];

    // 4 Corner timber stilts
    const legH = 9.0;
    const spread = 2.4;
    const legCoords = [
      [-spread, -spread],
      [spread, -spread],
      [-spread, spread],
      [spread, spread]
    ];

    for (const [lx, lz] of legCoords) {
      const leg = new THREE.CylinderGeometry(0.18, 0.25, legH, 6);
      leg.translate(lx, legH * 0.5, lz);
      parts.push(leg);
    }

    // Platform cabin
    const cabin = new THREE.BoxGeometry(spread * 2.5, 2.8, spread * 2.5);
    cabin.translate(0, legH + 1.4, 0);
    parts.push(cabin);

    // Gabled roof
    const roof = new THREE.ConeGeometry(spread * 2.2, 1.8, 4);
    roof.rotateY(Math.PI / 4);
    roof.translate(0, legH + 2.8 + 0.9, 0);
    parts.push(roof);

    return this.mergeGeometries(parts);
  }

  /**
   * 13. Summit Weather Station Mast (Landmark)
   */
  public static createSummitMastGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];

    // Lattice radio mast
    const mast = new THREE.CylinderGeometry(0.08, 0.35, 14.0, 4);
    mast.translate(0, 7.0, 0);
    parts.push(mast);

    // Top sphere / antenna dome
    const dome = new THREE.SphereGeometry(0.75, 8, 8);
    dome.translate(0, 14.2, 0);
    parts.push(dome);

    return this.mergeGeometries(parts);
  }

  /**
   * 14. Hairpin Runoff Tire Barrier Stack
   * 3-tier stacked racing tire bundle
   */
  public static createTireBarrierStackGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];
    const tiers = 3;
    const tireRadius = 0.42;
    const tireHeight = 0.26;

    for (let i = 0; i < tiers; i++) {
      const tire = new THREE.CylinderGeometry(tireRadius, tireRadius, tireHeight, 14);
      tire.translate(0, tireHeight * 0.5 + i * tireHeight, 0);
      parts.push(tire);
    }

    return this.mergeGeometries(parts);
  }

  /**
   * 15. Corner Distance Brake Marker Sign (150m, 100m, 50m)
   */
  public static createBrakeMarkerMesh(distanceMeters: number): THREE.Group {
    const group = new THREE.Group();

    // Post (shared cached geometry)
    if (!this.brakeMarkerPostGeo) {
      const geo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8);
      geo.translate(0, 0.7, 0);
      this.brakeMarkerPostGeo = geo;
    }
    const postMesh = new THREE.Mesh(this.brakeMarkerPostGeo, this.steelMaterial);
    group.add(postMesh);

    // Sign Board (shared cached geometry)
    if (!this.brakeMarkerBoardGeo) {
      const geo = new THREE.BoxGeometry(0.85, 0.75, 0.04);
      geo.translate(0, 1.15, 0);
      this.brakeMarkerBoardGeo = geo;
    }

    // High-contrast procedural distance texture (shared singleton per distance value)
    let boardMat = this.brakeMarkerMaterials.get(distanceMeters);
    if (!boardMat) {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 128, 128);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#0f172a';
        ctx.strokeRect(4, 4, 120, 120);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(distanceMeters.toString(), 64, 64);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      this.brakeMarkerTextures.set(distanceMeters, texture);

      boardMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.4,
        metalness: 0.1
      });
      this.brakeMarkerMaterials.set(distanceMeters, boardMat);
    }

    const boardMesh = new THREE.Mesh(this.brakeMarkerBoardGeo, boardMat);
    group.add(boardMesh);

    return group;
  }

  /**
   * 16. Desert Saguaro Cactus (LOD 0, 1, 2)
   */
  public static createSaguaroCactusGeometry(lod: 0 | 1 | 2): THREE.BufferGeometry {
    if (lod === 2) {
      const w = 2.4;
      const h = 5.5;
      const geo1 = new THREE.PlaneGeometry(w, h);
      geo1.translate(0, h * 0.5, 0);
      const geo2 = new THREE.PlaneGeometry(w, h);
      geo2.rotateY(Math.PI / 2);
      geo2.translate(0, h * 0.5, 0);
      return this.mergeGeometries([geo1, geo2]);
    }

    if (lod === 1) {
      const parts: THREE.BufferGeometry[] = [];
      const trunk = new THREE.CylinderGeometry(0.32, 0.38, 5.0, 6);
      trunk.translate(0, 2.5, 0);
      parts.push(trunk);

      const armConn = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 5);
      armConn.rotateZ(Math.PI / 2);
      armConn.translate(-0.55, 3.0, 0);
      parts.push(armConn);

      const armUp = new THREE.CylinderGeometry(0.2, 0.2, 1.4, 5);
      armUp.translate(-0.95, 3.7, 0);
      parts.push(armUp);

      return this.mergeGeometries(parts);
    }

    // LOD 0: Multi-branching saguaro with rounded ribs
    const parts: THREE.BufferGeometry[] = [];
    const trunk = new THREE.CylinderGeometry(0.34, 0.38, 5.2, 8);
    trunk.translate(0, 2.6, 0);
    parts.push(trunk);

    const dome = new THREE.SphereGeometry(0.34, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5);
    dome.translate(0, 5.2, 0);
    parts.push(dome);

    // Left arm
    const lConn = new THREE.CylinderGeometry(0.22, 0.22, 0.9, 7);
    lConn.rotateZ(Math.PI / 2);
    lConn.translate(-0.65, 3.2, 0);
    parts.push(lConn);

    const lUp = new THREE.CylinderGeometry(0.22, 0.22, 1.8, 7);
    lUp.translate(-1.1, 4.1, 0);
    parts.push(lUp);

    const lDome = new THREE.SphereGeometry(0.22, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.5);
    lDome.translate(-1.1, 5.0, 0);
    parts.push(lDome);

    // Right arm
    const rConn = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 7);
    rConn.rotateZ(Math.PI / 2);
    rConn.translate(0.6, 2.4, 0);
    parts.push(rConn);

    const rUp = new THREE.CylinderGeometry(0.2, 0.2, 1.4, 7);
    rUp.translate(1.0, 3.1, 0);
    parts.push(rUp);

    const rDome = new THREE.SphereGeometry(0.2, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.5);
    rDome.translate(1.0, 3.8, 0);
    parts.push(rDome);

    return this.mergeGeometries(parts);
  }

  /**
   * 17. Desert Arid Scrub Bush / Tumbleweed
   */
  public static createDesertScrubGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];
    const p1 = new THREE.PlaneGeometry(1.4, 1.0);
    p1.translate(0, 0.5, 0);
    parts.push(p1);

    const p2 = new THREE.PlaneGeometry(1.3, 0.9);
    p2.rotateY(Math.PI / 3);
    p2.translate(0, 0.45, 0);
    parts.push(p2);

    const p3 = new THREE.PlaneGeometry(1.2, 0.85);
    p3.rotateY((Math.PI * 2) / 3);
    p3.translate(0, 0.42, 0);
    parts.push(p3);

    return this.mergeGeometries(parts);
  }

  /**
   * 18. Coastal Palm Tree (LOD 0, 1, 2)
   */
  public static createPalmTreeGeometry(lod: 0 | 1 | 2): THREE.BufferGeometry {
    if (lod === 2) {
      const w = 4.5;
      const h = 7.5;
      const geo1 = new THREE.PlaneGeometry(w, h);
      geo1.translate(0, h * 0.5, 0);
      const geo2 = new THREE.PlaneGeometry(w, h);
      geo2.rotateY(Math.PI / 2);
      geo2.translate(0, h * 0.5, 0);
      return this.mergeGeometries([geo1, geo2]);
    }

    if (lod === 1) {
      const parts: THREE.BufferGeometry[] = [];
      const trunk = new THREE.CylinderGeometry(0.2, 0.35, 6.5, 5);
      trunk.translate(0, 3.25, 0);
      parts.push(trunk);

      for (let i = 0; i < 4; i++) {
        const frond = new THREE.PlaneGeometry(1.2, 3.2);
        frond.rotateX(-0.6);
        frond.rotateY(i * (Math.PI / 2));
        frond.translate(0, 6.2, 0);
        parts.push(frond);
      }
      return this.mergeGeometries(parts);
    }

    // LOD 0: Multi-segment leaning palm with radiating canopy fronds
    const parts: THREE.BufferGeometry[] = [];
    const t1 = new THREE.CylinderGeometry(0.3, 0.38, 2.5, 7);
    t1.translate(0, 1.25, 0);
    parts.push(t1);

    const t2 = new THREE.CylinderGeometry(0.25, 0.3, 2.5, 7);
    t2.rotateZ(-0.06);
    t2.translate(0.1, 3.6, 0);
    parts.push(t2);

    const t3 = new THREE.CylinderGeometry(0.2, 0.25, 2.5, 7);
    t3.rotateZ(-0.14);
    t3.translate(0.35, 5.8, 0);
    parts.push(t3);

    for (let i = 0; i < 8; i++) {
      const angle = i * (Math.PI / 4);
      const frond = new THREE.BoxGeometry(0.45, 0.03, 2.6);
      frond.rotateX(-0.55);
      frond.rotateY(angle);
      frond.translate(0.5, 6.8, 0);
      parts.push(frond);
    }

    return this.mergeGeometries(parts);
  }

  /**
   * 19. Coastal Dune Grass / Scrub
   */
  public static createCoastalScrubGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];
    const p1 = new THREE.PlaneGeometry(1.2, 1.2);
    p1.translate(0, 0.6, 0);
    parts.push(p1);

    const p2 = new THREE.PlaneGeometry(1.1, 1.1);
    p2.rotateY(Math.PI * 0.4);
    p2.translate(0, 0.55, 0);
    parts.push(p2);

    return this.mergeGeometries(parts);
  }

  /**
   * 20. Sandstone Rock Formation (Variant 0, 1)
   */
  public static createSandstoneBoulderGeometry(variant: 0 | 1): THREE.BufferGeometry {
    const geo = new THREE.DodecahedronGeometry(variant === 0 ? 1.6 : 2.4, 0);
    if (variant === 0) {
      geo.scale(1.5, 0.7, 1.2);
    } else {
      geo.scale(1.2, 0.6, 1.7);
    }
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * 21. Coastal Sea Bluff Rock (Variant 0, 1)
   */
  public static createCoastalRockGeometry(variant: 0 | 1): THREE.BufferGeometry {
    const geo = new THREE.DodecahedronGeometry(variant === 0 ? 1.8 : 2.8, 0);
    geo.scale(1.0, 1.4, 1.2);
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * 22. Coastal Lighthouse Landmark
   */
  public static createLighthouseGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];

    const base = new THREE.CylinderGeometry(3.6, 3.8, 1.6, 12);
    base.translate(0, 0.8, 0);
    parts.push(base);

    const tower = new THREE.CylinderGeometry(1.6, 2.8, 16.0, 12);
    tower.translate(0, 9.6, 0);
    parts.push(tower);

    const balcony = new THREE.CylinderGeometry(2.3, 2.1, 0.4, 12);
    balcony.translate(0, 17.8, 0);
    parts.push(balcony);

    const lantern = new THREE.CylinderGeometry(1.5, 1.5, 2.2, 10);
    lantern.translate(0, 19.0, 0);
    parts.push(lantern);

    const dome = new THREE.SphereGeometry(1.5, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
    dome.translate(0, 20.1, 0);
    parts.push(dome);

    return this.mergeGeometries(parts);
  }

  /**
   * 23. Desert Sandstone Arch Landmark
   */
  public static createSandstoneArchGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = [];

    const p1 = new THREE.CylinderGeometry(1.8, 2.5, 13.0, 8);
    p1.translate(-6.5, 6.5, 0);
    parts.push(p1);

    const p2 = new THREE.CylinderGeometry(1.8, 2.5, 13.0, 8);
    p2.translate(6.5, 6.5, 0);
    parts.push(p2);

    const arch = new THREE.BoxGeometry(15.0, 2.2, 3.2);
    arch.translate(0, 13.5, 0);
    parts.push(arch);

    return this.mergeGeometries(parts);
  }

  /**
   * High-efficiency BufferGeometry merger without external dependencies.
   */
  private static mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    let totalVertices = 0;
    let totalIndices = 0;

    for (const g of geometries) {
      const pos = g.attributes.position;
      totalVertices += pos.count;
      if (g.index) {
        totalIndices += g.index.count;
      } else {
        totalIndices += pos.count;
      }
    }

    const outPositions = new Float32Array(totalVertices * 3);
    const outNormals = new Float32Array(totalVertices * 3);
    const outIndices = new Uint32Array(totalIndices);

    let vOffset = 0;
    let iOffset = 0;
    let vertexCountSoFar = 0;

    for (const g of geometries) {
      const pos = g.attributes.position;
      const norm = g.attributes.normal;
      const count = pos.count;

      for (let i = 0; i < count * 3; i++) {
        outPositions[vOffset + i] = pos.array[i];
        outNormals[vOffset + i] = norm ? norm.array[i] : 0;
      }

      if (g.index) {
        for (let i = 0; i < g.index.count; i++) {
          outIndices[iOffset + i] = g.index.array[i] + vertexCountSoFar;
        }
        iOffset += g.index.count;
      } else {
        for (let i = 0; i < count; i++) {
          outIndices[iOffset + i] = i + vertexCountSoFar;
        }
        iOffset += count;
      }

      vOffset += count * 3;
      vertexCountSoFar += count;
    }

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(outPositions, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(outNormals, 3));
    merged.setIndex(new THREE.BufferAttribute(outIndices, 1));
    merged.computeBoundingSphere();
    merged.computeBoundingBox();

    // Clean up sub-geometries
    for (const g of geometries) {
      g.dispose();
    }

    return merged;
  }
}

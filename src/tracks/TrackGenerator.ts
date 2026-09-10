import * as THREE from 'three';
import { Checkpoint } from './Checkpoint';

export interface TrackConfig {
  width: number;
  segments: number;
  barrierHeight: number;
  barrierWidth: number;
}

export interface GeneratedTrackData {
  roadMesh: THREE.Mesh;
  barrierMesh: THREE.Mesh;
  kerbMesh: THREE.Mesh;
  finishLineMesh: THREE.Mesh;
  curve: THREE.CatmullRomCurve3;
  checkpoints: Checkpoint[];
  spawnPosition: THREE.Vector3;
  spawnHeading: number;
  sampledCenters: THREE.Vector3[];
  sampledNormals: THREE.Vector3[];
  sampledTangents: THREE.Vector3[];
}

export class TrackGenerator {
  public static generate(config: TrackConfig): GeneratedTrackData {
    // 1. Grand-Prix Circuit Spline Control Points (Smooth, closed loop)
    const controlPoints: THREE.Vector3[] = [
      new THREE.Vector3(0, 0, 0),        // Main straight (Start / Finish)
      new THREE.Vector3(120, 0, 0),      // High-speed straight
      new THREE.Vector3(220, 0, -40),    // Turn 1 entry
      new THREE.Vector3(270, 0, -130),   // Turn 1 sweeping carousel
      new THREE.Vector3(220, 0, -230),   // Turn 2 exit
      new THREE.Vector3(110, 0, -220),   // Fast section
      new THREE.Vector3(40, 0, -280),    // Chicane entry
      new THREE.Vector3(-30, 0, -250),   // Chicane apex
      new THREE.Vector3(-120, 0, -290),  // Hairpin entry
      new THREE.Vector3(-210, 0, -220),  // Hairpin apex
      new THREE.Vector3(-190, 0, -110),  // Hairpin exit
      new THREE.Vector3(-110, 0, -50),   // Technical S-curve
      new THREE.Vector3(-140, 0, 50),    // Final turn entry
      new THREE.Vector3(-90, 0, 110),    // Final turn apex
      new THREE.Vector3(-20, 0, 40)      // Exit onto main straight
    ];

    const curve = new THREE.CatmullRomCurve3(controlPoints, true, 'catmullrom', 0.5);

    const segments = config.segments;
    const halfWidth = config.width * 0.5;
    const barrierH = config.barrierHeight;
    const barrierW = config.barrierWidth;

    const sampledCenters: THREE.Vector3[] = [];
    const sampledNormals: THREE.Vector3[] = [];
    const sampledTangents: THREE.Vector3[] = [];

    // Pre-sample spline points, tangents, and normals
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i <= segments; i++) {
      const u = (i % segments) / segments;
      const center = curve.getPointAt(u);
      const tangent = curve.getTangentAt(u).normalize();
      // Normal vector pointing to the right across the track
      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();

      sampledCenters.push(center);
      sampledTangents.push(tangent);
      sampledNormals.push(normal);
    }

    // 2. Generate Road Mesh Geometry
    const roadVertices: number[] = [];
    const roadNormals: number[] = [];
    const roadUvs: number[] = [];
    const roadIndices: number[] = [];

    // 3. Generate Barrier Geometry (Left and Right Armco barriers)
    const barrierVertices: number[] = [];
    const barrierNormals: number[] = [];
    const barrierIndices: number[] = [];

    // 4. Generate Kerbs (Alternating red/white edge curbs)
    const kerbVertices: number[] = [];
    const kerbColors: number[] = [];
    const kerbIndices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const c = sampledCenters[i];
      const n = sampledNormals[i];

      // Road left and right edge
      const lx = c.x - n.x * halfWidth;
      const lz = c.z - n.z * halfWidth;
      const rx = c.x + n.x * halfWidth;
      const rz = c.z + n.z * halfWidth;
      const y = 0.02; // Slightly above ground to prevent z-fighting

      // Road Vertices: [Left, Right]
      roadVertices.push(lx, y, lz);
      roadVertices.push(rx, y, rz);

      roadNormals.push(0, 1, 0);
      roadNormals.push(0, 1, 0);

      roadUvs.push(0, (i / segments) * 40);
      roadUvs.push(1, (i / segments) * 40);

      // Barriers (Left barrier: Base, Top, OuterBase, OuterTop)
      const bIdx = (barrierVertices.length / 3);
      // Left Barrier face pointing toward track (+N)
      barrierVertices.push(lx, 0, lz);
      barrierVertices.push(lx, barrierH, lz);
      barrierVertices.push(lx - n.x * barrierW, barrierH, lz - n.z * barrierW);
      barrierVertices.push(lx - n.x * barrierW, 0, lz - n.z * barrierW);

      barrierNormals.push(n.x, 0, n.z);
      barrierNormals.push(n.x, 0, n.z);
      barrierNormals.push(-n.x, 0, -n.z);
      barrierNormals.push(-n.x, 0, -n.z);

      // Right Barrier face pointing toward track (-N)
      barrierVertices.push(rx, 0, rz);
      barrierVertices.push(rx, barrierH, rz);
      barrierVertices.push(rx + n.x * barrierW, barrierH, rz + n.z * barrierW);
      barrierVertices.push(rx + n.x * barrierW, 0, rz + n.z * barrierW);

      barrierNormals.push(-n.x, 0, -n.z);
      barrierNormals.push(-n.x, 0, -n.z);
      barrierNormals.push(n.x, 0, n.z);
      barrierNormals.push(n.x, 0, n.z);

      // Kerb strips
      const isRed = (Math.floor(i / 2) % 2) === 0;
      const r = isRed ? 0.95 : 0.95;
      const g = isRed ? 0.15 : 0.95;
      const b = isRed ? 0.15 : 0.95;

      const kerbW = 0.6;
      // Left Kerb
      kerbVertices.push(lx, y + 0.02, lz);
      kerbVertices.push(lx + n.x * kerbW, y + 0.02, lz + n.z * kerbW);
      kerbColors.push(r, g, b, r, g, b);

      // Right Kerb
      kerbVertices.push(rx - n.x * kerbW, y + 0.02, rz - n.z * kerbW);
      kerbVertices.push(rx, y + 0.02, rz);
      kerbColors.push(r, g, b, r, g, b);

      if (i < segments) {
        // Road Quads (CCW winding: r0 -> r1 -> r2 and r1 -> r3 -> r2)
        const r0 = i * 2;
        const r1 = r0 + 1;
        const r2 = r0 + 2;
        const r3 = r0 + 3;
        roadIndices.push(r0, r1, r2);
        roadIndices.push(r1, r3, r2);

        // Barrier Quads (Front faces)
        const nextB = bIdx + 8;
        // Left barrier inner face
        barrierIndices.push(bIdx, bIdx + 1, nextB);
        barrierIndices.push(bIdx + 1, nextB + 1, nextB);
        // Left barrier top
        barrierIndices.push(bIdx + 1, bIdx + 2, nextB + 1);
        barrierIndices.push(bIdx + 2, nextB + 2, nextB + 1);

        // Right barrier inner face
        const rbIdx = bIdx + 4;
        const nextRB = nextB + 4;
        barrierIndices.push(rbIdx, nextRB, rbIdx + 1);
        barrierIndices.push(rbIdx + 1, nextRB, nextRB + 1);
        // Right barrier top
        barrierIndices.push(rbIdx + 1, nextRB + 1, rbIdx + 2);
        barrierIndices.push(rbIdx + 2, nextRB + 1, nextRB + 2);

        // Kerb Quads (CCW)
        const k0 = i * 4;
        kerbIndices.push(k0, k0 + 1, k0 + 4);
        kerbIndices.push(k0 + 1, k0 + 5, k0 + 4);

        kerbIndices.push(k0 + 2, k0 + 3, k0 + 6);
        kerbIndices.push(k0 + 3, k0 + 7, k0 + 6);
      }
    }

    // Assemble Road Mesh
    const roadGeo = new THREE.BufferGeometry();
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadVertices, 3));
    roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(roadNormals, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
    roadGeo.setIndex(roadIndices);

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x222730,
      roughness: 0.85,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;

    // Assemble Barrier Mesh
    const barrierGeo = new THREE.BufferGeometry();
    barrierGeo.setAttribute('position', new THREE.Float32BufferAttribute(barrierVertices, 3));
    barrierGeo.setAttribute('normal', new THREE.Float32BufferAttribute(barrierNormals, 3));
    barrierGeo.setIndex(barrierIndices);

    const barrierMat = new THREE.MeshStandardMaterial({
      color: 0x48505e, // Metallic safety Armco barrier
      roughness: 0.35,
      metalness: 0.75,
      side: THREE.DoubleSide
    });
    const barrierMesh = new THREE.Mesh(barrierGeo, barrierMat);
    barrierMesh.castShadow = true;
    barrierMesh.receiveShadow = true;

    // Assemble Kerb Mesh
    const kerbGeo = new THREE.BufferGeometry();
    kerbGeo.setAttribute('position', new THREE.Float32BufferAttribute(kerbVertices, 3));
    kerbGeo.setAttribute('color', new THREE.Float32BufferAttribute(kerbColors, 3));
    kerbGeo.setIndex(kerbIndices);

    const kerbMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.6,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    const kerbMesh = new THREE.Mesh(kerbGeo, kerbMat);
    kerbMesh.receiveShadow = true;

    // 5. Start/Finish Line Checkered Ribbon (Lying completely flat on road)
    const c0 = sampledCenters[0];
    const n0 = sampledNormals[0];
    const t0 = sampledTangents[0];
    const halfFinishLength = 1.6;
    const finishHalfW = halfWidth * 0.98;

    const flVertices: number[] = [
      c0.x - n0.x * finishHalfW - t0.x * halfFinishLength, 0.03, c0.z - n0.z * finishHalfW - t0.z * halfFinishLength,
      c0.x + n0.x * finishHalfW - t0.x * halfFinishLength, 0.03, c0.z + n0.z * finishHalfW - t0.z * halfFinishLength,
      c0.x - n0.x * finishHalfW + t0.x * halfFinishLength, 0.03, c0.z - n0.z * finishHalfW + t0.z * halfFinishLength,
      c0.x + n0.x * finishHalfW + t0.x * halfFinishLength, 0.03, c0.z + n0.z * finishHalfW + t0.z * halfFinishLength
    ];

    const flNormals: number[] = [
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0
    ];

    const flUvs: number[] = [
      0, 0,
      8, 0,
      0, 2,
      8, 2
    ];

    const flIndices: number[] = [
      0, 1, 2,
      1, 3, 2
    ];

    const finishGeo = new THREE.BufferGeometry();
    finishGeo.setAttribute('position', new THREE.Float32BufferAttribute(flVertices, 3));
    finishGeo.setAttribute('normal', new THREE.Float32BufferAttribute(flNormals, 3));
    finishGeo.setAttribute('uv', new THREE.Float32BufferAttribute(flUvs, 2));
    finishGeo.setIndex(flIndices);

    // Procedural Checkered Texture Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 128, 32);
      ctx.fillStyle = '#111318';
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 8; col++) {
          if ((row + col) % 2 === 0) {
            ctx.fillRect(col * 16, row * 16, 16, 16);
          }
        }
      }
    }
    const checkerTexture = new THREE.CanvasTexture(canvas);
    checkerTexture.wrapS = THREE.RepeatWrapping;
    checkerTexture.wrapT = THREE.RepeatWrapping;

    const finishMat = new THREE.MeshStandardMaterial({
      map: checkerTexture,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const finishLineMesh = new THREE.Mesh(finishGeo, finishMat);
    finishLineMesh.receiveShadow = true;

    // 6. Generate Checkpoints along the Spline (12 Checkpoints)
    const numCheckpoints = 12;
    const checkpoints: Checkpoint[] = [];

    for (let k = 0; k < numCheckpoints; k++) {
      const u = k / numCheckpoints;
      const segIndex = Math.floor(u * segments);
      const pos = sampledCenters[segIndex];
      const tangent = sampledTangents[segIndex];
      const normal = sampledNormals[segIndex];

      const cp = new Checkpoint({
        index: k,
        position: pos,
        tangent: tangent,
        normal: normal,
        width: config.width
      });
      checkpoints.push(cp);
    }

    // 7. Spawn Position & Initial Heading
    // Place vehicle at start line facing forward along initial track tangent
    const spawnPosition = sampledCenters[0].clone().add(sampledTangents[0].clone().multiplyScalar(2.0));
    spawnPosition.y = 0;
    const startTangent = sampledTangents[0];
    const spawnHeading = Math.atan2(startTangent.x, startTangent.z);

    return {
      roadMesh,
      barrierMesh,
      kerbMesh,
      finishLineMesh,
      curve,
      checkpoints,
      spawnPosition,
      spawnHeading,
      sampledCenters,
      sampledNormals,
      sampledTangents
    };
  }
}

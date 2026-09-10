import * as THREE from 'three';
import { TrackDefinition } from './TrackTypes';
import { TrackSampler, TrackSample } from './TrackSampler';
import { TrackBoundary } from './TrackBoundary';

export interface GeneratedTrackMeshes {
  roadMesh: THREE.Mesh;
  kerbMesh: THREE.Mesh;
  barrierMesh: THREE.Mesh | null;
  finishLineMesh: THREE.Mesh;
}

export class TrackGenerator {
  public static generateMeshes(
    _definition: TrackDefinition,
    sampler: TrackSampler,
    boundary: TrackBoundary
  ): GeneratedTrackMeshes {
    const samples = sampler.samples;
    const count = samples.length;

    // 1. Road Mesh Ribbon (3D Elevation + Banking)
    const roadVertices: number[] = [];
    const roadNormals: number[] = [];
    const roadUvs: number[] = [];
    const roadIndices: number[] = [];

    // 2. Kerbs (Alternating red/white edge strips)
    const kerbVertices: number[] = [];
    const kerbColors: number[] = [];
    const kerbIndices: number[] = [];

    // 3. Barriers (Vertical Armco barrier walls)
    const barrierVertices: number[] = [];
    const barrierNormals: number[] = [];
    const barrierIndices: number[] = [];

    const kerbWidth = 0.9;
    const kerbHeight = 0.08;
    const barrierH = boundary.physicalBarrierHeight;
    const barrierW = boundary.physicalBarrierWidth;
    const hasBarriers = boundary.hasBarriers;

    for (let i = 0; i <= count; i++) {
      const idx = i % count;
      const s = samples[idx];

      const halfW = s.width * 0.5;
      const center = s.position;
      const right = s.bankedRight;
      const up = s.surfaceNormal;

      // Road Left & Right edges
      const lx = center.x - right.x * halfW;
      const ly = center.y - right.y * halfW + 0.03; // Slight offset above terrain
      const lz = center.z - right.z * halfW;

      const rx = center.x + right.x * halfW;
      const ry = center.y + right.y * halfW + 0.03;
      const rz = center.z + right.z * halfW;

      // Road Vertices
      roadVertices.push(lx, ly, lz);
      roadVertices.push(rx, ry, rz);

      roadNormals.push(up.x, up.y, up.z);
      roadNormals.push(up.x, up.y, up.z);

      const uvV = (s.distance / sampler.totalLength) * 45.0;
      roadUvs.push(0, uvV);
      roadUvs.push(1, uvV);

      // Kerb Left: from road edge to outer edge
      const klx = lx - right.x * kerbWidth;
      const kly = ly - right.y * kerbWidth + kerbHeight;
      const klz = lz - right.z * kerbWidth;

      // Kerb Right: from road edge to outer edge
      const krx = rx + right.x * kerbWidth;
      const kry = ry + right.y * kerbWidth + kerbHeight;
      const krz = rz + right.z * kerbWidth;

      // Left kerb quad
      kerbVertices.push(klx, kly, klz);
      kerbVertices.push(lx, ly, lz);

      // Right kerb quad
      kerbVertices.push(rx, ry, rz);
      kerbVertices.push(krx, kry, krz);

      // Alternating Red & White color pattern every ~3 samples
      const isRed = Math.floor(i / 3) % 2 === 0;
      const rVal = isRed ? 0.95 : 0.95;
      const gVal = isRed ? 0.15 : 0.95;
      const bVal = isRed ? 0.15 : 0.95;

      for (let k = 0; k < 4; k++) {
        kerbColors.push(rVal, gVal, bVal);
      }

      // Barriers
      if (hasBarriers) {
        // Left barrier: outer edge of kerb
        barrierVertices.push(klx, kly, klz);
        barrierVertices.push(klx, kly + barrierH, klz);
        barrierVertices.push(klx - right.x * barrierW, kly + barrierH, klz - right.z * barrierW);
        barrierVertices.push(klx - right.x * barrierW, kly, klz - right.z * barrierW);

        barrierNormals.push(right.x, 0, right.z);
        barrierNormals.push(right.x, 0, right.z);
        barrierNormals.push(-right.x, 0, -right.z);
        barrierNormals.push(-right.x, 0, -right.z);

        // Right barrier
        barrierVertices.push(krx, kry, krz);
        barrierVertices.push(krx, kry + barrierH, krz);
        barrierVertices.push(krx + right.x * barrierW, kry + barrierH, krz + right.z * barrierW);
        barrierVertices.push(krx + right.x * barrierW, kry, krz + right.z * barrierW);

        barrierNormals.push(-right.x, 0, -right.z);
        barrierNormals.push(-right.x, 0, -right.z);
        barrierNormals.push(right.x, 0, right.z);
        barrierNormals.push(right.x, 0, right.z);
      }
    }

    // Indices for Road Ribbon
    for (let i = 0; i < count; i++) {
      const v0 = i * 2;
      const v1 = v0 + 1;
      const v2 = v0 + 2;
      const v3 = v0 + 3;

      roadIndices.push(v0, v1, v2);
      roadIndices.push(v1, v3, v2);
    }

    // Indices for Kerbs
    for (let i = 0; i < count; i++) {
      const base = i * 4;
      // Left kerb quad
      kerbIndices.push(base, base + 1, base + 4);
      kerbIndices.push(base + 1, base + 5, base + 4);

      // Right kerb quad
      kerbIndices.push(base + 2, base + 3, base + 6);
      kerbIndices.push(base + 3, base + 7, base + 6);
    }

    // Indices for Barriers
    if (hasBarriers) {
      for (let i = 0; i < count; i++) {
        const base = i * 8;
        const next = (i + 1) * 8;

        // Left barrier inward face
        barrierIndices.push(base, base + 1, next);
        barrierIndices.push(base + 1, next + 1, next);

        // Left barrier top face
        barrierIndices.push(base + 1, base + 2, next + 1);
        barrierIndices.push(base + 2, next + 2, next + 1);

        // Right barrier inward face
        barrierIndices.push(base + 4, next + 4, base + 5);
        barrierIndices.push(base + 5, next + 4, next + 5);

        // Right barrier top face
        barrierIndices.push(base + 5, next + 5, base + 6);
        barrierIndices.push(base + 6, next + 5, next + 6);
      }
    }

    // 4. Road Material & Mesh
    const roadGeo = new THREE.BufferGeometry();
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadVertices, 3));
    roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(roadNormals, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
    roadGeo.setIndex(roadIndices);

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e24,
      roughness: 0.82,
      metalness: 0.12,
      side: THREE.DoubleSide
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;

    // 5. Kerb Material & Mesh
    const kerbGeo = new THREE.BufferGeometry();
    kerbGeo.setAttribute('position', new THREE.Float32BufferAttribute(kerbVertices, 3));
    kerbGeo.setAttribute('color', new THREE.Float32BufferAttribute(kerbColors, 3));
    kerbGeo.setIndex(kerbIndices);
    kerbGeo.computeVertexNormals();

    const kerbMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.75,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const kerbMesh = new THREE.Mesh(kerbGeo, kerbMat);
    kerbMesh.receiveShadow = true;

    // 6. Barrier Material & Mesh
    let barrierMesh: THREE.Mesh | null = null;
    if (hasBarriers && barrierVertices.length > 0) {
      const barrierGeo = new THREE.BufferGeometry();
      barrierGeo.setAttribute('position', new THREE.Float32BufferAttribute(barrierVertices, 3));
      barrierGeo.setAttribute('normal', new THREE.Float32BufferAttribute(barrierNormals, 3));
      barrierGeo.setIndex(barrierIndices);

      const barrierMat = new THREE.MeshStandardMaterial({
        color: 0x8b949e, // Metallic Armco guardrail
        roughness: 0.45,
        metalness: 0.75
      });
      barrierMesh = new THREE.Mesh(barrierGeo, barrierMat);
      barrierMesh.castShadow = true;
      barrierMesh.receiveShadow = true;
    }

    // 7. Checkered Finish Line Mesh
    const finishLineMesh = this.generateFinishLine(samples[0]);

    return {
      roadMesh,
      kerbMesh,
      barrierMesh,
      finishLineMesh
    };
  }

  private static generateFinishLine(startSample: TrackSample): THREE.Mesh {
    const halfW = startSample.width * 0.5;
    const depth = 2.4; // 2.4m longitudinal depth across track
    const center = startSample.position;
    const right = startSample.bankedRight;
    const tangent = startSample.tangent;
    const up = startSample.surfaceNormal;

    const vertices: number[] = [
      // 4 corners of finish rectangle
      center.x - right.x * halfW - tangent.x * depth * 0.5,
      center.y - right.y * halfW - tangent.y * depth * 0.5 + 0.05,
      center.z - right.z * halfW - tangent.z * depth * 0.5,

      center.x + right.x * halfW - tangent.x * depth * 0.5,
      center.y + right.y * halfW - tangent.y * depth * 0.5 + 0.05,
      center.z + right.z * halfW - tangent.z * depth * 0.5,

      center.x - right.x * halfW + tangent.x * depth * 0.5,
      center.y - right.y * halfW + tangent.y * depth * 0.5 + 0.05,
      center.z - right.z * halfW + tangent.z * depth * 0.5,

      center.x + right.x * halfW + tangent.x * depth * 0.5,
      center.y + right.y * halfW + tangent.y * depth * 0.5 + 0.05,
      center.z + right.z * halfW + tangent.z * depth * 0.5
    ];

    const normals: number[] = [
      up.x, up.y, up.z,
      up.x, up.y, up.z,
      up.x, up.y, up.z,
      up.x, up.y, up.z
    ];

    const uvs: number[] = [
      0, 0,
      10, 0,
      0, 2,
      10, 2
    ];

    const indices: number[] = [
      0, 1, 2,
      1, 3, 2
    ];

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);

    // Procedural Checkered Canvas Texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 128, 32);
      ctx.fillStyle = '#111318';
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 8; c++) {
          if ((r + c) % 2 === 0) {
            ctx.fillRect(c * 16, r * 16, 16, 16);
          }
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;

    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    return mesh;
  }
}

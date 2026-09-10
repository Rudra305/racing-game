import * as THREE from 'three';
import { TerrainDefinition } from '../tracks/TrackTypes';
import { TrackSampler } from '../tracks/TrackSampler';
import { SurfaceType, SURFACE_PROPERTIES } from './TerrainSurface';

/**
 * Deterministic Pseudo-Random Seeded Noise Generator
 * Implementation of 2D Gradient Noise without external dependencies
 */
class SeededNoise2D {
  private perm: Uint8Array = new Uint8Array(512);

  constructor(seed: number) {
    // Linear congruential generator to create deterministic permutation table
    let s = (seed ^ 0x6a09e667) >>> 0;
    const rnd = () => {
      s = Math.imul(s ^ (s >>> 15), 1 | s);
      s = (s + Math.imul(s ^ (s >>> 7), 61 | s)) ^ s;
      return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
    };

    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, z: number): number {
    const h = hash & 7;
    const u = h < 4 ? x : z;
    const v = h < 4 ? z : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  public noise(x: number, z: number): number {
    const X = Math.floor(x) & 255;
    const Z = Math.floor(z) & 255;

    const xf = x - Math.floor(x);
    const zf = z - Math.floor(z);

    const u = this.fade(xf);
    const v = this.fade(zf);

    const a = this.perm[X] + Z;
    const b = this.perm[X + 1] + Z;

    return this.lerp(
      v,
      this.lerp(u, this.grad(this.perm[a], xf, zf), this.grad(this.perm[b], xf - 1, zf)),
      this.lerp(u, this.grad(this.perm[a + 1], xf, zf - 1), this.grad(this.perm[b + 1], xf - 1, zf - 1))
    );
  }

  public fbm(x: number, z: number, octaves: number = 3): number {
    let value = 0;
    let amplitude = 0.55;
    let frequency = 1.0;
    let totalAmp = 0;

    for (let o = 0; o < octaves; o++) {
      value += this.noise(x * frequency, z * frequency) * amplitude;
      totalAmp += amplitude;
      amplitude *= 0.48;
      frequency *= 2.05;
    }

    return value / totalAmp;
  }
}

export interface GeneratedTerrainData {
  geometry: THREE.BufferGeometry;
  mesh: THREE.Mesh;
  getHeightAt: (x: number, z: number) => number;
  getSurfaceAt: (x: number, z: number) => SurfaceType;
}

export class TerrainGenerator {
  public static generate(def: TerrainDefinition, sampler: TrackSampler): GeneratedTerrainData {
    const noiseGen = new SeededNoise2D(def.seed);
    const res = def.resolution;
    const size = def.size;
    const halfSize = size * 0.5;
    const step = size / res;

    // Precompute height query function for runtime physics and terrain grid
    const getRawHeight = (x: number, z: number): number => {
      // Scale coordinates for smooth mountain rolling hills
      const nx = (x + halfSize) * 0.0035;
      const nz = (z + halfSize) * 0.0035;
      const raw = noiseGen.fbm(nx, nz, 3);
      // Normalized between [0, 1]
      const norm = Math.max(0, Math.min(1, raw * 0.5 + 0.5));
      return def.baseHeight + norm * def.heightScale;
    };

    /**
     * Blends natural procedural terrain with the road corridor so road never floats or clips.
     */
    const evaluateCorridorHeight = (x: number, z: number): { height: number; distToEdge: number; surface: SurfaceType } => {
      // Find closest track sample
      const sample = sampler.findClosestSampleGlobal(new THREE.Vector3(x, 0, z));

      const dx = x - sample.position.x;
      const dz = z - sample.position.z;
      const distToCenter = Math.sqrt(dx * dx + dz * dz);
      const halfWidth = sample.width * 0.5;
      const distToEdge = distToCenter - halfWidth;

      const roadY = sample.position.y;
      const naturalY = getRawHeight(x, z);

      let finalY: number;
      let surf: SurfaceType;

      if (distToEdge <= 0) {
        // Underneath the road surface
        finalY = roadY - 0.08;
        surf = SurfaceType.ASPHALT;
      } else if (distToEdge <= 1.2) {
        // Road curb zone
        finalY = THREE.MathUtils.lerp(roadY - 0.05, naturalY, (distToEdge / def.corridorWidth) * 0.2);
        surf = SurfaceType.KERB;
      } else if (distToEdge <= 6.0) {
        // Shoulder runoff zone
        const u = distToEdge / def.corridorWidth;
        const w = u * u * (3 - 2 * u);
        finalY = THREE.MathUtils.lerp(roadY - 0.05, naturalY, w);
        surf = SurfaceType.DIRT;
      } else if (distToEdge <= def.corridorWidth) {
        // Outer corridor blending into mountains
        const u = distToEdge / def.corridorWidth;
        const w = u * u * (3 - 2 * u);
        finalY = THREE.MathUtils.lerp(roadY - 0.05, naturalY, w);
        surf = SurfaceType.GRASS;
      } else {
        // Natural landscape
        finalY = naturalY;
        surf = SurfaceType.GRASS;
      }

      return { height: finalY, distToEdge, surface: surf };
    };

    // 2. Build Terrain BufferGeometry
    const vertCount = (res + 1) * (res + 1);
    const positions = new Float32Array(vertCount * 3);
    const colors = new Float32Array(vertCount * 3);
    const indices: number[] = [];

    // Pre-allocated color scratch
    const colAsphalt = new THREE.Color(SURFACE_PROPERTIES[SurfaceType.ASPHALT].colorHex);
    const colDirt = new THREE.Color(SURFACE_PROPERTIES[SurfaceType.DIRT].colorHex);
    const colGrass = new THREE.Color(SURFACE_PROPERTIES[SurfaceType.GRASS].colorHex);
    const colRock = new THREE.Color(0x4a4f56); // Mountain peak rock tint

    let pIdx = 0;
    let cIdx = 0;

    for (let r = 0; r <= res; r++) {
      const z = -halfSize + r * step;
      for (let c = 0; c <= res; c++) {
        const x = -halfSize + c * step;

        const info = evaluateCorridorHeight(x, z);

        positions[pIdx] = x;
        positions[pIdx + 1] = info.height;
        positions[pIdx + 2] = z;
        pIdx += 3;

        // Vertex Color Blending
        let vertColor = colGrass;
        if (info.surface === SurfaceType.ASPHALT) {
          vertColor = colAsphalt;
        } else if (info.surface === SurfaceType.DIRT || info.surface === SurfaceType.KERB) {
          vertColor = colDirt;
        } else {
          // On high elevation peaks, tint toward rugged rock
          const heightRatio = Math.max(0, Math.min(1, (info.height - def.baseHeight) / def.heightScale));
          if (heightRatio > 0.72) {
            vertColor = colRock;
          } else {
            vertColor = colGrass;
          }
        }

        colors[cIdx] = vertColor.r;
        colors[cIdx + 1] = vertColor.g;
        colors[cIdx + 2] = vertColor.b;
        cIdx += 3;
      }
    }

    // Grid triangles
    for (let r = 0; r < res; r++) {
      for (let c = 0; c < res; c++) {
        const a = r * (res + 1) + c;
        const b = a + 1;
        const d = (r + 1) * (res + 1) + c;
        const e = d + 1;

        // Two triangles per cell
        indices.push(a, d, b);
        indices.push(b, d, e);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.08,
      flatShading: true // Gives a clean, low-poly aesthetic that performs extremely well
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;

    return {
      geometry,
      mesh,
      getHeightAt: (x: number, z: number) => evaluateCorridorHeight(x, z).height,
      getSurfaceAt: (x: number, z: number) => evaluateCorridorHeight(x, z).surface
    };
  }
}

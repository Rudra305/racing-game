import * as THREE from 'three';
import { BiomeType } from './EnvironmentTypes';

export class DistantScenery {
  public readonly group: THREE.Group = new THREE.Group();
  public readonly mesh: THREE.Mesh;
  private oceanMesh: THREE.Mesh | null = null;
  private material: THREE.MeshStandardMaterial;

  constructor(radius: number = 850, peakCount: number = 24, biomeType: BiomeType = BiomeType.ALPINE_FOREST) {
    const geometry = this.buildHorizonGeometry(radius, peakCount, biomeType);

    let matColor = 0x3d4a58;
    if (biomeType === BiomeType.DESERT_CANYON) {
      matColor = 0x944a2b; // Warm terracotta dust haze
    } else if (biomeType === BiomeType.COASTAL) {
      matColor = 0x3a5666; // Oceanic haze
    }

    this.material = new THREE.MeshStandardMaterial({
      color: matColor,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.y = -10;
    this.group.add(this.mesh);

    // Ocean plane for coastal biomes
    if (biomeType === BiomeType.COASTAL) {
      const oceanGeo = new THREE.RingGeometry(180, radius * 1.5, 48);
      const oceanMat = new THREE.MeshStandardMaterial({
        color: 0x16384c,
        roughness: 0.25,
        metalness: 0.35
      });
      this.oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
      this.oceanMesh.rotation.x = -Math.PI / 2;
      this.oceanMesh.position.y = -6.0;
      this.group.add(this.oceanMesh);
    }
  }

  private buildHorizonGeometry(radius: number, peakCount: number, biomeType: BiomeType): THREE.BufferGeometry {
    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // Pre-allocated colors tailored to biome
    let colPeak: THREE.Color;
    let colMid: THREE.Color;
    let colBase: THREE.Color;

    if (biomeType === BiomeType.DESERT_CANYON) {
      colPeak = new THREE.Color(0xd9955b); // Sunbaked mesa top
      colMid = new THREE.Color(0x943d22);  // Red sandstone canyon rim wall
      colBase = new THREE.Color(0x542314); // Canyon wash shadow
    } else if (biomeType === BiomeType.COASTAL) {
      colPeak = new THREE.Color(0x6e7884); // Weathered headland crest
      colMid = new THREE.Color(0x3e5246);  // Maritime scrub
      colBase = new THREE.Color(0x1a2e38); // Sea-level cliff base
    } else {
      // Alpine
      colPeak = new THREE.Color(0xdde5ee); // Snow-capped ridge
      colMid = new THREE.Color(0x424e5b);  // Granite face
      colBase = new THREE.Color(0x232e3a); // Valley shadow
    }

    const ringStep = (Math.PI * 2) / peakCount;

    for (let i = 0; i < peakCount; i++) {
      const angle0 = i * ringStep;
      const angle1 = (i + 1) * ringStep;

      let h0: number;
      let hMid: number;
      let h1: number;

      if (biomeType === BiomeType.DESERT_CANYON) {
        // Flat-topped mesas and tablelands
        const plateauBase = 75 + Math.sin(i * 2.8) * 30;
        h0 = plateauBase;
        hMid = plateauBase + 8; // Flat mesa crest
        h1 = plateauBase;
      } else if (biomeType === BiomeType.COASTAL) {
        // Broad rolling coastal headlands
        h0 = 55 + Math.sin(i * 2.5) * 28;
        hMid = 85 + Math.sin(i * 3.2 + 0.5) * 35;
        h1 = 55 + Math.sin((i + 1) * 2.5) * 28;
      } else {
        // Alpine sharp peaks
        h0 = 90 + Math.sin(i * 3.7) * 45 + Math.cos(i * 7.1) * 35;
        hMid = 140 + Math.sin(i * 4.9 + 1.2) * 65 + Math.cos(i * 2.3) * 40;
        h1 = 90 + Math.sin((i + 1) * 3.7) * 45 + Math.cos((i + 1) * 7.1) * 35;
      }

      const r0 = radius + Math.sin(i * 2.5) * 60;
      const rMid = radius + 80 + Math.cos(i * 3.1) * 70;
      const r1 = radius + Math.sin((i + 1) * 2.5) * 60;

      const x0 = Math.sin(angle0) * r0;
      const z0 = Math.cos(angle0) * r0;
      const xMid = Math.sin((angle0 + angle1) * 0.5) * rMid;
      const zMid = Math.cos((angle0 + angle1) * 0.5) * rMid;
      const x1 = Math.sin(angle1) * r1;
      const z1 = Math.cos(angle1) * r1;

      const baseIdx = vertices.length / 3;

      // Vertex 0: Base left (y = 0)
      vertices.push(x0, -15, z0);
      colors.push(colBase.r, colBase.g, colBase.b);

      // Vertex 1: Peak / Mesa summit
      vertices.push(xMid, hMid, zMid);
      colors.push(colPeak.r, colPeak.g, colPeak.b);

      // Vertex 2: Base right (y = 0)
      vertices.push(x1, -15, z1);
      colors.push(colBase.r, colBase.g, colBase.b);

      // Vertex 3: Mid ridge point
      vertices.push(x0 * 0.95, h0 * 0.6, z0 * 0.95);
      colors.push(colMid.r, colMid.g, colMid.b);

      // Vertex 4: Mid ridge right
      vertices.push(x1 * 0.95, h1 * 0.6, z1 * 0.95);
      colors.push(colMid.r, colMid.g, colMid.b);

      // Faceted mountain/mesa triangles
      indices.push(baseIdx, baseIdx + 3, baseIdx + 1);
      indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
      indices.push(baseIdx + 1, baseIdx + 4, baseIdx + 2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }

  public updatePosition(targetPosition: THREE.Vector3): void {
    this.group.position.x = targetPosition.x;
    this.group.position.z = targetPosition.z;
    this.mesh.position.x = 0;
    this.mesh.position.z = 0;
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
    if (this.oceanMesh) {
      this.oceanMesh.geometry.dispose();
      (this.oceanMesh.material as THREE.Material).dispose();
    }
  }
}

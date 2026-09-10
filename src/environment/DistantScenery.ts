import * as THREE from 'three';

export class DistantScenery {
  public readonly mesh: THREE.Mesh;
  private material: THREE.MeshStandardMaterial;

  constructor(radius: number = 850, peakCount: number = 20) {
    const geometry = this.buildMountainHorizonGeometry(radius, peakCount);

    this.material = new THREE.MeshStandardMaterial({
      color: 0x3d4a58, // Mountain blue-grey atmospheric haze
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.y = -10;
  }

  private buildMountainHorizonGeometry(radius: number, peakCount: number): THREE.BufferGeometry {
    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // Pre-allocated colors for mountain depth
    const colPeak = new THREE.Color(0xdde5ee); // Snow-capped ridge
    const colMid = new THREE.Color(0x424e5b);  // Granite face
    const colBase = new THREE.Color(0x232e3a); // Valley shadow

    const ringStep = (Math.PI * 2) / peakCount;

    // Generate inner and outer mountain wall rings
    for (let i = 0; i < peakCount; i++) {
      const angle0 = i * ringStep;
      const angle1 = (i + 1) * ringStep;

      // Pseudo-random deterministic peak heights and distances
      const h0 = 90 + Math.sin(i * 3.7) * 45 + Math.cos(i * 7.1) * 35;
      const hMid = 140 + Math.sin(i * 4.9 + 1.2) * 65 + Math.cos(i * 2.3) * 40;
      const h1 = 90 + Math.sin((i + 1) * 3.7) * 45 + Math.cos((i + 1) * 7.1) * 35;

      const r0 = radius + Math.sin(i * 2.5) * 60;
      const rMid = radius + 80 + Math.cos(i * 3.1) * 70;
      const r1 = radius + Math.sin((i + 1) * 2.5) * 60;

      // Base left
      const x0 = Math.sin(angle0) * r0;
      const z0 = Math.cos(angle0) * r0;
      // Summit center
      const xMid = Math.sin((angle0 + angle1) * 0.5) * rMid;
      const zMid = Math.cos((angle0 + angle1) * 0.5) * rMid;
      // Base right
      const x1 = Math.sin(angle1) * r1;
      const z1 = Math.cos(angle1) * r1;

      const baseIdx = vertices.length / 3;

      // Vertex 0: Base left (y = 0)
      vertices.push(x0, -15, z0);
      colors.push(colBase.r, colBase.g, colBase.b);

      // Vertex 1: Peak summit
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

      // Faceted mountain triangles
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
    this.mesh.position.x = targetPosition.x;
    this.mesh.position.z = targetPosition.z;
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

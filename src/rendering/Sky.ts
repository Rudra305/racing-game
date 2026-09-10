import * as THREE from 'three';

export class Sky {
  public readonly mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;

  constructor(radius: number = 1400) {
    // Inverted sky dome
    const geometry = new THREE.SphereGeometry(radius, 32, 24);
    // Invert geometry so faces point inward
    geometry.scale(-1, 1, 1);

    // Custom atmospheric scattering gradient shader
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0a1d37) },    // Deep alpine zenith navy
        midColor: { value: new THREE.Color(0x1d4a7a) },    // High mountain azure
        bottomColor: { value: new THREE.Color(0x86b0d9) }, // Horizon haze cyan-white
        offset: { value: 35 },
        exponent: { value: 0.65 },
        sunDirection: { value: new THREE.Vector3(0.5, 0.7, 0.4).normalize() },
        sunColor: { value: new THREE.Color(0xfff7e6) }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        uniform vec3 sunDirection;
        uniform vec3 sunColor;
        varying vec3 vWorldPosition;

        void main() {
          float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
          float factor = max(0.0, h);
          
          vec3 skyGrad = mix(bottomColor, midColor, smoothstep(0.0, 0.4, factor));
          skyGrad = mix(skyGrad, topColor, smoothstep(0.4, 1.0, factor));

          // Subtle sun flare glow
          vec3 dir = normalize(vWorldPosition);
          float sunDot = max(0.0, dot(dir, sunDirection));
          float sunGlow = pow(sunDot, 120.0) * 0.75 + pow(sunDot, 8.0) * 0.18;
          vec3 finalColor = skyGrad + sunColor * sunGlow;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.renderOrder = -100;
  }

  public setSunDirection(sunDir: THREE.Vector3): void {
    this.material.uniforms.sunDirection.value.copy(sunDir).normalize();
  }

  public updatePosition(targetPosition: THREE.Vector3): void {
    this.mesh.position.set(targetPosition.x, 0, targetPosition.z);
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

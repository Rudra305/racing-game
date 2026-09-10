import * as THREE from 'three';

export interface RendererOptions {
  canvas: HTMLCanvasElement;
  maxPixelRatio?: number;
}

export class Renderer {
  public readonly instance: THREE.WebGLRenderer;
  private readonly maxPixelRatio: number;

  constructor(options: RendererOptions) {
    this.maxPixelRatio = options.maxPixelRatio ?? 1.5;

    // WebGL2 renderer initialization
    this.instance = new THREE.WebGLRenderer({
      canvas: options.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });

    this.configure();
    this.resize();
  }

  private configure(): void {
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, this.maxPixelRatio));
    this.instance.setSize(window.innerWidth, window.innerHeight);

    // Color and shadow fidelity
    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1.05;

    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, this.maxPixelRatio));
    this.instance.setSize(width, height, false);
  }

  public render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.instance.render(scene, camera);
  }

  public destroy(): void {
    this.instance.dispose();
  }
}

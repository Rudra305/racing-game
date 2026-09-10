/**
 * Clean asset loading and disposal manager interface.
 * Stubs GLTF/GLB/Texture/Audio caching for Phase 2 expansion without architectural changes.
 */
export interface AssetProgressCallback {
  (url: string, loaded: number, total: number): void;
}

export class AssetManager {
  private cache: Map<string, unknown> = new Map();
  private isDisposed: boolean = false;

  public async loadModel(url: string, onProgress?: AssetProgressCallback): Promise<unknown> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    // Stubbed for Phase 2 GLTF/GLB loading
    if (onProgress) onProgress(url, 1, 1);
    return null;
  }

  public async loadTexture(url: string, onProgress?: AssetProgressCallback): Promise<unknown> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    if (onProgress) onProgress(url, 1, 1);
    return null;
  }

  public get<T>(url: string): T | undefined {
    return this.cache.get(url) as T | undefined;
  }

  public dispose(): void {
    this.cache.clear();
    this.isDisposed = true;
  }

  public get disposed(): boolean {
    return this.isDisposed;
  }
}

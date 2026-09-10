import * as THREE from 'three';

interface CacheEntry<T = unknown> {
  asset: T;
  refCount: number;
  trackOwned: boolean;
}

export class AssetCache {
  private entries: Map<string, CacheEntry> = new Map();

  public set<T>(key: string, asset: T, trackOwned: boolean = false): void {
    const existing = this.entries.get(key);
    if (existing) {
      existing.refCount++;
      return;
    }
    this.entries.set(key, {
      asset,
      refCount: 1,
      trackOwned
    });
  }

  public get<T>(key: string): T | undefined {
    const entry = this.entries.get(key);
    return entry ? (entry.asset as T) : undefined;
  }

  public has(key: string): boolean {
    return this.entries.has(key);
  }

  public retain(key: string): void {
    const entry = this.entries.get(key);
    if (entry) {
      entry.refCount++;
    }
  }

  public release(key: string): void {
    const entry = this.entries.get(key);
    if (!entry) return;

    entry.refCount--;
    if (entry.refCount <= 0) {
      this.disposeAsset(entry.asset);
      this.entries.delete(key);
    }
  }

  /**
   * Disposes assets tied specifically to a track session while preserving global persistent assets.
   */
  public clearTrackAssets(): void {
    for (const [key, entry] of this.entries.entries()) {
      if (entry.trackOwned) {
        this.disposeAsset(entry.asset);
        this.entries.delete(key);
      }
    }
  }

  public disposeAll(): void {
    for (const entry of this.entries.values()) {
      this.disposeAsset(entry.asset);
    }
    this.entries.clear();
  }

  private disposeAsset(asset: unknown): void {
    if (!asset) return;

    if (asset instanceof THREE.BufferGeometry) {
      asset.dispose();
    } else if (asset instanceof THREE.Material) {
      asset.dispose();
    } else if (asset instanceof THREE.Texture) {
      asset.dispose();
    } else if (asset instanceof THREE.Object3D) {
      asset.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          if (m.material) {
            if (Array.isArray(m.material)) {
              m.material.forEach((mat) => mat.dispose());
            } else {
              m.material.dispose();
            }
          }
        }
      });
    }
  }

  public get count(): number {
    return this.entries.size;
  }
}

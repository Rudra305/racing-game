import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AssetCache } from './AssetCache';
import { AssetManifest } from './AssetTypes';
import { ENVIRONMENT_ASSET_MANIFEST } from './AssetManifest';
import { AssetValidator } from './AssetValidator';

export interface AssetProgressCallback {
  (url: string, loaded: number, total: number): void;
}

export class AssetManager {
  private cache: AssetCache = new AssetCache();
  private manifest: AssetManifest = ENVIRONMENT_ASSET_MANIFEST;
  private gltfLoader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private isDisposed: boolean = false;

  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();
  }

  /**
   * Loads a GLB/GLTF model from URL with caching and error handling.
   */
  public async loadModel(url: string, onProgress?: AssetProgressCallback): Promise<THREE.Object3D | null> {
    if (this.isDisposed) return null;
    if (this.cache.has(url)) {
      return this.cache.get<THREE.Object3D>(url) || null;
    }

    return new Promise((resolve) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          const scene = gltf.scene;
          AssetValidator.validate(scene);
          this.cache.set(url, scene, true);
          if (onProgress) onProgress(url, 1, 1);
          resolve(scene);
        },
        (xhr) => {
          if (onProgress && xhr.total > 0) {
            onProgress(url, xhr.loaded, xhr.total);
          }
        },
        (err) => {
          console.warn(`[AssetManager] Failed to load GLTF at '${url}', fallback may be used:`, err);
          resolve(null);
        }
      );
    });
  }

  /**
   * Loads a texture from URL with caching.
   */
  public async loadTexture(url: string, onProgress?: AssetProgressCallback): Promise<THREE.Texture | null> {
    if (this.isDisposed) return null;
    if (this.cache.has(url)) {
      return this.cache.get<THREE.Texture>(url) || null;
    }

    return new Promise((resolve) => {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          this.cache.set(url, texture, true);
          if (onProgress) onProgress(url, 1, 1);
          resolve(texture);
        },
        (xhr) => {
          if (onProgress && xhr.total > 0) {
            onProgress(url, xhr.loaded, xhr.total);
          }
        },
        (err) => {
          console.warn(`[AssetManager] Failed to load texture at '${url}':`, err);
          resolve(null);
        }
      );
    });
  }

  /**
   * Retrieves an environment asset geometry/mesh by ID from manifest,
   * seamlessly using procedural fallback if file is not found (Requirement #89).
   */
  public async getEnvironmentGeometry(id: string): Promise<THREE.BufferGeometry | null> {
    if (this.cache.has(id)) {
      return this.cache.get<THREE.BufferGeometry>(id) || null;
    }

    const item = this.manifest.assets.find((a) => a.id === id);
    if (!item) {
      console.warn(`[AssetManager] Unknown environment asset id: '${id}'`);
      return null;
    }

    // Try loading external GLB if URL provided
    if (item.url) {
      const model = await this.loadModel(item.url);
      if (model) {
        let extractedGeo: THREE.BufferGeometry | null = null;
        model.traverse((child) => {
          if (!extractedGeo && (child as THREE.Mesh).isMesh) {
            extractedGeo = (child as THREE.Mesh).geometry;
          }
        });
        if (extractedGeo) {
          this.cache.set(id, extractedGeo, true);
          return extractedGeo;
        }
      }
    }

    // Zero-fail safe procedural fallback
    if (item.proceduralFallback) {
      const res = item.proceduralFallback();
      let geo: THREE.BufferGeometry;
      if (res instanceof THREE.BufferGeometry) {
        geo = res;
      } else if (res instanceof THREE.Mesh) {
        geo = res.geometry;
      } else {
        // Group: extract first mesh geometry
        let foundGeo: THREE.BufferGeometry | null = null;
        res.traverse((c) => {
          if (!foundGeo && (c as THREE.Mesh).isMesh) {
            foundGeo = (c as THREE.Mesh).geometry;
          }
        });
        geo = foundGeo || new THREE.BoxGeometry(1, 1, 1);
      }

      this.cache.set(id, geo, true);
      return geo;
    }

    return null;
  }

  /**
   * Preloads critical environment assets with progress tracking.
   */
  public async preloadEnvironment(onProgress?: (progress: number) => void): Promise<void> {
    const assetsToLoad = this.manifest.assets;
    let completed = 0;
    const total = assetsToLoad.length;

    for (const asset of assetsToLoad) {
      await this.getEnvironmentGeometry(asset.id);
      completed++;
      if (onProgress) {
        onProgress(completed / total);
      }
    }
  }

  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  /**
   * Unloads assets specific to the current track while retaining global assets.
   */
  public clearTrackAssets(): void {
    this.cache.clearTrackAssets();
  }

  public dispose(): void {
    this.cache.disposeAll();
    this.isDisposed = true;
  }

  public get disposed(): boolean {
    return this.isDisposed;
  }

  public get assetCount(): number {
    return this.cache.count;
  }
}

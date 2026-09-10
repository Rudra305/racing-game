import * as THREE from 'three';
import { AssetQualityTier, AssetValidationResult } from './AssetTypes';

export class AssetValidator {
  private static readonly MAX_TRIANGLES_BY_TIER: Record<AssetQualityTier, number> = {
    [AssetQualityTier.HERO]: 25000,
    [AssetQualityTier.HIGH]: 4000,
    [AssetQualityTier.MEDIUM]: 1200,
    [AssetQualityTier.LOW]: 250
  };

  /**
   * Validates loaded model geometry, triangle budget, materials and transforms.
   */
  public static validate(object: THREE.Object3D, tier: AssetQualityTier = AssetQualityTier.MEDIUM): AssetValidationResult {
    let triangles = 0;
    let geometries = 0;
    const materialsSet = new Set<THREE.Material>();
    const warnings: string[] = [];

    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          geometries++;
          const geo = mesh.geometry;
          if (geo.index) {
            triangles += geo.index.count / 3;
          } else if (geo.attributes.position) {
            triangles += geo.attributes.position.count / 3;
          }

          // Check for NaN or degenerate bounding box
          geo.computeBoundingBox();
          if (geo.boundingBox) {
            const size = new THREE.Vector3();
            geo.boundingBox.getSize(size);
            if (isNaN(size.x) || isNaN(size.y) || isNaN(size.z)) {
              warnings.push(`Mesh '${mesh.name || 'unnamed'}' has invalid NaN bounding box`);
            }
            if (size.lengthSq() > 100000) {
              warnings.push(`Mesh '${mesh.name || 'unnamed'}' has abnormally large bounding size: ${size.length().toFixed(1)}m`);
            }
          }
        }

        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => materialsSet.add(m));
          } else {
            materialsSet.add(mesh.material);
          }
        }
      }
    });

    const maxAllowed = this.MAX_TRIANGLES_BY_TIER[tier];
    if (triangles > maxAllowed) {
      warnings.push(`Object exceeds triangle budget for tier ${tier}: ${triangles} > ${maxAllowed}`);
    }

    if (materialsSet.size > 8) {
      warnings.push(`Object uses excessive unique materials (${materialsSet.size}), which impairs batching`);
    }

    return {
      valid: warnings.length === 0,
      triangles,
      geometries,
      materials: materialsSet.size,
      warnings
    };
  }
}

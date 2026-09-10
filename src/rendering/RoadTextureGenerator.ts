import * as THREE from 'three';

export class RoadTextureGenerator {
  private static asphaltTexture: THREE.CanvasTexture | null = null;
  private static finishLineTexture: THREE.CanvasTexture | null = null;

  /**
   * Generates a high-performance procedural asphalt road texture with
   * fine gravel aggregate, painted centerline dashes, and solid edge lines.
   */
  public static getAsphaltTexture(): THREE.CanvasTexture {
    if (this.asphaltTexture) return this.asphaltTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // 1. Base Asphalt Tone (Dark Charcoal)
    ctx.fillStyle = '#1e232a';
    ctx.fillRect(0, 0, 512, 512);

    // 2. Micro Gravel Aggregate Specks
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 28;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));         // R
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // G
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // B
    }
    ctx.putImageData(imgData, 0, 0);

    // 3. Solid White Edge Lines (Left & Right)
    ctx.fillStyle = '#e6edf3';
    // Left edge stripe (u ~ 0.05)
    ctx.fillRect(20, 0, 10, 512);
    // Right edge stripe (u ~ 0.95)
    ctx.fillRect(482, 0, 10, 512);

    // 4. Dashed White Centerline (Repeats every 64 pixels: 36px line, 28px gap)
    ctx.fillStyle = '#f0f6fc';
    const dashLength = 38;
    const dashGap = 26;
    const totalCycle = dashLength + dashGap;

    for (let y = 0; y < 512; y += totalCycle) {
      ctx.fillRect(251, y, 10, dashLength);
    }

    // 5. Subtle Tire Rubber Track Wear in Wheel Lanes
    ctx.fillStyle = 'rgba(10, 12, 16, 0.12)';
    // Left wheel track
    ctx.fillRect(115, 0, 50, 512);
    // Right wheel track
    ctx.fillRect(345, 0, 50, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;

    this.asphaltTexture = texture;
    return texture;
  }

  /**
   * Generates an iconic checkered racing finish line texture.
   */
  public static getFinishLineTexture(): THREE.CanvasTexture {
    if (this.finishLineTexture) return this.finishLineTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    const cols = 8;
    const rows = 2;
    const cw = 256 / cols;
    const ch = 64 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#161b22';
        ctx.fillRect(c * cw, r * ch, cw, ch);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;

    this.finishLineTexture = texture;
    return texture;
  }
}

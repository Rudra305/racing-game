// Autonomous downloader for Polyfork vehicle models
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VEHICLE_MODELS = [
  {
    id: 'muscle-car-60s-524d46',
    filename: 'muscle-car-60s.glb',
    name: '1960s Muscle Car',
    triangles: 4271
  },
  {
    id: 'hatchback-80s-e95554',
    filename: 'hatchback-80s.glb',
    name: '1980s Hot Hatchback',
    triangles: 3633
  },
  {
    id: 'suburban-pickup-truck-d15ea2',
    filename: 'suburban-pickup.glb',
    name: 'Suburban Pickup Truck',
    triangles: 2339
  },
  {
    id: 'scout-jeep-c02efe',
    filename: 'scout-jeep.glb',
    name: 'Scout 4x4 Jeep',
    triangles: 1772
  },
  {
    id: 'police-cruiser-a2d25e',
    filename: 'police-cruiser.glb',
    name: 'Highway Police Cruiser',
    triangles: 2130
  },
  {
    id: 'convertible-60s-b76f89',
    filename: 'convertible-60s.glb',
    name: '1960s GT Convertible',
    triangles: 4880
  }
];

const TARGET_DIR = path.resolve(__dirname, '../public/assets/models/polyfork/vehicles');

async function downloadVehicle(vehicle) {
  const targetPath = path.join(TARGET_DIR, vehicle.filename);
  const url = `https://polyfork.dev/cdn/${vehicle.id}-preview.glb`;

  console.log(`Fetching ${vehicle.name} (${vehicle.triangles} tris) from: ${url}`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Verify GLB magic header: 'glTF' (0x46546C67)
    if (buffer.length < 12) {
      throw new Error(`Invalid file size: only ${buffer.length} bytes`);
    }
    const magic = buffer.toString('ascii', 0, 4);
    if (magic !== 'glTF') {
      throw new Error(`Invalid GLB header magic: expected 'glTF', got '${magic}'`);
    }

    fs.writeFileSync(targetPath, buffer);
    console.log(`  ✓ Saved to ${vehicle.filename} (${Math.round(buffer.length / 1024)} KB)`);
    return { success: true, bytes: buffer.length };
  } catch (err) {
    console.error(`  ✗ Failed downloading ${vehicle.id}:`, err.message);
    return { success: false, error: err.message };
  }
}

async function main() {
  console.log('====================================================');
  console.log('Polyfork 3D Vehicle Downloader for Apex Racer');
  console.log('Target Directory:', TARGET_DIR);
  console.log('====================================================\n');

  fs.mkdirSync(TARGET_DIR, { recursive: true });

  let successCount = 0;
  for (const vehicle of VEHICLE_MODELS) {
    const res = await downloadVehicle(vehicle);
    if (res.success) successCount++;
  }

  console.log(`\nDownload complete: ${successCount} of ${VEHICLE_MODELS.length} vehicles acquired.`);
  if (successCount < VEHICLE_MODELS.length) {
    process.exit(1);
  }
}

main();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const ASSETS = [
  // 1. Alpine Vegetation
  { id: 'tall-pine-tree-ab4108', category: 'vegetation', name: 'Tall Pine Tree' },
  { id: 'maple-tree-65fa12', category: 'vegetation', name: 'Maple Tree' },
  { id: 'dead-tree-6795fa', category: 'vegetation', name: 'Dead Tree' },
  { id: 'round-bush-cd2ac0', category: 'vegetation', name: 'Round Bush' },
  { id: 'cattail-reed-6abbb3', category: 'vegetation', name: 'Cattail Reed' },
  { id: 'tree-stump-ec3f48', category: 'vegetation', name: 'Tree Stump' },
  { id: 'fallen-log-1685fb', category: 'vegetation', name: 'Fallen Log' },

  // 2. Alpine Rocks
  { id: 'large-boulder-a29b99', category: 'rock', name: 'Large Boulder' },
  { id: 'medium-rock-e08405', category: 'rock', name: 'Medium Rock' },
  { id: 'small-rock-db33a7', category: 'rock', name: 'Small Rock' },
  { id: 'rock-spire-13819c', category: 'rock', name: 'Rock Spire' },

  // 3. Barriers, Signs & Props
  { id: 'guardrail-d3bd42', category: 'barrier', name: 'Roadside Guardrail' },
  { id: 'traffic-cone-c421e4', category: 'prop', name: 'Traffic Safety Cone' },
  { id: 'tire-ccf0eb', category: 'barrier', name: 'Trackside Tire Barrier' },
  { id: 'oil-drum-386c30', category: 'prop', name: 'Oil Drum' },
  { id: 'street-lamp-b4fa26', category: 'prop', name: 'Circuit Street Lamp' },
  { id: 'checkered-flag-81784a', category: 'prop', name: 'Checkered Finish Flag Post' },
  { id: 'wooden-fence-section-5f04b7', category: 'barrier', name: 'Alpine Wooden Fence' },
  { id: 'wooden-fence-gate-a8735f', category: 'barrier', name: 'Alpine Wooden Fence Gate' },
  { id: 'diner-sign-ab5f0a', category: 'sign', name: 'Retro Circuit Billboard Sign' }
];

async function fetchAsset(asset) {
  const url = `https://polyfork.dev/cdn/${asset.id}.glb`;
  const destDir = path.join(projectRoot, 'public', 'assets', 'models', 'polyfork', asset.category);
  const destPath = path.join(destDir, `${asset.id}.glb`);

  fs.mkdirSync(destDir, { recursive: true });

  if (fs.existsSync(destPath)) {
    const stats = fs.statSync(destPath);
    if (stats.size > 1000) {
      console.log(`[CACHED] ${asset.name} (${asset.id}) already exists (${(stats.size / 1024).toFixed(1)} KB)`);
      return;
    }
  }

  console.log(`[FETCHING] ${asset.name} from ${url}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buffer));
    console.log(`[SUCCESS] Saved ${asset.name} -> ${destPath} (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`[ERROR] Failed to download ${asset.id}:`, err.message);
  }
}

async function run() {
  console.log('=== Polyfork 3D Asset Downloader ===');
  console.log(`Targeting ${ASSETS.length} curated assets for Alpine Forest & Circuit infrastructure...\n`);

  for (const asset of ASSETS) {
    await fetchAsset(asset);
  }

  console.log('\n=== Download Complete ===');
}

run();

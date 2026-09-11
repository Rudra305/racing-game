# Asset Licenses & Attribution Registry

This document records the provenance, licensing, author attribution, and usage rights for all 3D models, textures, procedural assets, and environmental elements utilized in the Apex Racer 3D Racing Engine (Phase 4).

---

## 1. Procedural & Hybrid Assets

### Alpine Vegetation Suite (Trees, Bushes, Grass)
- **Asset ID**: `alpine_fir_lod0`, `alpine_fir_lod1`, `alpine_fir_lod2`, `alpine_pine_lod0`, `alpine_pine_lod1`, `mountain_birch`, `alpine_bush`, `mountain_fern`, `alpine_grass`
- **Source**: Procedural parametric 3D geometry engine tailored for WebGL2 real-time rendering.
- **Author**: Apex Racer Project Team
- **License**: MIT License
- **URL**: [https://github.com/Rudra305/racing-game](https://github.com/Rudra305/racing-game)
- **Commercial Use**: Allowed
- **Modification Allowed**: Allowed
- **Attribution Required**: No
- **Notes**: High-performance instanced models with 3 discrete LOD levels (LOD0 branch foliage, LOD1 faceted silhouette, LOD2 cross-quad impostor), shared PBR materials, and vertex wind sway shader hooks.

### Roadside Infrastructure (Guardrails, Signs, Props)
- **Asset ID**: `guardrail_wbeam`, `sign_chevron_left`, `sign_chevron_right`, `sign_speed_60`, `sign_speed_80`, `sign_steep_grade`, `reflector_bollard`, `tire_barrier_stack`, `interlocking_barrier`
- **Source**: Custom procedural parametric road props generated to follow track spline curvature.
- **Author**: Apex Racer Project Team
- **License**: MIT License
- **URL**: [https://github.com/Rudra305/racing-game](https://github.com/Rudra305/racing-game)
- **Commercial Use**: Allowed
- **Modification Allowed**: Allowed
- **Attribution Required**: No
- **Notes**: Galvanized steel W-beam guardrails, retro-reflective highway signboards, and rubber safety barriers designed to standard European/Alpine mountain pass road specifications.

### Geological & Scenery Assets (Granite Rocks & Distant Mountains)
- **Asset ID**: `granite_boulder_a`, `granite_boulder_b`, `cliff_rock_cluster`, `distant_mountain_range`
- **Source**: Procedural faceted convex hull geometry with seeded heightmap noise.
- **Author**: Apex Racer Project Team
- **License**: MIT License
- **URL**: [https://github.com/Rudra305/racing-game](https://github.com/Rudra305/racing-game)
- **Commercial Use**: Allowed
- **Modification Allowed**: Allowed
- **Attribution Required**: No
- **Notes**: Multi-scale rock formations with natural lichen/moss vertex color blending and horizon-encircling low-poly mountain silhouettes.

### Visual Road & Terrain Textures
- **Asset ID**: `tex_asphalt_diffuse`, `tex_asphalt_roughness`, `tex_road_markings`, `tex_terrain_palette`
- **Source**: Procedural high-resolution canvas texture synthesizer.
- **Author**: Apex Racer Project Team
- **License**: MIT License
- **URL**: [https://github.com/Rudra305/racing-game](https://github.com/Rudra305/racing-game)
- **Commercial Use**: Allowed
- **Modification Allowed**: Allowed
- **Attribution Required**: No
- **Notes**: Seamless 1024x1024 procedural textures featuring fine gravel aggregate, painted centerline dashes, edge lines, and tire rubber skid marks.

---

## 2. External 3D Models & Pipeline Standards

Any external GLTF/GLB models imported into the `public/assets/` directory must adhere to the following license constraints:
1. **Permitted Licenses**: CC0 (Public Domain), MIT, BSD, Apache 2.0, or CC-BY (with explicit attribution in this file), or Polyfork Standard Asset License (Free Tier).
2. **Prohibited**: Copyrighted game rips, unlicensed models, non-commercial only (CC-NC) restrictions that prohibit commercial distribution.
3. **Budget**: Target $< 2,500$ triangles for LOD0 trees, $< 400$ triangles for LOD1, and $< 16$ triangles for LOD2.

---

## 3. Polyfork 3D Asset Ecosystem (Phase 6+)

Per project architecture directive, Polyfork (`https://polyfork.dev`) serves as the primary asset source. Below are the verified assets integrated into the project asset pipeline.

### Alpine Forest Vegetation
- **Asset Name**: Tall Pine Tree
  - **Asset ID**: `tall-pine-tree-ab4108`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Nature & Forest Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/tall-pine-tree-ab4108](https://polyfork.dev/asset/tall-pine-tree-ab4108)
  - **Game Usage**: Primary alpine forest evergreen tree for trackside environment & distant tree clusters (350 triangles).

- **Asset Name**: Maple Tree
  - **Asset ID**: `maple-tree-65fa12`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Nature & Forest Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/maple-tree-65fa12](https://polyfork.dev/asset/maple-tree-65fa12)
  - **Game Usage**: Deciduous canopy variation along trackside sectors (548 triangles).

- **Asset Name**: Dead Tree
  - **Asset ID**: `dead-tree-6795fa`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Nature & Forest Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/dead-tree-6795fa](https://polyfork.dev/asset/dead-tree-6795fa)
  - **Game Usage**: Alpine summit and ridge rocky terrain dressing (536 triangles).

- **Asset Name**: Round Bush
  - **Asset ID**: `round-bush-cd2ac0`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Nature & Forest Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/round-bush-cd2ac0](https://polyfork.dev/asset/round-bush-cd2ac0)
  - **Game Usage**: Dense undergrowth along track verges (512 triangles).

- **Asset Name**: Cattail Reed
  - **Asset ID**: `cattail-reed-6abbb3`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Nature & Forest Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/cattail-reed-6abbb3](https://polyfork.dev/asset/cattail-reed-6abbb3)
  - **Game Usage**: Low wetlands, roadside ditches, and drainage margins (388 triangles).

- **Asset Name**: Tree Stump
  - **Asset ID**: `tree-stump-ec3f48`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Nature & Forest Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/tree-stump-ec3f48](https://polyfork.dev/asset/tree-stump-ec3f48)
  - **Game Usage**: Forest ground scatter and clearing props (505 triangles).

- **Asset Name**: Fallen Log
  - **Asset ID**: `fallen-log-1685fb`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Nature & Forest Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/fallen-log-1685fb](https://polyfork.dev/asset/fallen-log-1685fb)
  - **Game Usage**: Track runoff zone obstacles and forest perimeter detail (484 triangles).

### Alpine Rocks & Geological Formations
- **Asset Name**: Large Boulder
  - **Asset ID**: `large-boulder-a29b99`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Nature & Forest Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/large-boulder-a29b99](https://polyfork.dev/asset/large-boulder-a29b99)
  - **Game Usage**: Primary roadside cliff formations & apex corner obstacles (295 triangles).

- **Asset Name**: Medium Rock
  - **Asset ID**: `medium-rock-e08405`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Nature & Forest Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/medium-rock-e08405](https://polyfork.dev/asset/medium-rock-e08405)
  - **Game Usage**: Slope dressing and runoff boundary markers (173 triangles).

- **Asset Name**: Small Rock
  - **Asset ID**: `small-rock-db33a7`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Nature & Forest Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/small-rock-db33a7](https://polyfork.dev/asset/small-rock-db33a7)
  - **Game Usage**: High-density scatter around rock clusters (202 triangles).

- **Asset Name**: Rock Spire
  - **Asset ID**: `rock-spire-13819c`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Nature & Forest Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/rock-spire-13819c](https://polyfork.dev/asset/rock-spire-13819c)
  - **Game Usage**: Mountain pass ridge landmark and vertical scenery (378 triangles).

### Track Infrastructure, Barriers & Circuit Props
- **Asset Name**: Roadside Guardrail
  - **Asset ID**: `guardrail-d3bd42`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Retro Cars Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/guardrail-d3bd42](https://polyfork.dev/asset/guardrail-d3bd42)
  - **Game Usage**: 4-meter modular highway & circuit barrier segments (146 triangles).

- **Asset Name**: Traffic Safety Cone
  - **Asset ID**: `traffic-cone-c421e4`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Retro Cars Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/traffic-cone-c421e4](https://polyfork.dev/asset/traffic-cone-c421e4)
  - **Game Usage**: Chicane apex markers, pit lane entry, and cornering guides (312 triangles).

- **Asset Name**: Trackside Tire Barrier
  - **Asset ID**: `tire-ccf0eb`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Retro Cars Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/tire-ccf0eb](https://polyfork.dev/asset/tire-ccf0eb)
  - **Game Usage**: High-impact buffer stacks at hairpin turns (520 triangles).

- **Asset Name**: Oil Drum
  - **Asset ID**: `oil-drum-386c30`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Retro Cars Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/oil-drum-386c30](https://polyfork.dev/asset/oil-drum-386c30)
  - **Game Usage**: Pit lane props and industrial scenery (532 triangles).

- **Asset Name**: Circuit Street Lamp
  - **Asset ID**: `street-lamp-b4fa26`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Retro Cars Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/street-lamp-b4fa26](https://polyfork.dev/asset/street-lamp-b4fa26)
  - **Game Usage**: Track lighting pylon at start/finish straight and grandstands (422 triangles).

- **Asset Name**: Checkered Finish Flag Post
  - **Asset ID**: `checkered-flag-81784a`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Retro Cars Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/checkered-flag-81784a](https://polyfork.dev/asset/checkered-flag-81784a)
  - **Game Usage**: Finish line marker and timing gantry accompaniment (416 triangles).

- **Asset Name**: Alpine Wooden Fence
  - **Asset ID**: `wooden-fence-section-5f04b7`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Nature & Forest Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/wooden-fence-section-5f04b7](https://polyfork.dev/asset/wooden-fence-section-5f04b7)
  - **Game Usage**: 2-meter modular mountain boundary fence (428 triangles).

- **Asset Name**: Alpine Wooden Fence Gate
  - **Asset ID**: `wooden-fence-gate-a8735f`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Nature & Forest Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/wooden-fence-gate-a8735f](https://polyfork.dev/asset/wooden-fence-gate-a8735f)
  - **Game Usage**: Mountain trail entrance and sector divider (408 triangles).

- **Asset Name**: Retro Circuit Billboard Sign
  - **Asset ID**: `diner-sign-ab5f0a`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Retro Cars Kit)
  - **License**: Polyfork Standard Asset License (Free Tier)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/diner-sign-ab5f0a](https://polyfork.dev/asset/diner-sign-ab5f0a)
  - **Game Usage**: Trackside landmark signboard (588 triangles).

---

## 4. Polyfork 3D Vehicle Models (Player Vehicle Suite)

Per project architecture directive, Polyfork serves as the primary asset source for player 3D vehicles. AI opponent vehicles retain lightweight procedural models to preserve 100% compute power for physics and pathfinding.

- **Asset Name**: 1960s Apex Muscle GT
  - **Asset ID**: `muscle-car-60s` / `muscle-car-60s-524d46`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Retro Cars Kit)
  - **License**: Polyfork Standard Asset License
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/muscle-car-60s-524d46](https://polyfork.dev/asset/muscle-car-60s-524d46)
  - **Game Usage**: Primary 3D vehicle model for Sports Class Apex S1 (4,271 triangles).

- **Asset Name**: 1980s Terra Rally Hatch
  - **Asset ID**: `hatchback-80s` / `hatchback-80s-e95554`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Retro Cars Kit)
  - **License**: Polyfork Standard Asset License
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/hatchback-80s-e95554](https://polyfork.dev/asset/hatchback-80s-e95554)
  - **Game Usage**: Primary 3D vehicle model for Rally Class Terra R1 (3,633 triangles).

- **Asset Name**: Titan Suburban 4x4
  - **Asset ID**: `suburban-pickup` / `suburban-pickup-truck-d15ea2`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Neighborhood Pathways Kit)
  - **License**: Polyfork Standard Asset License
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/suburban-pickup-truck-d15ea2](https://polyfork.dev/asset/suburban-pickup-truck-d15ea2)
  - **Game Usage**: Primary 3D vehicle model for SUV Class Titan Overland (2,339 triangles).

- **Asset Name**: Crossfire Scout Jeep
  - **Asset ID**: `scout-jeep` / `scout-jeep-c02efe`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (World War II Kit)
  - **License**: Polyfork Standard Asset License
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/scout-jeep-c02efe](https://polyfork.dev/asset/scout-jeep-c02efe)
  - **Game Usage**: Primary 3D vehicle model for Rally Class Crossfire RX (1,772 triangles).

- **Asset Name**: Vortex Interceptor Cruiser
  - **Asset ID**: `police-cruiser` / `police-cruiser-a2d25e`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (NYC City Kit)
  - **License**: Polyfork Standard Asset License
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
  - **Asset URL**: [https://polyfork.dev/asset/police-cruiser-a2d25e](https://polyfork.dev/asset/police-cruiser-a2d25e)
  - **Game Usage**: Primary 3D vehicle model for Sports Class Vortex GT (2,130 triangles).

- **Asset Name**: Venom GT Convertible
  - **Asset ID**: `convertible-60s` / `convertible-60s-b76f89`
  - **Source**: Polyfork
  - **Creator**: Lucas Martinic / Polyfork (Retro Cars Kit)
  - **License**: Polyfork Standard Asset License
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required
- **Asset Name**: Ferrari 458 Hyper GT
  - **Asset ID**: `ferrari-gt`
  - **Source**: Three.js Examples (`examples/models/gltf/ferrari.glb`)
  - **Creator**: Three.js Authors & Contributors
  - **License**: MIT License
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: MIT License Notice
  - **Asset URL**: [https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf](https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf)
  - **Game Usage**: Primary 3D vehicle model for Supercar Class Venom Hyperion & Astraea Stradale (~14,850 triangles).

- **Asset Name**: Apex GT Cup Racer
  - **Asset ID**: `race-car`
  - **Source**: Kenney Car Kit (via pmndrs/market-assets)
  - **Creator**: Kenney (Kenney.nl)
  - **License**: Creative Commons Zero (CC0 1.0 Universal - Public Domain)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required (Public Domain)
  - **Asset URL**: [https://kenney.nl/assets/car-kit](https://kenney.nl/assets/car-kit)
  - **Game Usage**: Primary 3D vehicle model for Sports Class Vortex GT (~1,240 triangles).

- **Asset Name**: Velocity Aero Formula
  - **Asset ID**: `race-future`
  - **Source**: Kenney Car Kit (via pmndrs/market-assets)
  - **Creator**: Kenney (Kenney.nl)
  - **License**: Creative Commons Zero (CC0 1.0 Universal - Public Domain)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required (Public Domain)
  - **Asset URL**: [https://kenney.nl/assets/car-kit](https://kenney.nl/assets/car-kit)
  - **Game Usage**: Primary 3D vehicle model for Formula Class Velocity F1 (~1,380 triangles).

- **Asset Name**: Apex Sport Sedan
  - **Asset ID**: `sports-sedan`
  - **Source**: Kenney Car Kit (via pmndrs/market-assets)
  - **Creator**: Kenney (Kenney.nl)
  - **License**: Creative Commons Zero (CC0 1.0 Universal - Public Domain)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required (Public Domain)
  - **Asset URL**: [https://kenney.nl/assets/car-kit](https://kenney.nl/assets/car-kit)
  - **Game Usage**: Available 3D model for Sports Class (~1,190 triangles).

- **Asset Name**: Kodiak Luxury Sport SUV
  - **Asset ID**: `suv-luxury`
  - **Source**: Kenney Car Kit (via pmndrs/market-assets)
  - **Creator**: Kenney (Kenney.nl)
  - **License**: Creative Commons Zero (CC0 1.0 Universal - Public Domain)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Not required (Public Domain)
  - **Asset URL**: [https://kenney.nl/assets/car-kit](https://kenney.nl/assets/car-kit)
  - **Game Usage**: Primary 3D vehicle model for SUV Class Kodiak Sport RS (~1,410 triangles).



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

### Desert & Canyon Vegetation & Flora (Phase 9)
- **Asset ID**: `saguaro_cactus_lod0`, `saguaro_cactus_lod1`, `saguaro_cactus_lod2`, `desert_scrub`
- **Source**: Procedural parametric 3D geometry engine with discrete 3-tier LOD.
- **Author**: Apex Racer Project Team
- **License**: MIT License
- **URL**: [https://github.com/Rudra305/racing-game](https://github.com/Rudra305/racing-game)
- **Commercial Use**: Allowed
- **Modification Allowed**: Allowed
- **Attribution Required**: No
- **Notes**: High-performance instanced columnar saguaro cacti with dual upward arms, dome tops, and arid scrub/tumbleweed clumps.

### Coastal Flora & Marine Environment (Phase 9)
- **Asset ID**: `coastal_palm_lod0`, `coastal_palm_lod1`, `coastal_palm_lod2`, `coastal_scrub`, `coastal_rock`
- **Source**: Procedural parametric 3D geometry engine with discrete 3-tier LOD.
- **Author**: Apex Racer Project Team
- **License**: MIT License
- **URL**: [https://github.com/Rudra305/racing-game](https://github.com/Rudra305/racing-game)
- **Commercial Use**: Allowed
- **Modification Allowed**: Allowed
- **Attribution Required**: No
- **Notes**: Leaning curved multi-segment palm trunks with radiating canopy fronds and coastal dune grass clumps.

### Biome Landmarks & Geological Features (Phase 9)
- **Asset ID**: `desert_sandstone_rock_a`, `desert_sandstone_rock_b`, `landmark_sandstone_arch`, `landmark_coastal_lighthouse`
- **Source**: Procedural parametric geometry engine.
- **Author**: Apex Racer Project Team
- **License**: MIT License
- **URL**: [https://github.com/Rudra305/racing-game](https://github.com/Rudra305/racing-game)
- **Commercial Use**: Allowed
- **Modification Allowed**: Allowed
- **Attribution Required**: No
- **Notes**: Layered sandstone boulders, monolithic canyon arch, and nautical white/red signal lighthouse tower.

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

## 4. High-Fidelity 3D Vehicle Models (Phase 8+)

All low-poly vehicle models have been decommissioned. The vehicle roster features authentic high-fidelity Class-A 3D models with real-time multi-material custom paint shaders.


- **Asset Name**: Ferrari 458 Hyper GT
  - **Asset ID**: `ferrari-gt`
  - **Source**: Three.js Examples (`examples/models/gltf/ferrari.glb`)
  - **Creator**: Three.js Authors & Contributors
  - **License**: MIT License
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: MIT License Notice
  - **Asset URL**: [https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf](https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf)
  - **Game Usage**: Primary 3D vehicle model for Supercar Class Ferrari 296 GTB Assetto Fiorano (~14,850 triangles).

- **Asset Name**: 1982 Porsche 911 Turbo 3.3 (930)
  - **Asset ID**: `porsche-930-turbo`
  - **Asset File**: `public/assets/models/vehicles/porsche-930-turbo.glb`
  - **Source**: Sketchfab ([https://skfb.ly/pN8EX](https://skfb.ly/pN8EX))
  - **Creator**: 007
  - **License**: Creative Commons Attribution (CC BY 4.0 - [http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/))
  - **Commercial Use**: Allowed (with attribution)
  - **Modification**: Allowed
  - **Attribution Statement**: "1982_porsche_930_911_turbo_3.3" (https://skfb.ly/pN8EX) by 007 is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
  - **Game Usage**: Authentic high-fidelity 3D vehicle model for Sports Class 1982 Porsche 911 Turbo 3.3 with real-time body paint and Fuchs alloy wheel customization (~3.8 MB).

- **Asset Name**: Toyota Supra RZ (A80 / Mk4)
  - **Asset ID**: `toyota-supra-rz`
  - **Asset File**: `public/assets/models/vehicles/toyota-supra-rz.glb`
  - **Source**: Sketchfab ([https://sketchfab.com/3d-models/toyota-supra-rz-custom-1332b5276b9742d48cdad5d26cca9b9b](https://sketchfab.com/3d-models/toyota-supra-rz-custom-1332b5276b9742d48cdad5d26cca9b9b))
  - **Creator**: Asphalt 8 Textures customs models
  - **License**: Creative Commons Attribution (CC BY 4.0 - [http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/))
  - **Commercial Use**: Allowed (with attribution)
  - **Modification**: Allowed
  - **Attribution Statement**: "Toyota supra rz Custom" by Asphalt 8 Textures customs models is licensed under CC BY 4.0.
  - **Game Usage**: Sports Class iconic Japanese sports car with twin-turbo 2JZ-GTE engine, carbon fiber aero components, and multi-piece wheels (~3.42 MB).

- **Asset Name**: 2023 Toyota GR Supra RZ Pandem
  - **Asset ID**: `toyota-gr-supra-pandem`
  - **Asset File**: `public/assets/models/vehicles/toyota-gr-supra-pandem.glb`
  - **Source**: Sketchfab ([https://sketchfab.com/3d-models/2023-toyota-gr-supra-rz-db42-pandem-kit-1fa7b2dc48f340878d9e5aaf1000971d](https://sketchfab.com/3d-models/2023-toyota-gr-supra-rz-db42-pandem-kit-1fa7b2dc48f340878d9e5aaf1000971d))
  - **Creator**: SIU Car Garage (https://sketchfab.com/Game_mode)
  - **License**: Creative Commons Attribution-NonCommercial (CC BY-NC 4.0 - [http://creativecommons.org/licenses/by-nc/4.0/](http://creativecommons.org/licenses/by-nc/4.0/))
  - **Commercial Use**: Non-Commercial Educational / Evaluation
  - **Modification**: Allowed
  - **Attribution Statement**: "2023 Toyota GR SUPRA RZ DB42 PANDEM Kit" by SIU Car Garage is licensed under CC BY-NC 4.0.
  - **Game Usage**: Sports Class widebody aerodynamic track weapon with Pandem aero kit (~2.39 MB).

- **Asset Name**: 2020 McLaren 765LT
  - **Asset ID**: `mclaren-765lt`
  - **Asset File**: `public/assets/models/vehicles/mclaren-765lt.glb`
  - **Source**: Sketchfab ([https://sketchfab.com/3d-models/2020-mclaren-765lt-2f973f267a5e4816b561abe8d8a60054](https://sketchfab.com/3d-models/2020-mclaren-765lt-2f973f267a5e4816b561abe8d8a60054))
  - **Creator**: OUTPISTON (https://sketchfab.com/outpiston)
  - **License**: Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA 4.0 - [http://creativecommons.org/licenses/by-nc-sa/4.0/](http://creativecommons.org/licenses/by-nc-sa/4.0/))
  - **Commercial Use**: Non-Commercial Educational / Evaluation
  - **Modification**: Allowed
  - **Attribution Statement**: "2020 McLaren 765LT" by OUTPISTON is licensed under CC BY-NC-SA 4.0.
  - **Game Usage**: Supercar Class lightweight carbon-monocoque longtail track hypercar (~2.78 MB).

- **Asset Name**: Mitsubishi Lancer Evolution VI
  - **Asset ID**: `mitsubishi-lancer-evo-6`
  - **Asset File**: `public/assets/models/vehicles/mitsubishi-lancer-evo-6.glb`
  - **Source**: Sketchfab ([https://sketchfab.com/3d-models/mitsubishi-lancer-evolution-6-wwwvecarzcom-c3d5dcd8ff724bc88c46760d92fc5188](https://sketchfab.com/3d-models/mitsubishi-lancer-evolution-6-wwwvecarzcom-c3d5dcd8ff724bc88c46760d92fc5188))
  - **Creator**: vecarz (https://sketchfab.com/heynic)
  - **License**: Creative Commons Attribution (CC BY 4.0 - [http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/))
  - **Commercial Use**: Allowed (with attribution)
  - **Modification**: Allowed
  - **Attribution Statement**: "Mitsubishi Lancer Evolution 6 | www.vecarz.com" by vecarz is licensed under CC BY 4.0.
  - **Game Usage**: Rally Class iconic WRC Group A homologation special with 4G63T turbo engine and all-wheel drive (~4.76 MB).

- **Asset Name**: 1999 Mitsubishi Lancer Evolution VI GSR T.M.E.
  - **Asset ID**: `mitsubishi-lancer-evo-tme`
  - **Asset File**: `public/assets/models/vehicles/mitsubishi-lancer-evo-tme.glb`
  - **Source**: Sketchfab ([https://sketchfab.com/3d-models/1999-mitsubishi-lancer-evolution-vi-gsr-tme-d565cdb23b864308acc9678baa05d5d3](https://sketchfab.com/3d-models/1999-mitsubishi-lancer-evolution-vi-gsr-tme-d565cdb23b864308acc9678baa05d5d3))
  - **Creator**: SIU Car Garage (https://sketchfab.com/Game_mode)
  - **License**: Creative Commons Attribution-NonCommercial (CC BY-NC 4.0 - [http://creativecommons.org/licenses/by-nc/4.0/](http://creativecommons.org/licenses/by-nc/4.0/))
  - **Commercial Use**: Non-Commercial Educational / Evaluation
  - **Modification**: Allowed
  - **Attribution Statement**: "1999 Mitsubishi Lancer Evolution VI GSR T.M.E" by SIU Car Garage is licensed under CC BY-NC 4.0.
  - **Game Usage**: Rally Class Tommi Mäkinen Edition special with titanium turbine and redesigned tarmac bumper (~2.72 MB).

- **Asset Name**: 1998 Subaru Impreza 22B STi Version
  - **Asset ID**: `subaru-impreza-22b`
  - **Asset File**: `public/assets/models/vehicles/subaru-impreza-22b.glb`
  - **Source**: Sketchfab ([https://sketchfab.com/3d-models/1998-subaru-impreza-22b-sti-version-66bd94bdd92a4b79a39cd0307870b4eb](https://sketchfab.com/3d-models/1998-subaru-impreza-22b-sti-version-66bd94bdd92a4b79a39cd0307870b4eb))
  - **Creator**: OUTPISTON (https://sketchfab.com/outpiston)
  - **License**: Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA 4.0 - [http://creativecommons.org/licenses/by-nc-sa/4.0/](http://creativecommons.org/licenses/by-nc-sa/4.0/))
  - **Commercial Use**: Non-Commercial Educational / Evaluation
  - **Modification**: Allowed
  - **Attribution Statement**: "1998 Subaru IMPREZA 22B STi Version" by OUTPISTON is licensed under CC BY-NC-SA 4.0.
  - **Game Usage**: Rally Class bespoke widebody boxer rally icon with EJ22 turbo engine and gold BBS wheels (~4.93 MB).

- **Asset Name**: 2010 Ford F-150 SVT Raptor R
  - **Asset ID**: `ford-f150-raptor-r`
  - **Asset File**: `public/assets/models/vehicles/ford-f150-raptor-r.glb`
  - **Source**: Sketchfab ([https://sketchfab.com/3d-models/2010-ford-f-150-svt-raptor-r-b7e63d376e59453490907cebbd44ab72](https://sketchfab.com/3d-models/2010-ford-f-150-svt-raptor-r-b7e63d376e59453490907cebbd44ab72))
  - **Creator**: Galaxy Car Showroom (https://sketchfab.com/adrianaflak09)
  - **License**: Creative Commons Attribution (CC BY 4.0 - [http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/))
  - **Commercial Use**: Allowed (with attribution)
  - **Modification**: Allowed
  - **Attribution Statement**: "2010 Ford F-150 SVT Raptor R" by Galaxy Car Showroom is licensed under CC BY 4.0.
  - **Game Usage**: SUV & Off-Road Class Baja 1000 desert trophy truck with 6.2L V8 and Fox Racing bypass shocks (~5.47 MB).

- **Asset Name**: McLaren MCL35M (F1 2021)
  - **Asset ID**: `mclaren-mcl35m-f1`
  - **Asset File**: `public/assets/models/vehicles/mclaren-mcl35m-f1.glb`
  - **Source**: Sketchfab ([https://sketchfab.com/3d-models/f1-2021-mclaren-mcl35m-967ecec37468412083c40c62b3d7234d](https://sketchfab.com/3d-models/f1-2021-mclaren-mcl35m-967ecec37468412083c40c62b3d7234d))
  - **Creator**: Excalibur (https://sketchfab.com/excalibur)
  - **License**: Creative Commons Attribution (CC BY 4.0 - [http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/))
  - **Commercial Use**: Allowed (with attribution)
  - **Modification**: Allowed
  - **Attribution Statement**: "F1 2021 McLaren MCL35M" by Excalibur is licensed under CC BY 4.0.
  - **Game Usage**: Formula Class Grand Prix winning open-wheel racer with 1,000 HP turbo-hybrid power unit and high-downforce aerodynamics (~7.11 MB).

- **Asset Name**: Red Bull Racing F1 (RB16B)
  - **Asset ID**: `red-bull-f1`
  - **Asset File**: `public/assets/models/vehicles/red-bull-f1.glb`
  - **Source**: Sketchfab ([https://sketchfab.com/3d-models/red-bull-racing-but-with-detached-tyres-949c8dca6fbe4b76a4739dda69ecf0c0](https://sketchfab.com/3d-models/red-bull-racing-but-with-detached-tyres-949c8dca6fbe4b76a4739dda69ecf0c0))
  - **Creator**: Jan Esch (https://sketchfab.com/Njan)
  - **License**: Creative Commons Attribution (CC BY 4.0 - [http://creativecommons.org/licenses/by/4.0/](http://creativecommons.org/licenses/by/4.0/))
  - **Commercial Use**: Allowed (with attribution)
  - **Modification**: Allowed
  - **Attribution Statement**: "Red Bull Racing (but with detached tyres)" by Jan Esch is licensed under CC BY 4.0.
  - **Game Usage**: Formula Class World Championship open-wheel racer with Adrian Newey high-rake aero and detached wheel assemblies (~3.62 MB).

---

## 4. Audio & Sound Assets (Music & Vehicle SFX)

All audio assets are royalty-free and comply with the Universal Asset Policy for web distribution.

- **Asset Name**: Workshop Ambient Lounge Music
  - **Asset File**: `public/assets/audio/music/workshop_ambient.mp3`
  - **Source**: Pixabay ([https://pixabay.com/music/search/lounge/](https://pixabay.com/music/search/lounge/))
  - **Title / Creator**: "Lounge" by The_Mountain
  - **License**: Pixabay Content License (Free for commercial and non-commercial use across digital media, no attribution required)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Pixabay Content License
  - **Game Usage**: Dynamic ambient background lounge music playing during garage customization, vehicle inspection, and showroom viewing with smooth crossfades.

- **Asset Name**: Exhaust Overrun Backfire Pop
  - **Asset File**: `public/assets/audio/effects/exhaust_backfire.mp3`
  - **Source**: Pixabay ([https://pixabay.com/sound-effects/search/car%20backfire/](https://pixabay.com/sound-effects/search/car%20backfire/))
  - **Title / Creator**: "BACKFIRE" by freesound_community
  - **License**: Pixabay Content License (Free for commercial and non-commercial use)
  - **Commercial Use**: Allowed
  - **Modification**: Allowed
  - **Attribution**: Pixabay Content License
  - **Game Usage**: High-RPM overrun anti-lag combustion backfire pop triggered when rapidly lifting throttle above 5,800 RPM.




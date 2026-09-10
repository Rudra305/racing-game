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
1. **Permitted Licenses**: CC0 (Public Domain), MIT, BSD, Apache 2.0, or CC-BY (with explicit attribution in this file).
2. **Prohibited**: Copyrighted game rips, unlicensed models, non-commercial only (CC-NC) restrictions that prohibit commercial distribution.
3. **Budget**: Target $< 2,500$ triangles for LOD0 trees, $< 400$ triangles for LOD1, and $< 16$ triangles for LOD2.

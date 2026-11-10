# Tet environment source

- `tet-environment.blend`: current environment master, containing one `Tet_Environment` scene with the main house, side house and Tet courtyard props.
- Generator: [build_environment.py](../../scripts/blender/build_environment.py). Set `TET_PROJECT_ROOT` to this checkout before running in Blender. It preserves other live scenes and writes only the generated scene into the master.
- Reference render: [tet-environment-preview.png](../images/previews/tet-environment-preview.png), showing the main house, side house and courtyard props; not a screenshot of the complete web experience.

The apricot tree, tiled ground, interactive ornaments, fireworks and runtime lighting effects are implemented in `src/scenes/`. They are not all included in this Blender master.

Runtime exports remain `public/models/tet-house.glb` and `tet-courtyard.glb`. Renaming the source does not require re-exporting them. Run `node scripts/asset-manifest.mjs` and `npm.cmd run check:assets` after an export.

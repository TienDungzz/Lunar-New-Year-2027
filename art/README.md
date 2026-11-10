# Art sources

- `blender/`: current native Blender master and its notes.
- `images/previews/`: reference renders used while developing the scene.

Executable generation tools live in `scripts/`, including `scripts/blender/build_environment.py` and `scripts/prepare-branding.ps1`.

The website serves optimized assets from `public/`; it does not load the original files in `art/`.

Original branding masters are not retained. The logo, goat mark and favicons used by the website live in `public/`. The branding script derives favicon sizes from `public/images/goat-mark.png`.

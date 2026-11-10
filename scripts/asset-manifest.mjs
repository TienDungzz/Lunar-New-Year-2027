import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const sources = [
  ['images/tet-2027-logo.png', 'public/images/tet-2027-logo.png', 'AI-generated project logo based on a user-provided visual reference; no printer branding; only runtime copy retained'],
  ['images/goat-mark.png', 'public/images/goat-mark.png', 'AI-generated goat-only companion to the project logo; only runtime copy retained'],
  ['favicon-32.png', 'public/images/goat-mark.png', 'Project goat mark resized for browser tabs'],
  ['apple-touch-icon.png', 'public/images/goat-mark.png', 'Project goat mark resized for home screens'],
  ['models/tet-house.glb', 'scripts/blender/build_environment.py', 'Original project asset; generated with Blender MCP'],
  ['models/tet-courtyard.glb', 'scripts/blender/build_environment.py', 'Original project courtyard and Tet props; generated with Blender MCP'],
  ['images/courtyard.svg', 'public/images/courtyard.svg', 'Original project artwork'],
  ['images/wish-ornaments.svg', 'public/images/wish-ornaments.svg', 'Original project vector artwork; goat strokes from src/lib/goatShape.mjs; no reference photograph or watermark embedded'],
  ['fonts/noto-serif.ttf', 'public/fonts/OFL-NotoSerif.txt', 'SIL Open Font License 1.1; Google Fonts / Noto Serif'],
  ['fonts/be-vietnam-pro.ttf', 'public/fonts/OFL-BeVietnamPro.txt', 'SIL Open Font License 1.1; Google Fonts / Be Vietnam Pro'],
];
const assets = [];
for (const [path, source, license] of sources) {
  const buffer = await readFile(`public/${path}`);
  let triangles;
  if (path.endsWith('.glb')) {
    const json = JSON.parse(buffer.subarray(20, 20+buffer.readUInt32LE(12)).toString());
    triangles = json.meshes.flatMap(m => m.primitives).reduce((sum, p) => sum + json.accessors[p.indices].count/3, 0);
  }
  assets.push({ path, bytes: buffer.length, sha256: createHash('sha256').update(buffer).digest('hex'), source, license, ...(triangles ? { triangles, textureBytes: 0 } : {}) });
}
await writeFile('public/asset-manifest.json', JSON.stringify({ version: 1, assets }, null, 2)+'\n');
console.log('Asset manifest updated.');

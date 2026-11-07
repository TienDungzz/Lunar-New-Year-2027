import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const sources = [
  ['images/tet-2027-logo.png', 'art/branding/tet-2027-master.png', 'AI-generated project logo based on a user-provided visual reference; no printer branding'],
  ['images/goat-mark.png', 'art/branding/goat-master.png', 'AI-generated goat-only companion to the project logo'],
  ['favicon-32.png', 'art/branding/goat-master.png', 'Project goat mark resized for browser tabs'],
  ['apple-touch-icon.png', 'art/branding/goat-master.png', 'Project goat mark resized for home screens'],
  ['models/tet-house.glb', 'art/blender/build_environment.py', 'Original project asset; generated with Blender MCP'],
  ['models/tet-courtyard.glb', 'art/blender/build_environment.py', 'Original project courtyard and Tet props; generated with Blender MCP'],
  ['images/courtyard.svg', 'public/images/courtyard.svg', 'Original project artwork'],
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

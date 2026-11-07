import { readFile, stat } from 'node:fs/promises';

const html = await readFile('dist/index.html', 'utf8');
const initial = [...html.matchAll(/(?:src|href)="(\/assets\/[^" ]+\.js)"/g)].map(m => m[1]);
let bytes = 0;
for (const asset of new Set(initial)) {
  if (/\/(three|scene-libs|World)-/.test(asset)) throw Error(`3D dependency unexpectedly loaded eagerly: ${asset}`);
  bytes += (await stat(`dist${asset}`)).size;
}
if (bytes > 400000) throw Error(`Initial JavaScript exceeds 400 KB: ${bytes}`);
console.log(`Initial JavaScript: ${bytes} bytes uncompressed; 3D libraries stay behind the lazy scene import.`);

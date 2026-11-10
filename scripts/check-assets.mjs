import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { batchScene } from '../src/lib/batchScene.mjs';
const manifest = JSON.parse(await readFile('public/asset-manifest.json', 'utf8'));
const listed = new Set(manifest.assets.map(asset => asset.path));
if (listed.size !== manifest.assets.length) throw Error('Duplicate asset manifest path');
for (const entry of await readdir('public', { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || entry.name.endsWith('.txt') || entry.name === 'asset-manifest.json') continue;
  const path = `${entry.parentPath}/${entry.name}`.replaceAll('\\', '/').replace(/^.*?public\//, '');
  if (!listed.has(path)) throw Error(`Runtime asset missing from manifest: ${path}`);
}
for (const asset of manifest.assets) {
  const bytes = await readFile(`public/${asset.path}`);
  if (asset.bytes !== bytes.length) throw Error(`Byte count mismatch: ${asset.path}`);
  if (!asset.license?.trim()) throw Error(`Missing asset license: ${asset.path}`);
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw Error(`Checksum mismatch: ${asset.path}`);
  if (asset.path.endsWith('.glb')) {
    if (bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length) throw Error('Invalid GLB header');
    const json = JSON.parse(bytes.subarray(20, 20+bytes.readUInt32LE(12)).toString());
    console.log(`${asset.path}: ${bytes.length} bytes, ${json.meshes.length} meshes`);
    const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset+bytes.byteLength), '');
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse(obj => {
      if (!obj.isMesh) return;
      if (obj.isSkinnedMesh) throw Error('Character/rig asset is outside project scope');
    });
    const batches = batchScene(gltf.scene);
    batches.forEach(batch => batch.geometry.dispose());
    const size = new THREE.Box3().setFromObject(gltf.scene).getSize(new THREE.Vector3());
    if (asset.path === 'models/tet-house.glb' && (size.y < 4.5 || size.y > 5.5 || size.x < 15 || size.x > 17)) throw Error(`Unexpected exported house dimensions: ${size.toArray()}`);
    if (asset.path === 'models/tet-house.glb') {
      for (const required of ['Main house extra room window','Side house plaster rooms','Side room warm doorway','Side house tiled roof','Side house silk lantern']) if (!json.nodes.some(n => n.name?.startsWith(required))) throw Error(`Missing expanded architecture: ${required}`);
    }
    if (asset.path === 'models/tet-house.glb' && !json.nodes.some(n => n.name?.startsWith('Couplet lettering'))) throw Error('Missing actual couplet lettering');
    if (asset.path === 'models/tet-courtyard.glb') {
      for (const required of ['BanhChungPot','Wrapped banh chung','Gate red silk lantern','Warm festoon bulb','Kumquat fruit']) if (!json.nodes.some(n => n.name?.startsWith(required))) throw Error(`Missing courtyard prop: ${required}`);
    }
    console.log(`Decoded with Three.js; batches by material: ${batches.length}; size: ${size.toArray().map(n => n.toFixed(2)).join(' × ')} m`);
  }
  await stat(asset.source);
}
console.log('All asset checksums and sources verified.');

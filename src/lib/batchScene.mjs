import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Untextured lettering may lack UVs and be non-indexed. Normalize attributes
// before batching so every material group has a consistent geometry layout.
export function batchScene(scene) {
  scene.updateMatrixWorld(true);
  const groups = new Map();
  scene.traverse(obj => {
    if (!obj.isMesh || Array.isArray(obj.material)) return;
    let geometry = obj.geometry.clone().applyMatrix4(obj.matrixWorld);
    if (geometry.index) { const expanded = geometry.toNonIndexed(); geometry.dispose(); geometry = expanded; }
    for (const name of Object.keys(geometry.attributes)) if (!['position','normal','uv'].includes(name)) geometry.deleteAttribute(name);
    if (!geometry.attributes.normal) geometry.computeVertexNormals();
    if (!geometry.attributes.uv) geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count*2), 2));
    if (!groups.has(obj.material)) groups.set(obj.material, []);
    groups.get(obj.material).push(geometry);
  });
  return [...groups].map(([material, geometries]) => {
    const geometry = mergeGeometries(geometries,false);
    geometries.forEach(g => g.dispose());
    if (!geometry) throw Error(`Unable to batch ${material.name}`);
    if (material.isMeshStandardMaterial) material.side = THREE.DoubleSide;
    return { geometry, material };
  });
}

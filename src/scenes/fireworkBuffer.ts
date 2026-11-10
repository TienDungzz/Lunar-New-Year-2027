import * as THREE from 'three';

export function createParticleGeometry(capacity: number) {
  const geometry = new THREE.BufferGeometry();
  for (const [name, size] of [['position', 3], ['color', 3], ['alpha', 1], ['size', 1]] as const) {
    const attribute = new THREE.BufferAttribute(new Float32Array(capacity*size), size);
    attribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute(name, attribute);
  }
  geometry.setDrawRange(0, 0);
  return geometry;
}

export function flushParticleGeometry(geometry: THREE.BufferGeometry, count: number) {
  geometry.setDrawRange(0, count);
  if (!count) return;
  for (const name of ['position', 'color', 'alpha', 'size']) {
    const attribute = geometry.getAttribute(name) as THREE.BufferAttribute;
    attribute.clearUpdateRanges();
    attribute.addUpdateRange(0, count*attribute.itemSize);
    attribute.needsUpdate = true;
  }
}

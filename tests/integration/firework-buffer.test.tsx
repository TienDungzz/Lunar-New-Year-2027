import { expect, it } from 'vitest';
import * as THREE from 'three';
import { createParticleGeometry, flushParticleGeometry } from '../../src/scenes/fireworkBuffer';

it('uploads only live particle ranges while preserving a fixed reusable allocation', () => {
  const geometry = createParticleGeometry(30000);
  try {
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
    const original = positions.array;
    expect(positions.usage).toBe(THREE.DynamicDrawUsage);
    flushParticleGeometry(geometry, 480);
    expect(positions.updateRanges).toEqual([{ start: 0, count: 1440 }]);
    expect((geometry.getAttribute('alpha') as THREE.BufferAttribute).updateRanges).toEqual([{ start: 0, count: 480 }]);
    flushParticleGeometry(geometry, 120);
    expect(positions.updateRanges).toEqual([{ start: 0, count: 360 }]);
    expect(positions.array).toBe(original);
    const version = positions.version;
    flushParticleGeometry(geometry, 0);
    expect(geometry.drawRange.count).toBe(0);
    expect(positions.version).toBe(version);
    expect(positions.count).toBe(30000);
  } finally { geometry.dispose(); }
});

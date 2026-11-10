import { expect, it } from 'vitest';
import { createApricotBotany } from '../../src/scenes/apricotStructure';
import { anchors } from '../../src/scenes/ApricotTree';

it('builds finite deterministic tree geometry and bloom orientations without losing the eight wish anchors', () => {
  const first = createApricotBotany(anchors), second = createApricotBotany(anchors);
  try {
    expect(anchors).toHaveLength(8);
    for (const attribute of ['position', 'normal']) {
      const values = first.bark.attributes[attribute].array;
      expect(values.length).toBeGreaterThan(0);
      expect(values.every(Number.isFinite)).toBe(true);
      expect(values).toEqual(second.bark.attributes[attribute].array);
    }
    first.bark.computeBoundingBox();
    expect(first.bark.boundingBox!.max.y).toBeLessThan(5);
    for (const bloom of [...first.flowers, ...first.buds, ...first.leaves]) {
      expect(bloom.position.toArray().every(Number.isFinite)).toBe(true);
      expect(bloom.rotation.length()).toBeCloseTo(1);
    }
  } finally {
    first.bark.dispose();
    second.bark.dispose();
  }
});

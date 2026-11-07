import test from 'node:test';
import assert from 'node:assert/strict';
import { fireworkTypes, sampleShape, seededRandom } from '../src/lib/experience.mjs';
import { SHOW_DURATION_MS, getShowCue, validateFireworkText, sampleTextBitmap } from '../src/lib/fireworkShow.mjs';

test('five-minute score covers different shapes and a denser finale', () => {
  assert.equal(SHOW_DURATION_MS, 300000);
  const types = new Set();
  for (let i = 0; i < 100; i++) types.add(getShowCue(90000, i).type);
  assert.ok(types.size >= 9);
  assert.ok(getShowCue(290000, 0).interval < getShowCue(10000, 0).interval);
  assert.ok(getShowCue(290000, 0, true).interval >= 3000);
});
test('all seventeen icon presets generate finite, bounded targets', () => {
  assert.equal(fireworkTypes.length, 18);
  assert.equal(new Set(fireworkTypes.map(t => t.id)).size, 18);
  for (const type of fireworkTypes.filter(t => t.id !== 'text')) {
    const rng = seededRandom(27);
    for (let i = 0; i < 420; i++) {
      const point = sampleShape(type.id, i, 420, rng);
      assert.ok(point.every(v => Number.isFinite(v) && Math.abs(v) <= 5), type.id);
    }
  }
});
test('text accepts twenty-four visible characters with Vietnamese accents, rejects overflow and markup', () => {
  assert.equal(validateFireworkText('Chúc mừng năm mới').valid, true);
  assert.equal(validateFireworkText('Chúc mừng năm mới'.normalize('NFD')).count, 17);
  assert.equal(validateFireworkText('XUÂN AN YÊN').valid, true);
  assert.equal(validateFireworkText('á'.normalize('NFD').repeat(24)).count, 24);
  assert.equal(validateFireworkText('á'.normalize('NFD').repeat(24)).valid, true);
  assert.equal(validateFireworkText('A B C D E F!').valid, true);
  assert.equal(validateFireworkText('A'.repeat(25)).error, 'length');
  for (const value of ['', '    ', '!!!', '🧨', '<img>']) assert.equal(validateFireworkText(value).valid, false);
});
test('bitmap particles preserve aspect ratio, center glyphs, and honor the point budget', () => {
  const width = 120, height = 40, pixels = new Uint8ClampedArray(width*height*4);
  for (let y = 8; y < 32; y++) for (let x = 10; x < 110; x++) if (x < 20 || x > 100 || y < 12) pixels[(y*width+x)*4+3] = 255;
  const shape = sampleTextBitmap(pixels, width, height, 80);
  assert.equal(shape.length, 80);
  const xs = shape.map(p => p[0]), ys = shape.map(p => p[1]);
  assert.ok(Math.max(...xs)-Math.min(...xs) <= 6.01);
  assert.ok(Math.max(...ys)-Math.min(...ys) < 2);
  assert.deepEqual(sampleTextBitmap(new Uint8ClampedArray(16), 2, 2), []);
});



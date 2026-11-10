import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleShape } from '../src/lib/experience.mjs';
import { createFireworkPlan, sampleSpark } from '../src/lib/fireworkDynamics.mjs';
import { getShowCue } from '../src/lib/fireworkShow.mjs';

test('goat outline has horns, head and separated legs, stays planar and readable, and appears in each show chapter', () => {
  const points = Array.from({ length: 420 }, (_,i) => sampleShape('goat',i,420));
  assert.ok(points.every(p => p[2] === 0 && p.every(Number.isFinite)));
  assert.ok(points.filter(([x,y]) => y > 1.3 && x > 0).length > 15, 'horns above the head');
  assert.ok(points.some(([x,y]) => x > 1.8 && y > .2), 'muzzle projects from the neck');
  assert.ok(points.some(([x,y]) => y < -1.8 && x < -.8), 'hind legs');
  assert.ok(points.some(([x,y]) => y < -1.8 && x > .6), 'front legs');
  const stage = createFireworkPlan('goat',27).stages[0];
  assert.ok(stage.points.length >= 600 && stage.points.length <= 720);
  assert.ok(stage.points.some(([x,y]) => x > -.6 && x < .7 && y > -.35 && y < .1), 'interior coat ornament remains visible');
  const early = sampleSpark(stage,stage.at+1,0), later = sampleSpark(stage,stage.at+1.8,0);
  assert.ok(Math.abs(early.y-later.y) < .01, 'shape must not fall apart while being recognized');
  assert.ok(later.alpha > .65);
  const falling = sampleSpark(stage,stage.at+4.5,0);
  assert.ok(falling.y < later.y-1, 'goat sparks fall visibly after the recognition hold');
  assert.ok(falling.alpha < later.alpha);
  assert.equal(sampleSpark(stage,stage.at+5,0),null);
  for (const elapsed of [1000,120000,290000]) assert.ok(Array.from({ length: 30 },(_,i) => getShowCue(elapsed,i).type).includes('goat'));
});

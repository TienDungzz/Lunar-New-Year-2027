import test from 'node:test';
import assert from 'node:assert/strict';
import { flowReducer as reduce, initialFlow, getRemaining, TET_MS, sampleShape, seededRandom } from '../src/lib/experience.mjs';

test('Vietnam midnight clamps to zero across timezone boundaries', () => {
  assert.equal(new Date(TET_MS).toISOString(), '2027-02-05T17:00:00.000Z');
  assert.deepEqual(getRemaining(TET_MS - 1000), { days: 0, hours: 0, minutes: 0, seconds: 1, done: false });
  assert.equal(getRemaining(TET_MS + 999999).seconds, 0);
  assert.equal(getRemaining(TET_MS + 1).done, true);
});
test('preview does not change the real target; scene navigation is idempotent', () => {
  let state = reduce(initialFlow, { type: 'READY' });
  state = reduce(state, { type: 'PREVIEW' });
  assert.equal(state.phase, 'COUNTDOWN');
  assert.equal(state.mode, 'preview');
  const real = getRemaining(TET_MS-30000);
  assert.equal(getRemaining(TET_MS-30000, TET_MS-20000).seconds, 10);
  assert.equal(real.seconds, 30);
  state = reduce(state, { type: 'MIDNIGHT' });
  assert.equal(reduce(state, { type: 'MIDNIGHT' }), state);
  state = reduce(state, { type: 'REVEAL_DONE' });
  assert.equal(state.phase, 'FIREWORKS');
  state = reduce(state, { type: 'OPEN_TREE' });
  assert.equal(reduce(state, { type: 'OPEN_TREE' }), state);
  state = reduce(state, { type: 'TRANSITION_DONE' });
  assert.equal(state.phase, 'TREE_EXPLORE');
  state = reduce(state, { type: 'OPEN_FIREWORKS' });
  state = reduce(state, { type: 'TRANSITION_DONE' });
  assert.equal(state.phase, 'FIREWORKS');
  assert.equal(state.mode, 'preview');
});
test('heart and ring samples remain legible planar shapes; deterministic output', () => {
  const rng = seededRandom(27), points = Array.from({ length: 120 }, (_, i) => sampleShape('ring', i, 120, rng));
  for (const [x,y,z] of points) { assert.ok(Math.abs(Math.hypot(x,y)-2.3)<.001); assert.ok(Math.abs(z)<.1); }
  const hearts = Array.from({ length: 120 }, (_, i) => sampleShape('heart', i, 120, seededRandom(i)));
  assert.ok(hearts[60][1] < -2);
  assert.ok(hearts[30][0] > 2);
  assert.deepEqual(sampleShape('burst', 5, 120, seededRandom(4)), sampleShape('burst', 5, 120, seededRandom(4)));
});


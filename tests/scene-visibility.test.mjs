import test from 'node:test';
import assert from 'node:assert/strict';
import { getCameraPhase, isFireworksSky } from '../src/lib/sceneVisibility.mjs';

test('moon and moonlight are absent throughout the fireworks sequence and its camera transitions', () => {
  for (const phase of ['COUNTDOWN_PREPARE','MIDNIGHT_REVEAL','FIREWORKS','FIREWORKS_TRANSITION','TREE_TRANSITION']) assert.equal(isFireworksSky(phase),true,phase);
  for (const phase of ['LOADING','COUNTDOWN','TREE_EXPLORE']) assert.equal(isFireworksSky(phase),false,phase);
});

test('the last three seconds and fireworks share a camera target without collapsing navigation transitions', () => {
  assert.equal(getCameraPhase('COUNTDOWN_PREPARE'), getCameraPhase('FIREWORKS'));
  for (const phase of ['LOADING', 'COUNTDOWN', 'TREE_EXPLORE', 'TREE_TRANSITION', 'FIREWORKS_TRANSITION']) assert.equal(getCameraPhase(phase), phase);
});

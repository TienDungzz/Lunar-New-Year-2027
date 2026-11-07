import test from 'node:test';
import assert from 'node:assert/strict';
import { isFireworksSky } from '../src/lib/sceneVisibility.mjs';

test('moon and moonlight are absent throughout the fireworks sequence and its camera transitions', () => {
  for (const phase of ['MIDNIGHT_REVEAL','FIREWORKS','FIREWORKS_TRANSITION','TREE_TRANSITION']) assert.equal(isFireworksSky(phase),true,phase);
  for (const phase of ['LOADING','COUNTDOWN','TREE_EXPLORE']) assert.equal(isFireworksSky(phase),false,phase);
});

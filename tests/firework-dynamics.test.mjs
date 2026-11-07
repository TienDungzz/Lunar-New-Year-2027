import test from 'node:test';
import assert from 'node:assert/strict';
import { fireworkTypes } from '../src/lib/experience.mjs';
import { BURST_LIFETIME_MS } from '../src/lib/fireworkShow.mjs';
import { createFireworkPlan, getFireworkSoundCues, getFireworkTimeline, sampleFlight, sampleSpark } from '../src/lib/fireworkDynamics.mjs';

test('rocket flies for 1.5 seconds before its first visible detonation', () => {
  const stage = createFireworkPlan('rocket', 27).stages[0];
  assert.equal(stage.at, 1.5);
  assert.equal(sampleFlight(stage, 0)[1], -6);
  assert.ok(sampleFlight(stage, .8)[1] < stage.center[1]);
  assert.equal(sampleSpark(stage, 1.49, 0), null);
  assert.equal(sampleFlight(stage, 1.5), null);
  assert.ok(sampleSpark(stage, 1.65, 0).alpha > 0);
});
test('cluster has a mother shell followed by six independently flying and exploding bouquets', () => {
  const plan = createFireworkPlan('cluster', 27);
  assert.equal(plan.stages.length, 7);
  const [mother, ...children] = plan.stages;
  assert.ok(sampleSpark(mother, 1.5, 0));
  for (const child of children) {
    assert.equal(child.launchAt, mother.at);
    assert.ok(child.at > mother.at);
    assert.ok(sampleFlight(child, (child.launchAt+child.at)/2));
    assert.equal(sampleSpark(child, child.at-.01, 0), null);
    assert.ok(sampleSpark(child, child.at+.1, 0).alpha > 0);
    assert.ok(Math.hypot(...child.center) > 1);
  }
  const cues = getFireworkSoundCues('cluster');
  assert.equal(cues.filter(c => c.kind === 'pop').length, 6);
  assert.deepEqual(cues.filter(c => c.kind === 'pop').map(c => c.at), children.map(c => c.at));
});
test('fan, willow and crackling are different temporal behaviors, not only different outlines', () => {
  const fan = getFireworkTimeline('fan');
  assert.equal(fan.length, 5);
  assert.equal(new Set(fan.map(s => s.launchAt)).size, 5);
  assert.equal(new Set(fan.map(s => s.center[0])).size, 5);
  const willow = createFireworkPlan('willow', 27).stages[0];
  assert.ok(willow.life > getFireworkTimeline('burst')[0].life);
  assert.ok(willow.trails > getFireworkTimeline('burst')[0].trails);
  assert.ok(sampleSpark(willow,willow.at+4,0).y < sampleSpark(willow,willow.at+1,0).y);
  assert.equal(getFireworkSoundCues('crackle').filter(c => c.kind === 'crackle').length, 8);
});
test('all plans stay inside the shared lifetime and fixed point budgets', () => {
  for (const preset of fireworkTypes) {
    const plan = createFireworkPlan(preset.id, 27);
    assert.ok(plan.duration*1000 <= BURST_LIFETIME_MS,preset.id);
    assert.ok(plan.pointCount*8 <= 30000,preset.id);
    for (const stage of plan.stages) for (const age of [0,.5,1.5,3,6,9]) {
      const p = sampleSpark(stage,age,0);
      if (p) assert.ok([p.x,p.y,p.z,p.alpha,p.size].every(Number.isFinite),preset.id);
    }
  }
  const reduced = getFireworkTimeline('cluster',true);
  assert.ok(reduced.every(stage => stage.at === 0 && stage.lift === 0 && stage.life === 1.8));
  assert.equal(getFireworkSoundCues('cluster',true).length,1);
});

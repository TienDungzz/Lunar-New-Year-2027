import test from 'node:test';
import assert from 'node:assert/strict';
import { composeGlyphSalvo, getTextScale, TEXT_SALVO_POINT_BUDGET, TEXT_FLIGHT_SECONDS } from '../src/lib/textSalvo.mjs';
import { createFireworkPlan, getFireworkSoundCues, sampleFlight, sampleSpark } from '../src/lib/fireworkDynamics.mjs';

function bitmap(character, top = 4, blank = false) {
  const width = 24, height = 32, pixels = new Uint8ClampedArray(width*height*4);
  if (!blank) for (let y = top; y < 26; y++) for (let x = 5; x < 17; x++) pixels[(y*width+x)*4+3] = 255;
  return { character, width, height, pixels, advance: 20, padding: 4, baseline: 26 };
}
const salvo = () => composeGlyphSalvo([bitmap('Á'),bitmap(' ',0,true),bitmap('B',8),bitmap('C',8)]);

test('one shell per visible glyph, spaces retained, accents and common baseline preserved', () => {
  const result = salvo();
  assert.deepEqual(result.glyphs.map(g => g.character),['Á','B','C']);
  assert.ok(result.glyphs[1].center[0]-result.glyphs[0].center[0] > (result.glyphs[2].center[0]-result.glyphs[1].center[0])*1.8);
  const bottoms = result.glyphs.map(g => Math.min(...g.points.map(p => p[1])));
  assert.ok(bottoms.every(y => Math.abs(y-bottoms[0]) < .001));
  assert.ok(Math.max(...result.glyphs[0].points.map(p => p[1])) > Math.max(...result.glyphs[1].points.map(p => p[1])));
  assert.ok(result.points.length <= TEXT_SALVO_POINT_BUDGET);
});
test('all character shells fly in a row and burst simultaneously, including sound cues', () => {
  const { glyphs, points } = salvo();
  const plan = createFireworkPlan('text',27,points.length,false,points,glyphs);
  assert.equal(plan.stages.length,3);
  assert.ok(plan.stages.every(s => s.at === TEXT_FLIGHT_SECONDS && s.launchAt === 0 && s.bend === 0));
  for (const stage of plan.stages) {
    assert.equal(sampleFlight(stage,.7)[0],stage.center[0]);
    assert.equal(sampleSpark(stage,1.49,0),null);
    assert.ok(sampleSpark(stage,1.65,0).alpha > 0);
  }
  const cues = getFireworkSoundCues('text',false,glyphs);
  assert.equal(cues.filter(c => c.kind === 'lift').length,3);
  assert.ok(cues.filter(c => c.kind === 'boom').every(c => c.at === TEXT_FLIGHT_SECONDS));
  assert.ok(plan.pointCount <= TEXT_SALVO_POINT_BUDGET*2);
});
test('text stays bright and stationary for reading before fading; reduced motion keeps the reading time', () => {
  const { glyphs, points } = salvo();
  const stage = createFireworkPlan('text',27,points.length,false,points,glyphs).stages[0];
  assert.ok(sampleSpark(stage,stage.at+3,0).alpha > .65);
  const before = sampleSpark(stage,stage.at+3,0), after = sampleSpark(stage,stage.at+4,0);
  assert.ok(Math.abs(before.y-after.y) < .001);
  const reduced = createFireworkPlan('text',27,points.length,true,points,glyphs);
  assert.ok(reduced.duration > 6);
  assert.ok(reduced.stages.every(s => s.lift === 0));
});
test('large text fits portrait, desktop and short landscape viewports', () => {
  for (const [width,height] of [[360,800],[1440,900],[800,360]]) {
    const wide = getTextScale(width,height,3,.35);
    assert.ok(wide*6 <= width*.86+.001);
    assert.ok(wide*.7 <= height*.4+.001);
    const tall = getTextScale(width,height,.5,1.7);
    assert.ok(tall*3.4 <= height*.4+.001);
  }
});

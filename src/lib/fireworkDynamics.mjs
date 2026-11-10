import { sampleShape, seededRandom } from './experience.mjs';
import { SHAPE_HOLD_SECONDS, TEXT_FLIGHT_SECONDS, TEXT_SPARK_SECONDS } from './textSalvo.mjs';
import { getLetterColor } from './fireworkPalette.mjs';

// One timeline drives both renderers and Web Audio. Times are seconds from
// ignition; secondary shells have their own flight and detonation.
/** @param {string} type @param {boolean} reduced @param {any[] | undefined} glyphs */
export function getFireworkTimeline(type, reduced = false, glyphs = undefined) {
  const stage = (options = {}) => ({
    launchAt: 0, lift: .65, at: .65, center: [0,0,0], start: [0,-6,0], bend: .12,
    scale: 1, life: 5.1, gravity: .13, drag: 3.6, trails: 6,
    share: 1, color: 'base', sound: 'boom', audibleLift: true, holdShape: false, ...options,
  });
  let stages;
  if ((type === 'text' || type === 'opening') && glyphs?.length) {
    stages = glyphs.map(glyph => stage({ launchAt: 0, lift: TEXT_FLIGHT_SECONDS, at: TEXT_FLIGHT_SECONDS,
      start: [glyph.center[0],-6,0], center: [...glyph.center], bend: 0, life: TEXT_SPARK_SECONDS, gravity: .35, drag: 8,
      trails: 2, share: 1/glyphs.length, glyph, color: 'gold' }));
    if (type === 'opening') {
      stages = stages.map(s => ({ ...s, center: [s.center[0],-.7,0] }));
      stages.push(stage({ lift: TEXT_FLIGHT_SECONDS, at: TEXT_FLIGHT_SECONDS, center: [0,1.1,0],
        scale: .34, life: TEXT_SPARK_SECONDS, gravity: .35, drag: 8, trails: 2, holdShape: true, shape: 'goat', color: 'gold' }));
    }
  } else if (type === 'goat') {
    stages = [stage({ lift: 1.1, at: 1.1, life: 5, gravity: .35, drag: 5, trails: 2, holdShape: true, color: 'gold' })];
  } else if (type === 'rocket') {
    stages = [stage({ lift: 1.5, at: 1.5, bend: .5, life: 4.8 })];
  } else if (type === 'cluster') {
    stages = [stage({ lift: 1.25, at: 1.25, scale: .58, life: 1.9, share: .22 })];
    for (let i = 0; i < 6; i++) {
      const a = i/6*Math.PI*2, at = 2.25+i*.08;
      stages.push(stage({ launchAt: 1.25, lift: at-1.25, at, start: [0,0,0], center: [Math.cos(a)*1.65, Math.sin(a)*1.4, Math.sin(a*2)*.2], bend: .06,
        scale: .43, life: 3.8, share: .13, color: i%2 ? 'gold' : 'red', sound: 'pop', audibleLift: false }));
    }
  } else if (type === 'willow') {
    stages = [stage({ lift: 1.2, at: 1.2, life: 7, gravity: .19, drag: 1.25, trails: 8, color: 'gold' })];
  } else if (type === 'crackle') {
    stages = [stage({ lift: 1.1, at: 1.1, life: 2.3, scale: .85, share: .5 })];
    for (let i = 0; i < 8; i++) {
      const a = i/8*Math.PI*2;
      stages.push(stage({ launchAt: 1.1, lift: 0, at: 1.95+i*.17, center: [Math.cos(a)*1.65, Math.sin(a)*1.4, 0], scale: .23,
        life: 1.6, drag: 7, share: .0625, color: 'white', sound: 'crackle', audibleLift: false, trails: 3 }));
    }
  } else if (type === 'fan') {
    stages = Array.from({ length: 5 }, (_, i) => stage({ launchAt: i*.22, lift: 1, at: 1+i*.22, center: [(i-2)*1.15, 1-Math.abs(i-2)*.35, 0],
      start: [0,-6,0], bend: (i-2)*.1, scale: .5, life: 4, share: .2, color: i%2 ? 'red' : 'gold' }));
  } else {
    stages = [stage({ trails: type === 'text' ? 2 : 6, gravity: type === 'waterfall' ? .48 : type === 'text' ? 0 : .13 })];
  }
  if (reduced) stages = stages.map(s => ({ ...s, launchAt: 0, lift: 0, at: 0, life: type === 'text' || type === 'opening' ? TEXT_SPARK_SECONDS : 1.8, trails: 1, gravity: 0, audibleLift: false }));
  return stages;
}

/** @param {string} type @param {number} seed @param {number} count @param {boolean} reduced @param {number[][] | undefined} textPoints @param {any[] | undefined} glyphs */
export function createFireworkPlan(type, seed, count = 420, reduced = false, textPoints = undefined, glyphs = undefined) {
  const rng = seededRandom(seed);
  const mechanics = ['rocket', 'cluster', 'willow', 'crackle', 'fan'].includes(type);
  const stages = getFireworkTimeline(type, reduced, glyphs).map((stage, stageIndex) => {
    const n = type === 'goat' ? Math.max(640, count) : Math.max(6, Math.floor(count*stage.share));
    const points = stage.shape === 'goat' ? Array.from({ length: 640 }, (_, i) => sampleShape('goat',i,640,rng)) : stage.glyph?.points ?? textPoints ?? Array.from({ length: n }, (_, i) => {
      const p = sampleShape(mechanics ? 'burst' : type, i, n, rng);
      return type === 'willow' ? [p[0], Math.abs(p[1])*.6+.5, p[2]*.5] : p;
    });
    return { ...stage, color: stage.glyph ? getLetterColor(seed,stageIndex) : stage.color, points, stageIndex, text: type === 'text' || type === 'opening' };
  });
  let halfWidth = .1, halfHeight = .1;
  for (const stage of stages) for (const p of stage.points) { halfWidth = Math.max(halfWidth,Math.abs(stage.center[0]+p[0]*stage.scale)); halfHeight = Math.max(halfHeight,Math.abs(stage.center[1]+p[1]*stage.scale)); }
  return { stages, radius: Math.max(halfWidth,halfHeight), halfWidth, halfHeight, duration: Math.max(...stages.map(s => s.at+s.life)), pointCount: stages.reduce((sum,s) => sum+s.points.length*s.trails, 0) };
}

export function sampleFlight(stage, age, out = [0,0,0]) {
  if (!stage.lift || age < stage.launchAt || age >= stage.at) return null;
  const t = Math.max(0, Math.min(1, (age-stage.launchAt)/stage.lift));
  const ease = 1-Math.pow(1-t, 1.3);
  out[0] = stage.start[0]+(stage.center[0]-stage.start[0])*t+Math.sin(t*Math.PI)*stage.bend;
  out[1] = stage.start[1]+(stage.center[1]-stage.start[1])*ease;
  out[2] = stage.start[2]+(stage.center[2]-stage.start[2])*t;
  return out;
}

export function sampleSpark(stage, age, index, tail = 0, reduced = false, out = { x: 0, y: 0, z: 0, alpha: 0, size: 0 }) {
  const elapsed = age-stage.at;
  if (elapsed < 0 || elapsed >= stage.life) return null;
  const t = elapsed-tail*.045;
  if (t < 0) return null;
  const p = stage.points[index];
  const expansion = reduced ? 1 : 1-Math.exp(-t*stage.drag);
  const shaped = stage.text || stage.holdShape;
  const falling = shaped ? Math.max(0,t-SHAPE_HOLD_SECONDS) : t;
  const drop = reduced ? 0 : falling*falling*stage.gravity*(.75+(index%7)*.07);
  const fade = stage.text || stage.holdShape ? Math.min(1,Math.max(0,(stage.life-elapsed)/2.3)) : Math.pow(Math.max(0, 1-elapsed/stage.life), .65);
  const alpha = fade*(reduced ? 1 : Math.min(1,t*16))*(1-tail/(stage.trails+1))*(.85+.15*Math.sin(index*17+t*9));
  out.x = stage.center[0]+p[0]*expansion*stage.scale+(shaped && !reduced ? Math.sin(index*12.9898)*falling*.12 : 0);
  out.y = stage.center[1]+p[1]*expansion*stage.scale-drop;
  out.z = stage.center[2]+p[2]*expansion*stage.scale;
  out.alpha = alpha; out.size = stage.text ? .63 : stage.holdShape ? .8 : 1.1-tail*.075;
  return out;
}

/** @param {string} type @param {boolean} reduced @param {any[] | undefined} glyphs */
export function getFireworkSoundCues(type, reduced = false, glyphs = undefined) {
  if (reduced) return [{ at: 0, kind: 'boom', pan: 0, volume: .45 }];
  const volume = (type === 'text' || type === 'opening') && glyphs?.length ? 1/Math.sqrt(glyphs.length+1) : 1;
  return getFireworkTimeline(type,false,glyphs).flatMap(stage => [
    ...(stage.audibleLift ? [{ at: stage.launchAt, kind: 'lift', pan: stage.center[0]/4, volume: .7*volume, duration: stage.lift }] : []),
    { at: stage.at, kind: stage.sound, pan: stage.center[0]/4, volume: (stage.sound === 'boom' ? .85 : .55)*volume },
  ]);
}

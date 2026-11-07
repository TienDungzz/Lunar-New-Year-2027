import { sampleGoat } from './goatShape.mjs';

export const TET_INSTANT = '2027-02-06T00:00:00+07:00';
export const TET_MS = Date.parse(TET_INSTANT);
export function getRemaining(now = Date.now(), target = TET_MS) {
  const s = Math.max(0, Math.ceil((target - now) / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor(s / 3600) % 24,
    minutes: Math.floor(s / 60) % 60, seconds: s % 60, done: s === 0 };
}
export const initialFlow = { phase: 'LOADING', mode: 'real' };
export function flowReducer(state, event) {
  switch (event.type) {
    case 'READY': return state.phase === 'LOADING' ? { ...state, phase: 'COUNTDOWN' } : state;
    case 'PREVIEW': return state.phase === 'COUNTDOWN' ? { ...state, mode: 'preview' } : state;
    case 'MIDNIGHT': return state.phase === 'COUNTDOWN' ? { ...state, phase: 'FIREWORKS', revealing: true } : state;
    case 'REVEAL_DONE': return state.revealing ? { ...state, revealing: false } : state;
    case 'OPEN_FIREWORKS': return state.phase === 'COUNTDOWN' ? { ...state, phase: 'FIREWORKS' } : state.phase === 'TREE_EXPLORE' ? { ...state, phase: 'FIREWORKS_TRANSITION' } : state;
    case 'OPEN_TREE': return state.phase === 'FIREWORKS' ? { ...state, phase: 'TREE_TRANSITION' } : state;
    case 'TRANSITION_DONE': return state.phase === 'TREE_TRANSITION' ? { ...state, phase: 'TREE_EXPLORE' } : state.phase === 'FIREWORKS_TRANSITION' ? { ...state, phase: 'FIREWORKS' } : state;
    default: return state;
  }
}
export const fireworkTypes = [
  { id: 'goat', vi: 'Dê Đinh Mùi', en: 'Year of the Goat', color: '#ffd56f' },
  { id: 'rocket', vi: 'Tên lửa', en: 'Rocket', color: '#ffd573' },
  { id: 'cluster', vi: 'Nổ liên hoàn', en: 'Peony clusters', color: '#ffb466' },
  { id: 'willow', vi: 'Liễu rủ', en: 'Golden willow', color: '#ffda84' },
  { id: 'crackle', vi: 'Lách tách', en: 'Crackling', color: '#fff0c9' },
  { id: 'fan', vi: 'Quạt liên thanh', en: 'Fan volley', color: '#ff846b' },
  { id: 'burst', vi: 'Pháo chùm', en: 'Burst', color: '#f8bf67' },
  { id: 'heart', vi: 'Trái tim', en: 'Heart', color: '#ff736c' },
  { id: 'ring', vi: 'Vòng tròn', en: 'Ring', color: '#ffd76e' },
  { id: 'waterfall', vi: 'Thác sáng', en: 'Waterfall', color: '#f9e4ab' },
  { id: 'star', vi: 'Ngôi sao', en: 'Star', color: '#ffe099' },
  { id: 'flower', vi: 'Hoa mai', en: 'Blossom', color: '#ffd04e' },
  { id: 'spiral', vi: 'Xoắn ốc', en: 'Spiral', color: '#ff9d64' },
  { id: 'double-ring', vi: 'Vòng kép', en: 'Twin rings', color: '#ffdb8b' },
  { id: 'palm', vi: 'Cọ vàng', en: 'Golden palm', color: '#f9be4c' },
  { id: 'comet', vi: 'Sao chổi', en: 'Comet', color: '#fff0c9' },
  { id: 'butterfly', vi: 'Cánh bướm', en: 'Butterfly', color: '#ff8f91' },
  { id: 'text', vi: 'Pháo chữ', en: 'Sky writing', color: '#ffe9ab' },
];
export function seededRandom(seed = 2027) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function sampleShape(type, i, count, random = Math.random) {
  if (type === 'goat') return sampleGoat(i,count);
  const t = i / count * Math.PI * 2;
  if (type === 'heart') return [Math.pow(Math.sin(t), 3) * 2.2, (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 8, (random() - .5) * .12];
  if (type === 'ring') return [Math.cos(t) * 2.3, Math.sin(t) * 2.3, (random() - .5) * .12];
  if (type === 'waterfall') return [(random() - .5) * 4, random() * .7, (random() - .5) * .8];
  if (type === 'star') {
    const side = Math.floor(i / count * 10), f = (i / count * 10) % 1;
    const a = side * Math.PI / 5 + Math.PI / 2, b = a + Math.PI / 5;
    const r1 = side % 2 ? 1 : 2.5, r2 = side % 2 ? 2.5 : 1;
    return [Math.cos(a)*r1*(1-f)+Math.cos(b)*r2*f, Math.sin(a)*r1*(1-f)+Math.sin(b)*r2*f, 0];
  }
  if (type === 'flower') { const r = 1.65+.65*Math.cos(5*t); return [Math.cos(t)*r, Math.sin(t)*r, (random()-.5)*.1]; }
  if (type === 'spiral') { const a = t*2.5, r = .2+2.3*i/count; return [Math.cos(a)*r, Math.sin(a)*r, 0]; }
  if (type === 'double-ring') { const r = i%2 ? 1.35 : 2.4; return [Math.cos(t)*r, Math.sin(t)*r, 0]; }
  if (type === 'palm') {
    const arm = i%7, u = Math.floor(i/7)/Math.ceil(count/7), a = (arm/6-.5)*Math.PI*.85;
    return [Math.sin(a)*u*2.7, Math.cos(a)*u*2.8-u*u*1.8-.25, (random()-.5)*.2];
  }
  if (type === 'comet') { const u = i/count; return [(u-.5)*4.8, Math.sin(u*Math.PI)*1.1+(random()-.5)*.25*(1-u), 0]; }
  if (type === 'butterfly') { const r = Math.exp(Math.cos(t))-2*Math.cos(4*t)-Math.pow(Math.sin(t/12),5); return [Math.sin(t)*r*.7, Math.cos(t)*r*.7, 0]; }
  const z = random() * 2 - 1, r = Math.sqrt(1 - z*z), size = 1.7 + random() * .9;
  return [Math.cos(t) * r * size, Math.sin(t) * r * size, z * size];
}
export function readStorage(key, fallback) {
  try { const value = localStorage.getItem(key); return value == null ? fallback : JSON.parse(value); } catch { return fallback; }
}
export function writeStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Private mode still works in memory. */ } }




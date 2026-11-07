import { afterEach, beforeEach, expect, it, vi } from 'vitest';

class Param {
  value = 0;
  setValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
  cancelScheduledValues = vi.fn();
  linearRampToValueAtTime = vi.fn();
}
class Node {
  gain = new Param(); frequency = new Param(); pan = new Param(); playbackRate = new Param();
  threshold = new Param(); knee = new Param(); ratio = new Param(); attack = new Param(); release = new Param();
  onended: (() => void) | null = null;
  started: number | null = null; scheduledStop: number | null = null; cancelled = false;
  connect(node: Node) { return node; }
  disconnect = vi.fn();
  start(at: number) { this.started = at; }
  stop(at?: number) { if (at === undefined) this.cancelled = true; else this.scheduledStop = at; }
}
class Context {
  currentTime = 100; sampleRate = 1000; state = 'suspended'; destination = new Node(); sources: Node[] = [];
  constructor() { instances.push(this); }
  gains: Node[] = [];
  createGain() { const node = new Node(); this.gains.push(node); return node; }
  createDynamicsCompressor() { return new Node(); }
  createStereoPanner() { return new Node(); }
  createBiquadFilter() { return new Node(); }
  createBuffer(_channels: number, length: number) { return { getChannelData: () => new Float32Array(length) }; }
  createBufferSource() { const node = new Node(); this.sources.push(node); return node; }
  createOscillator() { const node = new Node(); this.sources.push(node); return node; }
  async resume() { this.state = 'running'; }
  async suspend() { this.state = 'suspended'; }
}
let instances: Context[];
beforeEach(() => { vi.resetModules(); instances = []; vi.stubGlobal('AudioContext',Context); });
afterEach(() => vi.unstubAllGlobals());

it('applies saved volume without starting audio and ramps to silence independently of mute', async () => {
  const audio = await import('../../src/lib/audio');
  audio.setAudioVolume(25);
  expect(instances).toHaveLength(0);
  await audio.setAudioEnabled(true);
  const ctx = instances[0], gain = ctx.gains[1].gain;
  expect(gain.value).toBe(.25);
  audio.setAudioVolume(75);
  expect(gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(.75,100.04);
  audio.setAudioVolume(0);
  expect(gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(0,100.04);
  expect(ctx.state).toBe('running');
  await audio.setAudioEnabled(false);
  await audio.setAudioEnabled(true);
  expect(ctx.gains).toHaveLength(2);
  expect(gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(0,100.04);
});

it('stays silent until a gesture enables sound, then schedules launch and boom at their visual times', async () => {
  const audio = await import('../../src/lib/audio');
  audio.playLaunch('rocket');
  expect(instances).toHaveLength(0);
  await audio.setAudioEnabled(true);
  audio.playLaunch('rocket',27);
  expect(instances[0].sources.filter(n => n.started === 100)).toHaveLength(2);
  expect(instances[0].sources.filter(n => n.started === 101.5)).toHaveLength(2);
  audio.stopFireworkAudio();
});

it('schedules six later cluster pops and cancels every pending voice on mute or hidden tab', async () => {
  const audio = await import('../../src/lib/audio');
  await audio.setAudioEnabled(true);
  audio.playLaunch('cluster',27);
  const ctx = instances[0];
  for (let i = 0; i < 6; i++) expect(ctx.sources.filter(n => n.started === 102.25+i*.08)).toHaveLength(2);
  await audio.setAudioEnabled(false);
  expect(ctx.sources.every(n => n.cancelled)).toBe(true);
  const count = ctx.sources.length;
  audio.playLaunch('cluster');
  expect(ctx.sources.length).toBe(count);
  await audio.setAudioEnabled(true);
  audio.playLaunch('fan');
  audio.suspendAudio();
  expect(ctx.state).toBe('suspended');
  expect(ctx.sources.every(n => n.cancelled)).toBe(true);
});

it('bounds scheduled voices during sustained volleys', async () => {
  const audio = await import('../../src/lib/audio');
  await audio.setAudioEnabled(true);
  for (let i = 0; i < 30; i++) audio.playLaunch('fan',i);
  expect(instances[0].sources.filter(n => n.started !== null).length).toBeLessThanOrEqual(80);
  audio.stopFireworkAudio();
});

it('launches every character sound together and detonates every letter at the same instant', async () => {
  const audio = await import('../../src/lib/audio');
  await audio.setAudioEnabled(true);
  const glyphs = ['T','Ế','T'].map((character,i) => ({ character, center: [(i-1)*2,0,0], points: [[0,0,0]] }));
  audio.playLaunch('text',27,false,glyphs);
  expect(instances[0].sources.filter(n => n.started === 100)).toHaveLength(6);
  expect(instances[0].sources.filter(n => n.started === 101.5)).toHaveLength(6);
  audio.stopFireworkAudio();
});

import { getFireworkSoundCues } from './fireworkDynamics.mjs';
import { seededRandom } from './experience.mjs';
import type { TextGlyph } from './fireworkText';
import { DEFAULT_VOLUME, normalizeVolume } from './audioPreferences.mjs';

let context: AudioContext | null = null;
let master: GainNode | null = null;
let output: GainNode | null = null;
let volume = DEFAULT_VOLUME;
let noise: AudioBuffer | null = null;
let enabled = false;
let enableRequest = 0;
const voices = new Set<{ stop: () => void }>();
const MAX_VOICES = 80;

function initialize() {
  context ??= new AudioContext();
  if (!master) {
    master = context.createGain(); master.gain.value = .55;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -18; compressor.knee.value = 18; compressor.ratio.value = 7;
    compressor.attack.value = .004; compressor.release.value = .25;
    output = context.createGain(); output.gain.value = volume/100;
    master.connect(compressor).connect(output).connect(context.destination);
    noise = context.createBuffer(1,context.sampleRate*2,context.sampleRate);
    const data = noise.getChannelData(0), random = seededRandom(2027);
    for (let i = 0; i < data.length; i++) data[i] = random()*2-1;
  }
}
export function stopFireworkAudio() {
  for (const voice of [...voices]) voice.stop();
}
export function setAudioVolume(value: number) {
  volume = normalizeVolume(value);
  if (!context || !output) return;
  const at = context.currentTime;
  output.gain.cancelScheduledValues(at);
  output.gain.setValueAtTime(output.gain.value,at);
  output.gain.linearRampToValueAtTime(volume/100,at+.04);
}
export async function setAudioEnabled(value: boolean) {
  const request = ++enableRequest;
  if (!value) { enabled = false; stopFireworkAudio(); await context?.suspend(); return; }
  try { initialize(); await context!.resume(); if (request === enableRequest) enabled = true; }
  catch (error) { if (request === enableRequest) enabled = false; throw error; }
}
function startVoice(source: AudioBufferSourceNode | OscillatorNode, nodes: AudioNode[], at: number, end: number) {
  const cleanup = () => { source.disconnect(); nodes.forEach(node => node.disconnect()); voices.delete(voice); };
  const voice = { stop: () => { try { source.stop(); } catch { /* Already ended. */ } cleanup(); } };
  if (voices.size >= MAX_VOICES) { source.disconnect(); nodes.forEach(node => node.disconnect()); return; }
  voices.add(voice); source.onended = cleanup; source.start(at); source.stop(end);
}
function position(gain: GainNode, pan: number) {
  const panner = context!.createStereoPanner(); panner.pan.value = Math.max(-.85,Math.min(.85,pan));
  gain.connect(panner).connect(master!); return panner;
}
function scheduleNoise(at: number, duration: number, pan: number, volume: number, frequency: number, kind: BiquadFilterType, random: () => number) {
  const ctx = context!, source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
  source.buffer = noise; source.playbackRate.value = .85+random()*.3;
  filter.type = kind; filter.frequency.setValueAtTime(frequency,at);
  filter.frequency.exponentialRampToValueAtTime(Math.max(90,frequency*.3),at+duration);
  gain.gain.setValueAtTime(.0001,at); gain.gain.exponentialRampToValueAtTime(Math.max(.001,volume),at+.012);
  gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  source.connect(filter).connect(gain); const panner = position(gain,pan);
  startVoice(source,[filter,gain,panner],at,at+duration+.02);
}
function scheduleTone(at: number, duration: number, pan: number, volume: number, start: number, end: number, type: OscillatorType) {
  const ctx = context!, source = ctx.createOscillator(), gain = ctx.createGain();
  source.type = type; source.frequency.setValueAtTime(start,at); source.frequency.exponentialRampToValueAtTime(end,at+duration);
  gain.gain.setValueAtTime(.0001,at); gain.gain.exponentialRampToValueAtTime(Math.max(.001,volume),at+.02); gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  source.connect(gain); const panner = position(gain,pan);
  startVoice(source,[gain,panner],at,at+duration+.02);
}
export function playLaunch(type: string, seed = 2027, reduced = false, glyphs?: TextGlyph[]) {
  if (!enabled || !context || context.state !== 'running' || document.hidden) return;
  const start = context.currentTime, random = seededRandom(seed), basePan = (random()-.5)*.7;
  for (const cue of getFireworkSoundCues(type,reduced,glyphs)) {
    const at = start+cue.at, pan = basePan+cue.pan, gain = cue.volume;
    if (cue.kind === 'lift') {
      const flight = 'duration' in cue ? Math.max(.2,Number(cue.duration)) : .7;
      scheduleNoise(at,flight*.8,pan,.045*gain,2600,'bandpass',random);
      scheduleTone(at,flight*.95,pan,.022*gain,700+random()*200,1800+random()*400,'sine');
    } else if (cue.kind === 'boom') {
      scheduleNoise(at,.95,pan,.24*gain,950+random()*650,'lowpass',random);
      scheduleTone(at,.7,pan,.17*gain,85+random()*25,30,'sine');
    } else if (cue.kind === 'pop') {
      scheduleNoise(at,.38,pan,.13*gain,1600+random()*900,'lowpass',random);
      scheduleTone(at,.22,pan,.06*gain,160,60,'sine');
    } else {
      for (let i = 0; i < 3; i++) scheduleNoise(at+i*.045,.065,pan,.09*gain,3500+random()*2500,'highpass',random);
    }
  }
}
export function suspendAudio() { stopFireworkAudio(); void context?.suspend().catch(() => {}); }
export function resumeAudio() { if (enabled) void context?.resume().catch(() => {}); }

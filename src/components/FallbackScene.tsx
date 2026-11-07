import { useEffect, useRef } from 'react';
import type { Launch } from '../scenes/Fireworks';
import { fireworkTypes, seededRandom } from '../lib/experience.mjs';
import { MAX_ACTIVE_BURSTS } from '../lib/fireworkShow.mjs';
import { createFireworkPlan, sampleFlight, sampleSpark } from '../lib/fireworkDynamics.mjs';
import { isFireworksSky } from '../lib/sceneVisibility.mjs';
import { getTextScale } from '../lib/textSalvo.mjs';
import { FIREWORK_PALETTE } from '../lib/fireworkPalette.mjs';

type Effect = { x: number; y: number; text: boolean; plan: ReturnType<typeof createFireworkPlan>; color: string; born: number };
export default function FallbackScene({ phase, launch, reduced, visible }: { phase: string; launch: Launch | null; reduced: boolean; visible: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null), particles = useRef<Effect[]>([]);
  useEffect(() => { particles.current = []; }, [phase, visible, reduced]);
  useEffect(() => {
    if (!launch || phase !== 'FIREWORKS') return;
    const rng = seededRandom(launch.id*37);
    const text = launch.type === 'text' || launch.type === 'opening';
    particles.current.push({ x: text ? .5 : .26+rng()*.48, y: text ? .5 : .34+rng()*.08, text,
      plan: createFireworkPlan(launch.type, launch.id*37, launch.points?.length ?? 240, reduced, launch.points, launch.glyphs),
      color: fireworkTypes.find(x => x.id === launch.type)?.color ?? '#ffd477', born: performance.now() });
    particles.current = particles.current.slice(-MAX_ACTIVE_BURSTS);
  }, [launch, phase]);
  useEffect(() => {
    if (!visible) return;
    const el = canvas.current!, ctx = el.getContext('2d');
    if (!ctx) return;
    const palette = FIREWORK_PALETTE, flight = [0,0,0], scratch = { x: 0, y: 0, z: 0, alpha: 0, size: 0 };
    let raf = 0;
    const draw = (now: number) => {
      const w = el.clientWidth, h = el.clientHeight;
      if (el.width !== w || el.height !== h) { el.width = w; el.height = h; }
      ctx.clearRect(0,0,w,h); ctx.globalCompositeOperation = 'lighter';
      particles.current = particles.current.filter(p => (now-p.born)/1000 < p.plan.duration);
      for (const p of particles.current) {
        const age = (now-p.born)/1000, scale = p.text ? getTextScale(w,h,p.plan.halfWidth,p.plan.halfHeight) : Math.min(w*.24,h*.22)/p.plan.radius;
        for (const stage of p.plan.stages) {
          ctx.fillStyle = ctx.shadowColor = stage.color === 'base' ? p.color : palette[stage.color as keyof typeof palette];
          ctx.shadowBlur = stage.text ? 4 : 9;
          if (age < stage.at) {
            for (let tail = 0; tail < 30; tail++) {
              const pos = sampleFlight(stage,age-tail*.01,flight);
              if (!pos) continue;
              ctx.globalAlpha = 1-tail/30;
              ctx.beginPath(); ctx.arc(p.x*w+pos[0]*scale,p.y*h-pos[1]*scale,tail < 3 ? 2.6 : 1.3,0,Math.PI*2); ctx.fill();
            }
            continue;
          }
          for (let i = 0; i < stage.points.length; i++) for (let tail = 0; tail < Math.min(4,stage.trails); tail++) {
            const s = sampleSpark(stage,age,i,tail,reduced,scratch);
            if (!s) continue;
            ctx.globalAlpha = s.alpha;
            ctx.beginPath(); ctx.arc(p.x*w+s.x*scale,p.y*h-s.y*scale,stage.text ? 1.1 : Math.max(.6,s.size*1.7),0,Math.PI*2); ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf);
  }, [visible,reduced]);
  return <div className={`fallback-scene${phase.includes('TREE') ? ' fallback-scene--tree' : ''}`}><img className="fallback-scene__image" src="/images/courtyard.svg" alt="" />{!isFireworksSky(phase) && <div className="fallback-scene__moon" aria-hidden="true" />}<canvas ref={canvas} className="fallback-scene__canvas" aria-hidden="true" /></div>;
}

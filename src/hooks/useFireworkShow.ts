import { useCallback, useEffect, useRef, useState } from 'react';
import { getShowCue, SHOW_DURATION_MS } from '../lib/fireworkShow.mjs';

export default function useFireworkShow({ active, visible, reduced, onLaunch }: { active: boolean; visible: boolean; reduced: boolean; onLaunch: (type: string, strength: number) => void }) {
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [generation, setGeneration] = useState(0);
  const clock = useRef({ elapsed: 0, next: 0, index: 0, generation: 0 });
  const callback = useRef(onLaunch); callback.current = onLaunch;
  useEffect(() => {
    if (!active || !visible || !playing || clock.current.elapsed >= SHOW_DURATION_MS) return;
    let last = performance.now();
    const currentGeneration = clock.current.generation;
    const advance = () => {
      const now = performance.now(), delta = Math.max(0, now-last); last = now;
      clock.current.elapsed = Math.min(SHOW_DURATION_MS, clock.current.elapsed+delta);
      setElapsed(clock.current.elapsed);
      if (clock.current.elapsed >= SHOW_DURATION_MS) { setPlaying(false); return; }
      if (clock.current.elapsed >= clock.current.next) {
        const cue = getShowCue(clock.current.elapsed, clock.current.index++, reduced);
        callback.current(cue.type, cue.strength);
        // Schedule from NOW: never replay a backlog of missed shots.
        clock.current.next = clock.current.elapsed+cue.interval;
      }
    };
    advance();
    const timer = setInterval(advance, 200);
    return () => {
      clearInterval(timer);
      if (clock.current.generation === currentGeneration) {
        clock.current.elapsed = Math.min(SHOW_DURATION_MS, clock.current.elapsed+Math.max(0, performance.now()-last));
        setElapsed(clock.current.elapsed);
        if (clock.current.elapsed >= SHOW_DURATION_MS) setPlaying(false);
      }
    };
  }, [active, visible, playing, reduced, generation]);
  const toggle = useCallback(() => setPlaying(value => !value), []);
  const restart = useCallback(() => {
    const nextGeneration = clock.current.generation+1;
    clock.current = { elapsed: 0, next: 0, index: 0, generation: nextGeneration };
    setElapsed(0); setPlaying(true); setGeneration(nextGeneration);
  }, []);
  return { playing, elapsed, remaining: Math.max(0, Math.ceil((SHOW_DURATION_MS-elapsed)/1000)), complete: elapsed >= SHOW_DURATION_MS, toggle, restart };
}

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { flowReducer, getRemaining, initialFlow, TET_MS } from '../lib/experience.mjs';
import { resumeAudio, suspendAudio } from '../lib/audio';

function usePageClock() {
  const [now, setNow] = useState(Date.now());
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 250);
    const visibility = () => {
      tick();
      setVisible(!document.hidden);
      if (document.hidden) suspendAudio();
      else resumeAudio();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  return { now, visible, setNow };
}

export default function useExperienceClock(reduced: boolean) {
  const { now, visible, setNow } = usePageClock();
  const [flow, dispatch] = useReducer(flowReducer, initialFlow);
  const [previewTarget, setPreviewTarget] = useState<number | null>(null);
  const openedBeforeMidnight = useRef(!getRemaining().done);
  const phase = flow.phase;
  const remaining = getRemaining(now);
  const preview = previewTarget !== null && !remaining.done;
  const display = preview ? getRemaining(now, previewTarget) : remaining;
  const showFireworksEntry = remaining.done || new URLSearchParams(location.search).get('mode') === 'preview';
  const preparingSky = phase === 'COUNTDOWN' && !display.done && !display.days && !display.hours && !display.minutes && display.seconds <= 3;
  useEffect(() => {
    if (phase !== 'COUNTDOWN' || !visible) return;
    const target = previewTarget ?? TET_MS;
    const timers = [target-3000, target]
      .filter(at => at > Date.now() && at-Date.now() < 2147483647)
      .map(at => setTimeout(() => setNow(Date.now()), at-Date.now()));
    return () => timers.forEach(clearTimeout);
  }, [phase, visible, previewTarget, setNow]);
  useEffect(() => {
    if (phase !== 'COUNTDOWN' || !visible) return;
    if ((preview && display.done) || (remaining.done && (previewTarget || openedBeforeMidnight.current))) dispatch({ type: 'MIDNIGHT' });
  }, [display.done, remaining.done, preview, previewTarget, phase, visible]);
  useEffect(() => {
    if (!flow.revealing) return;
    const timer = setTimeout(() => dispatch({ type: 'REVEAL_DONE' }), reduced ? 150 : 1800);
    return () => clearTimeout(timer);
  }, [flow.revealing, reduced]);
  const startPreview = useCallback(() => {
    setPreviewTarget(Date.now()+10000);
    dispatch({ type: 'PREVIEW' });
  }, []);
  const ready = useCallback(() => dispatch({ type: 'READY' }), []);
  const finishTransition = useCallback(() => dispatch({ type: 'TRANSITION_DONE' }), []);
  return { flow, dispatch, phase, visible, remaining, preview, display, showFireworksEntry, preparingSky, startPreview, ready, finishTransition };
}

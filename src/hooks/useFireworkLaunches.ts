import { useCallback, useEffect, useRef, useState } from 'react';
import { fireworkTypes } from '../lib/experience.mjs';
import { playLaunch, stopFireworkAudio } from '../lib/audio';
import { BURST_LIFETIME_MS, MAX_ACTIVE_BURSTS } from '../lib/fireworkShow.mjs';
import { TEXT_EFFECT_LIFETIME_MS } from '../lib/textSalvo.mjs';
import { createOpeningTextSalvo, createPresetTextSalvo, type TextSalvo } from '../lib/fireworkText';
import type { Launch } from '../scenes/Fireworks';
import useFireworkShow from './useFireworkShow';

function useLaunchAdmission(phase: string, visible: boolean, reduced: boolean) {
  const fireworks = phase === 'FIREWORKS';
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [lastType, setLastType] = useState('goat');
  const nextLaunch = useRef(0), launchHistory = useRef<{ at: number; automatic: boolean; text: boolean }[]>([]), lastManual = useRef(-Infinity), cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setLaunch(null);
    launchHistory.current = [];
    lastManual.current = -Infinity;
    stopFireworkAudio();
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    setCooldown(false);
    return () => { if (cooldownTimer.current) clearTimeout(cooldownTimer.current); };
  }, [phase, visible]);
  const shoot = useCallback((type: string, automated = false, extra: Omit<Launch, 'id' | 'type'> = {}) => {
    if (document.hidden || !visible || !fireworks || !(type === 'opening' || fireworkTypes.some(preset => preset.id === type))) return false;
    if (type === 'text' && (!extra.points?.length || !extra.glyphs?.length)) return false;
    const time = performance.now();
    launchHistory.current = launchHistory.current.filter(entry => time-entry.at < (entry.text ? TEXT_EFFECT_LIFETIME_MS : BURST_LIFETIME_MS));
    // Automatic shots reserve two slots for the visitor, and never lock the UI.
    if (launchHistory.current.length >= (automated ? MAX_ACTIVE_BURSTS-2 : MAX_ACTIVE_BURSTS)) return false;
    if (!automated && time-lastManual.current < 380) return false;
    if (type === 'text' && launchHistory.current.some(entry => entry.text)) return false;
    launchHistory.current.push({ at: time, automatic: automated, text: type === 'text' || type === 'opening' });
    const id = ++nextLaunch.current;
    setLaunch({ id, type, ...extra }); playLaunch(type,id*37,reduced,extra.glyphs);
    if (!automated) {
      lastManual.current = time; setLastType(type); setCooldown(true);
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
      const wait = launchHistory.current.length >= MAX_ACTIVE_BURSTS ? Math.min(...launchHistory.current.map(entry => (entry.text ? TEXT_EFFECT_LIFETIME_MS : BURST_LIFETIME_MS)-(time-entry.at)))+50 : 400;
      cooldownTimer.current = setTimeout(() => { setCooldown(false); }, wait);
    }
    return true;
  }, [visible, fireworks, reduced]);
  return { launch, cooldown, lastType, shoot };
}

export default function useFireworkLaunches(phase: string, visible: boolean, reduced: boolean) {
  const admission = useLaunchAdmission(phase, visible, reduced);
  const { shoot } = admission;
  const fireworks = phase === 'FIREWORKS';
  const openingText = useRef<TextSalvo | null>(null);
  useEffect(() => {
    let cancelled = false;
    void createPresetTextSalvo('new-year').then(salvo => { if (!cancelled) openingText.current = salvo; }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const automaticShot = useCallback((type: string, strength: number) => {
    if (type === 'opening') {
      try {
        const salvo = openingText.current ?? createOpeningTextSalvo();
        shoot(type,true,{ strength, text: 'Chúc mừng năm mới', ...salvo });
      } catch { shoot('goat',true,{ strength }); }
    } else shoot(type, true, { strength });
  }, [shoot]);
  const show = useFireworkShow({ active: fireworks, visible, reduced, onLaunch: automaticShot });
  return { ...admission, show };
}

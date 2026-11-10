import { useCallback, useEffect, useState } from 'react';
import { createTranslator, normalizeLocale } from '../i18n';
import { readStorage, writeStorage } from '../lib/experience.mjs';
import useWishContent, { type Language } from './useWishContent';
import { useMedia, useSeen } from './usePreferences';
import useExperienceClock from './useExperienceClock';
import useExperienceAudio from './useExperienceAudio';
import useSceneFallback from './useSceneFallback';
import useFireworkLaunches from './useFireworkLaunches';
import useSkyWriting from './useSkyWriting';

export default function useExperience() {
  const [lang, setLang] = useState<Language>(() => normalizeLocale(readStorage('tet-language', 'vi')));
  const [selected, setSelected] = useState<number | null>(null);
  const [reset, setReset] = useState(0);
  const [listOpen, setListOpen] = useState(false);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const clock = useExperienceClock(reduced);
  const { phase, ready, finishTransition, visible, preparingSky } = clock;
  const scene = useSceneFallback(phase, reduced, ready, finishTransition);
  const launches = useFireworkLaunches(phase, visible, reduced);
  const audio = useExperienceAudio();
  const skyWriting = useSkyWriting();
  const content = useWishContent();
  const { seen, mark } = useSeen(content.namespace);
  const t = createTranslator(lang);
  useEffect(() => {
    writeStorage('tet-language', lang);
    document.documentElement.lang = lang;
    document.title = t('meta.title');
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
  }, [lang]);
  useEffect(() => { setSelected(null); }, [content.namespace, phase]);
  const openWish = useCallback((index: number) => {
    if (phase !== 'TREE_EXPLORE' || content.loading || !content.wishes[index]) return;
    mark(content.wishes[index].id);
    setSelected(index);
  }, [phase, content.loading, content.wishes, mark]);
  return {
    ...clock, ...scene, ...launches, ...audio,
    lang, setLang, t, vi: lang === 'vi', content, seen, openWish, skyWriting,
    selected, setSelected, reset, setReset, listOpen, setListOpen, reduced,
    tree: phase === 'TREE_EXPLORE', fireworks: phase === 'FIREWORKS',
    transition: phase.endsWith('TRANSITION'), visualPhase: preparingSky ? 'COUNTDOWN_PREPARE' : phase,
  };
}

export type Experience = ReturnType<typeof useExperience>;

import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../lib/experience.mjs';
import { wishIds } from '../data/wishes';

export function useMedia(query: string) {
  const [matches, setMatches] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const media = matchMedia(query), update = () => setMatches(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}
export function useSeen(namespace: string) {
  const [seen, setSeen] = useState<Record<string, string[]>>(() => {
    const raw = readStorage('tet-wishes-seen', {});
    if (Array.isArray(raw)) return { default: [...new Set(raw.filter(id => typeof id === 'string' && wishIds.has(id)))] };
    if (!raw || raw.version !== 1 || !raw.sets || typeof raw.sets !== 'object') return {};
    return Object.fromEntries(Object.entries(raw.sets).filter(([, ids]) => Array.isArray(ids)).map(([key, ids]) => [key, [...new Set((ids as unknown[]).filter((id): id is string => typeof id === 'string' && wishIds.has(id)))]]));
  });
  const mark = (id: string) => { if (wishIds.has(id)) setSeen(old => ({ ...old, [namespace]: [...new Set([...(old[namespace] || []), id])] })); };
  useEffect(() => writeStorage('tet-wishes-seen', { version: 1, sets: seen }), [seen]);
  return { seen: seen[namespace] || [], mark };
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import defaults from '../data/wishes.json';
import { fetchContent, resolveContentConfig } from '../lib/contentApi.mjs';

export type Language = 'vi' | 'en';
export type Wish = typeof defaults[number];
export default function useWishContent() {
  const [search, setSearch] = useState(location.search);
  const [attempt, setAttempt] = useState(0);
  const config = useMemo(() => resolveContentConfig(search, import.meta.env.VITE_CONTENT_API_URL, import.meta.env.VITE_CONTENT_ID_PARAM, location.origin), [search]);
  const [snapshot, setSnapshot] = useState({ namespace: config.namespace, wishes: defaults, loading: !!config.url, error: false });
  useEffect(() => {
    const update = () => setSearch(location.search);
    window.addEventListener('popstate', update);
    window.addEventListener('tet:routechange', update);
    return () => { window.removeEventListener('popstate', update); window.removeEventListener('tet:routechange', update); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    if (!config.url) { setSnapshot({ namespace: config.namespace, wishes: defaults, loading: false, error: false }); return; }
    setSnapshot(old => ({ namespace: config.namespace, wishes: old.namespace === config.namespace ? old.wishes : defaults, loading: true, error: false }));
    fetchContent(config.url, defaults, { signal: controller.signal }).then(wishes => {
      if (!controller.signal.aborted) setSnapshot({ namespace: config.namespace, wishes, loading: false, error: false });
    }).catch(() => {
      if (!controller.signal.aborted) setSnapshot(old => ({ ...old, loading: false, error: true }));
    });
    return () => controller.abort();
  }, [config, attempt]);
  const retry = useCallback(() => setAttempt(a => a + 1), []);
  return { ...snapshot, wishes: snapshot.namespace === config.namespace ? snapshot.wishes : defaults, namespace: config.namespace, loading: snapshot.namespace !== config.namespace || snapshot.loading, retry };
}

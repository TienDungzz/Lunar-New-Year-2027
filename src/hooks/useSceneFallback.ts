import { useCallback, useEffect, useState } from 'react';

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}

export default function useSceneFallback(phase: string, reduced: boolean, ready: () => void, finishTransition: () => void) {
  const [fallback, setFallback] = useState(() => !hasWebGL());
  const [sceneKey, setSceneKey] = useState(0);
  const sceneError = useCallback(() => {
    setFallback(true);
    ready();
  }, [ready]);
  useEffect(() => {
    if (phase !== 'LOADING') return;
    if (fallback) { ready(); return; }
    const timer = setTimeout(sceneError, 20000);
    return () => clearTimeout(timer);
  }, [phase, fallback, ready, sceneError]);
  useEffect(() => {
    if (!fallback || !phase.endsWith('TRANSITION')) return;
    const timer = setTimeout(finishTransition, reduced ? 50 : 600);
    return () => clearTimeout(timer);
  }, [fallback, phase, finishTransition, reduced]);
  const retryScene = async () => {
    if (!hasWebGL()) return;
    try {
      const { clearWorldCache } = await import('../scenes/World');
      clearWorldCache();
      setSceneKey(key => key+1);
      setFallback(false);
    } catch { setFallback(true); }
  };
  return { fallback, sceneKey, sceneError, retryScene };
}

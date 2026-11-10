import { Component, lazy, Suspense, useMemo, type ComponentProps, type ReactNode } from 'react';
import type { Experience } from '../hooks/useExperience';
import FallbackScene from './FallbackScene';

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.error ? null : this.props.children; }
}

const loadWorld = () => import('../scenes/World');
type WorldProps = ComponentProps<Awaited<ReturnType<typeof loadWorld>>['default']>;

export function RecoverableWorld({ version, load = loadWorld, ...props }: WorldProps & { version: number; load?: typeof loadWorld }) {
  const World = useMemo(() => lazy(load), [version, load]);
  return <SceneBoundary key={version} onError={props.onError}>
    <Suspense fallback={null}><World {...props} /></Suspense>
  </SceneBoundary>;
}

export default function ExperienceScene({ experience }: { experience: Experience }) {
  const { fallback, sceneKey, sceneError, visualPhase, launch, reduced, visible, seen, openWish, ready, finishTransition, selected, content, reset } = experience;
  return (<div className="world" aria-hidden="true">
      {fallback ? <FallbackScene phase={visualPhase} launch={launch} reduced={reduced} visible={visible} /> : <RecoverableWorld version={sceneKey} phase={visualPhase} reduced={reduced} seen={seen} launch={launch} onOpen={openWish} onReady={ready} onTransition={finishTransition} onError={sceneError} modalOpen={selected !== null || content.loading} reset={reset} visible={visible} />}
    </div>);
}

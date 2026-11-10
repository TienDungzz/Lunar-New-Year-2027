import { createTranslator, type Locale } from '../i18n';
import Icon from './Icons';

export type SceneDestination = 'fireworks' | 'wishes';
export default function SceneNavigation({ lang, active, transitioning, onNavigate }: {
  lang: Locale; active: SceneDestination; transitioning: boolean; onNavigate: (destination: SceneDestination) => void;
}) {
  const t = createTranslator(lang);
  const items = [
    { id: 'fireworks' as const, label: t('navigation.fireworks'), icon: 'burst', number: '01' },
    { id: 'wishes' as const, label: t('navigation.wishes'), icon: 'flower', number: '02' },
  ];
  return <nav className={`scene-navigation scene-navigation--${active}`} aria-label={t('common.scene.navigation')} aria-busy={transitioning}>
    <span className="scene-navigation__indicator" aria-hidden="true" />
    {items.map(item => <button key={item.id} className="scene-navigation__link" aria-current={active === item.id ? 'page' : undefined} disabled={transitioning} onClick={() => { if (item.id !== active) onNavigate(item.id); }}>
      <span className="scene-navigation__number" aria-hidden="true">{item.number}</span><Icon name={item.icon} /><span>{item.label}</span>
    </button>)}
  </nav>;
}

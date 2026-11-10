import { createTranslator, type Locale } from '../i18n';
import Icon from './Icons';

export default function VolumeControl({ lang, volume, enabled, onChange }: {
  lang: Locale; volume: number; enabled: boolean; onChange: (value: number) => void;
}) {
  const t = createTranslator(lang);
  return <div className="volume-control" role="group" aria-label={t('common.firework.volume')}>
    <button className="volume-control__button" onClick={() => onChange(Math.max(0,volume-10))} disabled={volume === 0} aria-label={t('common.decrease.volume')}><Icon name="minus" /></button>
    <input className="volume-control__slider" type="range" min="0" max="100" step="1" value={volume} onChange={event => onChange(Number(event.target.value))} aria-label={t('common.firework.volume')} aria-valuetext={`${volume}%${enabled ? '' : t('common.muted')}`} />
    <button className="volume-control__button" onClick={() => onChange(Math.min(100,volume+10))} disabled={volume === 100} aria-label={t('common.increase.volume')}><Icon name="plus" /></button>
  </div>;
}

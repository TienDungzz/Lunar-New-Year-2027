import { useEffect, useRef, useState } from 'react';
import { createTranslator, type Locale } from '../i18n';
import { useMedia } from '../hooks/usePreferences';
import Icon from './Icons';
import VolumeControl from './VolumeControl';

export default function HeaderAudio({ lang, enabled, volume, onVolumeChange }: {
  lang: Locale; enabled: boolean; volume: number; onVolumeChange: (value: number) => void;
}) {
  const t = createTranslator(lang), hover = useMedia('(hover: hover) and (pointer: fine)');
  const [open, setOpen] = useState(false);
  const displayedVolume = enabled ? volume : 0;
  const root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown',dismiss);
    return () => document.removeEventListener('pointerdown',dismiss);
  }, [open]);
  return <div className="header-audio" ref={root}
    onMouseEnter={() => { if (hover) setOpen(true); }}
    onMouseLeave={() => { if (hover && !root.current?.contains(document.activeElement)) setOpen(false); }}
    onFocus={event => { if (hover && !event.currentTarget.contains(event.relatedTarget)) setOpen(true); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); trigger.current?.focus(); setOpen(false); } }}>
    <button className="icon-button" ref={trigger} onClick={() => setOpen(value => hover ? true : !value)} aria-label={t('common.adjust.volume')} title={t('fireworks.volumeValue', { volume: displayedVolume })} aria-expanded={open} aria-controls="header-audio-volume"><Icon name={displayedVolume > 0 ? 'sound' : 'muted'} /></button>
    {open && <div className="header-audio__popup" id="header-audio-volume">
      <div className="header-audio__panel">
        <VolumeControl lang={lang} volume={displayedVolume} enabled={enabled} onChange={onVolumeChange} />
      </div>
    </div>}
  </div>;
}

import { createTranslator } from '../i18n';
import { useEffect, useRef, useState } from 'react';
import type { Language } from '../hooks/useWishContent';
import { fireworkTypes, readStorage, writeStorage } from '../lib/experience.mjs';
import { useMedia } from '../hooks/usePreferences';
import { MAX_TEXT_CHARACTERS, validateFireworkText } from '../lib/fireworkShow.mjs';
import { createPresetTextSalvo, createTextSalvo, textFireworkPresets, type TextSalvo } from '../lib/fireworkText';
import Icon from './Icons';

type Show = { playing: boolean; remaining: number; complete: boolean; toggle: () => void; restart: () => void };
type DockPosition = 'bottom' | 'left' | 'right';
const DOCK_STORAGE_KEY = 'tet-firework-dock';
export default function FireworksControls({ lang, show, cooldown, lastType, onShoot, onText, soundEnabled = false, onToggleSound, textActive = false, volume = 70, onVolumeChange }: {
  lang: Language; show: Show; cooldown: boolean; lastType: string;
  onShoot: (type: string) => boolean; onText: (text: string, salvo: TextSalvo) => boolean;
  soundEnabled?: boolean; onToggleSound?: () => void;
  textActive?: boolean;
  volume?: number; onVolumeChange?: (value: number) => void;
}) {
  const t = createTranslator(lang);
  const mobile = useMedia('(max-width: 699px), (max-height: 550px) and (pointer: coarse)');
  const [position, setPosition] = useState<DockPosition>(() => {
    const stored = readStorage(DOCK_STORAGE_KEY,'bottom');
    return stored === 'left' || stored === 'right' ? stored : 'bottom';
  });
  const effectivePosition = mobile ? 'bottom' : position;
  const [writing, setWriting] = useState(false);
  const [text, setText] = useState('AN YÊN 2027');
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState('');
  const [volumeOpen, setVolumeOpen] = useState(false);
  const mounted = useRef(true), busy = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const validation = validateFireworkText(text);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (writing) input.current?.focus(); }, [writing]);
  useEffect(() => writeStorage(DOCK_STORAGE_KEY,position), [position]);
  const submit = async (preset?: typeof textFireworkPresets[number]) => {
    if ((!preset && !validation.valid) || busy.current || cooldown) return;
    busy.current = true; setPreparing(true); setError('');
    try {
      const salvo = preset ? await createPresetTextSalvo(preset.id) : await createTextSalvo(validation.text);
      if (mounted.current) {
        if (onText(preset?.text ?? validation.text,salvo)) setWriting(false);
        else setError(t('common.the.sky.is.full.try.again.in'));
      }
    } catch {
      if (mounted.current) setError(t('common.could.not.create.sky.writing.please.try'));
    } finally { busy.current = false; if (mounted.current) setPreparing(false); }
  };
  return <section className={`firework-dock firework-dock--${effectivePosition}${mobile ? ' firework-dock--mobile' : ''}${textActive ? ' firework-dock--text-active' : ''}`} aria-label={t('common.firework.controls')}>
    {!mobile && <div className="dock-position" role="group" aria-label={t('common.firework.panel.position')}>
      <span className="sr-only">{t('common.panel.position')}</span>
      {(['bottom','left','right'] as const).map(value => {
        const label = value === 'bottom' ? t('common.dock.panel.at.bottom') : value === 'left' ? t('common.dock.panel.on.left') : t('common.dock.panel.on.right');
        return <button key={value} className="dock-position__button" aria-label={label} title={label} aria-pressed={position === value} onClick={() => setPosition(value)}><Icon name={`dock-${value}`} /></button>;
      })}
    </div>}
    <div className="firework-dock__show">
      <div className="firework-dock__status"><span className="live-dot" /><span className="sr-only">{show.complete ? t('common.the.show.has.finished') : show.playing ? t('common.auto.show.five.minutes') : t('common.auto.show.paused')}</span><time className="firework-dock__timer" aria-label={t('common.auto.show.time.remaining')}>{String(Math.floor(show.remaining/60)).padStart(2,'0')}:{String(show.remaining%60).padStart(2,'0')}</time></div>
      <div className="firework-dock__actions">{onVolumeChange && <button className="text-button firework-dock__play" onClick={() => setVolumeOpen(value => !value)} aria-label={t('common.adjust.volume')} title={t('fireworks.volumeValue', { volume })} aria-expanded={volumeOpen} aria-controls="firework-volume-controls"><Icon name="volume" /></button>}{onToggleSound && <button className="text-button firework-dock__play" onClick={onToggleSound} aria-pressed={soundEnabled} aria-label={soundEnabled ? t('common.sound.on') : t('common.enable.firework.sound')} title={soundEnabled ? t('common.mute.sound') : t('common.enable.firework.sound')}><Icon name={soundEnabled ? 'sound' : 'muted'} /></button>}<button className="text-button firework-dock__play" onClick={show.complete ? show.restart : show.toggle} aria-label={show.complete ? t('common.replay.5.minutes') : show.playing ? t('common.pause.auto.show') : t('common.resume.auto.show')} title={show.complete ? t('common.replay.5.minutes') : show.playing ? t('common.pause.auto.show') : t('common.resume.auto.show')}><Icon name={show.complete ? 'reset' : show.playing ? 'pause' : 'play'} /></button></div>
    </div>
    {onVolumeChange && volumeOpen && <div id="firework-volume-controls" className="volume-control" role="group" aria-label={t('common.firework.volume')}>
      <button className="volume-control__button" onClick={() => onVolumeChange(Math.max(0,volume-10))} disabled={volume === 0} aria-label={t('common.decrease.volume')} title={t('common.decrease.volume')}><Icon name="minus" /></button>
      <input className="volume-control__slider" type="range" min="0" max="100" step="1" value={volume} onChange={event => onVolumeChange(Number(event.target.value))} aria-label={t('common.firework.volume')} aria-valuetext={`${volume}%${soundEnabled ? '' : t('common.muted')}`} />
      <button className="volume-control__button" onClick={() => onVolumeChange(Math.min(100,volume+10))} disabled={volume === 100} aria-label={t('common.increase.volume')} title={t('common.increase.volume')}><Icon name="plus" /></button>
      <output className="volume-control__value" aria-hidden="true">{volume}%</output>
      {!soundEnabled && !mobile && <span className="volume-control__muted">{t('common.muted.2')}</span>}
    </div>}
    <div className="firework-dock__buttons">{fireworkTypes.map(type => <button key={type.id} className={`firework-button${lastType === type.id || type.id === 'text' && writing ? ' firework-button--selected' : ''}`} disabled={type.id !== 'text' && cooldown} onClick={() => type.id === 'text' ? setWriting(value => !value) : onShoot(type.id)} style={{ '--firework-color': type.color } as React.CSSProperties} aria-label={type.id === 'text' ? t('common.open.sky.writing') : t('fireworks.launchPreset', { name: type[lang] })} title={type[lang]} aria-expanded={type.id === 'text' ? writing : undefined}><Icon name={type.id} /></button>)}</div>
    <div className="firework-dock__presets">{textFireworkPresets.map(preset => <button key={preset.id} className="firework-button" disabled={cooldown || preparing} onClick={() => void submit(preset)} aria-label={t('fireworks.launchPreset', { name: preset.text })} title={preset.text}><Icon name={preset.icon} /></button>)}</div>
    {!writing && error && <p className="sky-writing__error" role="alert">{error}</p>}
    {writing && <form className="sky-writing" onSubmit={event => { event.preventDefault(); void submit(); }}>
      <label className="sky-writing__label" htmlFor="firework-text">{t('common.write.something.for.the.sky')}</label>
      <div className="sky-writing__row"><input ref={input} id="firework-text" className="sky-writing__input" value={text} maxLength={64} onChange={event => { setText(event.target.value); setError(''); }} aria-describedby="firework-text-help" aria-invalid={!validation.valid} placeholder={t('common.e.g.hello.2027')} autoComplete="off" onKeyDown={event => { if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault(); }} /><span className={`sky-writing__count${validation.count > MAX_TEXT_CHARACTERS ? ' sky-writing__count--invalid' : ''}`}>{validation.count}/{MAX_TEXT_CHARACTERS}</span><button className="button button--primary sky-writing__submit" disabled={!validation.valid || preparing || cooldown} type="submit" aria-label={preparing ? t('common.preparing') : t('common.launch.text')} aria-busy={preparing}><Icon name="text" /></button></div>
      <p id="firework-text-help" className="sky-writing__help">{validation.error === 'length' ? t('common.up.to.24.characters.including.spaces') : validation.error === 'characters' ? t('common.use.letters.numbers.spaces.or.and.apostrophes') : validation.error === 'empty' ? t('common.enter.at.least.one.letter.or.number') : t('common.up.to.24.characters.vietnamese.accents.supported')}</p>
      {error && <p className="sky-writing__error" role="alert">{error}</p>}
    </form>}
    <p className="sr-only" role={textActive ? 'status' : undefined}>{textActive ? t('common.sky.writing.one.shell.per.character.bursting') : cooldown ? t('common.a.moment.for.the.sky.to.sparkle') : t('common.tap.an.icon.to.add.your.own')}</p>
  </section>;
}


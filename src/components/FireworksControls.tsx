import { createPortal } from 'react-dom';
import { createTranslator } from '../i18n';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { Language } from '../hooks/useWishContent';
import { fireworkTypes } from '../lib/experience.mjs';
import { useMedia } from '../hooks/usePreferences';
import { MAX_TEXT_CHARACTERS, validateFireworkText } from '../lib/fireworkShow.mjs';
import { createPresetTextSalvo, createTextSalvo, textFireworkPresets, type TextSalvo } from '../lib/fireworkText';
import Icon from './Icons';
import FireworkProgress from './FireworkProgress';
import useSkyWriting from '../hooks/useSkyWriting';

type Show = { playing: boolean; remaining: number; elapsed?: number; complete: boolean; toggle: () => void; restart: () => void };
export default function FireworksControls({ lang, show, cooldown, lastType, onShoot, onText, textActive = false, draft }: {
  lang: Language; show: Show; cooldown: boolean; lastType: string;
  onShoot: (type: string) => boolean; onText: (text: string, salvo: TextSalvo) => boolean;
  textActive?: boolean;
  draft?: ReturnType<typeof useSkyWriting>;
}) {
  const t = createTranslator(lang);
  const mobile = useMedia('(max-width: 699px), (max-height: 550px) and (pointer: coarse)');
  const localDraft = useSkyWriting();
  const { writing, setWriting, text, setText } = draft ?? localDraft;
  const [collapsed, setCollapsed] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState('');
  const mounted = useRef(true), busy = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const validation = validateFireworkText(text);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (writing && !(mobile && collapsed)) input.current?.focus(); }, [writing, mobile, collapsed]);
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(timer);
  }, [error]);
  const submit = async (preset?: typeof textFireworkPresets[number]) => {
    if ((!preset && !validation.valid) || busy.current || cooldown) return;
    busy.current = true; setPreparing(true); setError('');
    try {
      const salvo = preset ? await createPresetTextSalvo(preset.id) : await createTextSalvo(validation.text);
      if (mounted.current) {
        if (onText(preset?.text ?? validation.text,salvo)) setWriting(false);
        else { setCollapsed(false); setError(t('common.the.sky.is.full.try.again.in')); }
      }
    } catch {
      if (mounted.current) { setCollapsed(false); setError(t('common.could.not.create.sky.writing.please.try')); }
    } finally { busy.current = false; if (mounted.current) setPreparing(false); }
  };
  return <section className={`firework-dock firework-dock--bottom${mobile ? ' firework-dock--mobile' : ''}${mobile && collapsed ? ' firework-dock--collapsed' : ''}${textActive ? ' firework-dock--text-active' : ''}`} aria-label={t('common.firework.controls')}>
    <FireworkProgress remaining={show.remaining} elapsed={show.elapsed} />
    <div className="firework-dock__show">
      <div className="firework-dock__status"><span className="sr-only">{show.complete ? t('common.the.show.has.finished') : show.playing ? t('common.auto.show.five.minutes') : t('common.auto.show.paused')}</span><time className="firework-dock__timer" aria-label={t('common.auto.show.time.remaining')}>{String(Math.floor(show.remaining/60)).padStart(2,'0')}:{String(show.remaining%60).padStart(2,'0')}</time></div>
      <div className="firework-dock__actions"><button className="text-button firework-dock__play" onClick={show.complete ? show.restart : show.toggle} aria-label={show.complete ? t('common.replay.5.minutes') : show.playing ? t('common.pause.auto.show') : t('common.resume.auto.show')} title={show.complete ? t('common.replay.5.minutes') : show.playing ? t('common.pause.auto.show') : t('common.resume.auto.show')}><Icon name={show.complete ? 'reset' : show.playing ? 'pause' : 'play'} /></button>{mobile && <button className="text-button firework-dock__play" onClick={() => setCollapsed(value => !value)} aria-expanded={!collapsed} aria-controls="firework-choices" aria-label={collapsed ? t('fireworks.expandControls') : t('fireworks.collapseControls')} title={collapsed ? t('fireworks.expandControls') : t('fireworks.collapseControls')}><Icon name={collapsed ? 'expand' : 'collapse'} /></button>}</div>
    </div>
    <div className="firework-dock__choices" id="firework-choices">
    <div className="firework-dock__buttons">{fireworkTypes.map(type => <Fragment key={type.id}>{type.id === 'text' && <div className="firework-dock__presets">{textFireworkPresets.map(preset => <button key={preset.id} className="firework-button" disabled={cooldown || preparing} onClick={() => void submit(preset)} aria-label={t('fireworks.launchPreset', { name: preset.text })} title={preset.text}><Icon name={preset.icon} /></button>)}</div>}<button className={`firework-button${lastType === type.id || type.id === 'text' && writing ? ' firework-button--selected' : ''}`} disabled={type.id !== 'text' && cooldown} onClick={() => { if (type.id === 'text') { setWriting(value => mobile && collapsed ? true : !value); if (mobile) setCollapsed(false); } else onShoot(type.id); }} style={{ '--firework-color': type.color } as React.CSSProperties} aria-label={type.id === 'text' ? t('common.open.sky.writing') : t('fireworks.launchPreset', { name: type[lang] })} title={type[lang]} aria-expanded={type.id === 'text' ? writing && !(mobile && collapsed) : undefined}><Icon name={type.id} /></button></Fragment>)}</div>

    </div>
    {error && createPortal(<p className="firework-dock__notice" role="alert">{error}</p>, document.body)}
    {writing && !(mobile && collapsed) && <form className="sky-writing" onSubmit={event => { event.preventDefault(); void submit(); }}>
      <label className="sky-writing__label" htmlFor="firework-text">{t('common.write.something.for.the.sky')}</label>
      <div className="sky-writing__row"><input ref={input} id="firework-text" className="sky-writing__input" value={text} maxLength={64} onChange={event => { setText(event.target.value); setError(''); }} aria-describedby="firework-text-help" aria-invalid={!validation.valid} placeholder={t('common.e.g.hello.2027')} autoComplete="off" onKeyDown={event => { if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault(); }} /><span className={`sky-writing__count${validation.count > MAX_TEXT_CHARACTERS ? ' sky-writing__count--invalid' : ''}`}>{validation.count}/{MAX_TEXT_CHARACTERS}</span><button className="button button--primary sky-writing__submit" disabled={!validation.valid || preparing || cooldown} type="submit" aria-label={preparing ? t('common.preparing') : t('common.launch.text')} aria-busy={preparing}><Icon name="text" /></button></div>
      <p id="firework-text-help" className="sky-writing__help">{validation.error === 'length' ? t('common.up.to.24.characters.including.spaces') : validation.error === 'characters' ? t('common.use.letters.numbers.spaces.or.and.apostrophes') : validation.error === 'empty' ? t('common.enter.at.least.one.letter.or.number') : t('common.up.to.24.characters.vietnamese.accents.supported')}</p>
    </form>}
    <p className="sr-only" role={textActive ? 'status' : undefined}>{textActive ? t('common.sky.writing.one.shell.per.character.bursting') : cooldown ? t('common.a.moment.for.the.sky.to.sparkle') : t('common.tap.an.icon.to.add.your.own')}</p>
  </section>;
}


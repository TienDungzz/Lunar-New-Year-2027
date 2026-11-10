import HeaderAudio from './components/HeaderAudio';
import SceneNavigation from './components/SceneNavigation';
import { createTranslator, normalizeLocale } from './i18n';
import { Component, lazy, Suspense, useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import Icon from './components/Icons';
import WishDialog from './components/WishDialog';
import FallbackScene from './components/FallbackScene';
import FireworksControls from './components/FireworksControls';
import useFireworkShow from './hooks/useFireworkShow';
import useWishContent, { type Language } from './hooks/useWishContent';
import { useMedia, useSeen } from './hooks/usePreferences';
import { fireworkTypes, flowReducer, getRemaining, initialFlow, readStorage, writeStorage, TET_MS } from './lib/experience.mjs';
import { playLaunch, resumeAudio, setAudioEnabled, setAudioVolume, stopFireworkAudio, suspendAudio } from './lib/audio';
import { DEFAULT_VOLUME, normalizeVolume } from './lib/audioPreferences.mjs';
import type { Launch } from './scenes/Fireworks';
import { createOpeningTextSalvo, createPresetTextSalvo, type TextSalvo } from './lib/fireworkText';
import { BURST_LIFETIME_MS, MAX_ACTIVE_BURSTS } from './lib/fireworkShow.mjs';
import { TEXT_EFFECT_LIFETIME_MS } from './lib/textSalvo.mjs';

const World = lazy(() => import('./scenes/World'));
function hasWebGL() {
  try { const canvas = document.createElement('canvas'), gl = canvas.getContext('webgl2'); if (!gl) return false; gl.getExtension('WEBGL_lose_context')?.loseContext(); return true; } catch { return false; }
}
class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.error ? null : this.props.children; }
}
export default function App() {
  const [lang, setLang] = useState<Language>(() => normalizeLocale(readStorage('tet-language', 'vi')));
  const vi = lang === 'vi', t = createTranslator(lang);
  const [flow, dispatch] = useReducer(flowReducer, initialFlow);
  const [now, setNow] = useState(Date.now());
  const [previewTarget, setPreviewTarget] = useState<number | null>(null);
  const [fallback, setFallback] = useState(() => !hasWebGL());
  const [sceneKey, setSceneKey] = useState(0);
  const [sound, setSound] = useState(false);
  const [volume, setVolume] = useState(() => normalizeVolume(readStorage('tet-sound-volume',DEFAULT_VOLUME)));
  const soundRequest = useRef(0);
  const [visible, setVisible] = useState(!document.hidden);
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [reset, setReset] = useState(0);
  const [listOpen, setListOpen] = useState(false);
  const [lastType, setLastType] = useState('goat');
  const openingText = useRef<TextSalvo | null>(null);
  useEffect(() => {
    let cancelled = false;
    void createPresetTextSalvo('new-year').then(salvo => { if (!cancelled) openingText.current = salvo; }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const content = useWishContent();
  const { seen, mark } = useSeen(content.namespace);
  const nextLaunch = useRef(0), launchHistory = useRef<{ at: number; automatic: boolean; text: boolean }[]>([]), lastManual = useRef(-Infinity), cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phase = flow.phase, tree = phase === 'TREE_EXPLORE', fireworks = phase === 'FIREWORKS', transition = phase.endsWith('TRANSITION');
  const remaining = getRemaining(now), preview = previewTarget !== null && !remaining.done;
  const display = preview ? getRemaining(now, previewTarget) : remaining;
  const showFireworksEntry = remaining.done || new URLSearchParams(window.location.search).get('mode') === 'preview';
  const preparingSky = phase === 'COUNTDOWN' && !display.done && !display.days && !display.hours && !display.minutes && display.seconds <= 3;
  const visualPhase = preparingSky ? 'COUNTDOWN_PREPARE' : phase;
  const ready = useCallback(() => dispatch({ type: 'READY' }), []);
  const finishTransition = useCallback(() => dispatch({ type: 'TRANSITION_DONE' }), []);
  const sceneError = useCallback(() => { setFallback(true); dispatch({ type: 'READY' }); }, []);
  useEffect(() => {
    if (phase !== 'COUNTDOWN' || !visible) return;
    const target = previewTarget ?? TET_MS;
    const timers = [target-3000,target].filter(at => at > Date.now() && at-Date.now() < 2147483647)
      .map(at => setTimeout(() => setNow(Date.now()),at-Date.now()));
    return () => timers.forEach(clearTimeout);
  }, [phase, visible, previewTarget]);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 250);
    const visibility = () => {
      tick(); setVisible(!document.hidden);
      if (document.hidden) {
        suspendAudio(); setLaunch(null); launchHistory.current = []; lastManual.current = -Infinity;
        if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
        setCooldown(false);
      } else resumeAudio();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => { writeStorage('tet-language', lang); document.documentElement.lang = lang; document.title = t('meta.title'); document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description')); }, [lang]);
  useEffect(() => { setSelected(null); }, [content.namespace]);
  useEffect(() => { setAudioVolume(volume); writeStorage('tet-sound-volume',volume); }, [volume]);
  useEffect(() => {
    if (phase !== 'LOADING') return;
    if (fallback) { ready(); return; }
    const timer = setTimeout(sceneError, 20000); return () => clearTimeout(timer);
  }, [phase, fallback, ready, sceneError]);
  useEffect(() => {
    if (phase !== 'COUNTDOWN' || !visible) return;
    if ((preview && display.done) || (remaining.done && previewTarget)) dispatch({ type: 'MIDNIGHT' });
  }, [display.done, remaining.done, preview, previewTarget, phase, visible]);
  // A real midnight crossing reveals once. Opening the site after midnight waits for a gesture.
  const openedBeforeMidnight = useRef(!getRemaining().done);
  useEffect(() => { if (remaining.done && openedBeforeMidnight.current && visible && phase === 'COUNTDOWN') dispatch({ type: 'MIDNIGHT' }); }, [remaining.done, visible, phase]);
  useEffect(() => {
    if (!flow.revealing) return;
    const timer = setTimeout(() => dispatch({ type: 'REVEAL_DONE' }), reduced ? 150 : 1800); return () => clearTimeout(timer);
  }, [flow.revealing, reduced]);
  useEffect(() => {
    setLaunch(null); launchHistory.current = []; lastManual.current = -Infinity;
    stopFireworkAudio();
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    setCooldown(false);
    if (phase !== 'TREE_EXPLORE') setSelected(null);
  }, [phase]);
  useEffect(() => () => { if (cooldownTimer.current) clearTimeout(cooldownTimer.current); }, []);
  useEffect(() => {
    if (!fallback || !transition) return;
    const timer = setTimeout(finishTransition, reduced ? 50 : 600); return () => clearTimeout(timer);
  }, [fallback, transition, finishTransition, reduced]);
  const shoot = useCallback((type: string, automated = false, extra: Omit<Launch, 'id' | 'type'> = {}) => {
    if (document.hidden || !visible || !fireworks || !(type === 'opening' || fireworkTypes.some(preset => preset.id === type))) return false;
    if (type === 'text' && (!extra.points?.length || !extra.glyphs?.length)) return false;
    const time = performance.now();
    launchHistory.current = launchHistory.current.filter(entry => time-entry.at < (entry.text ? TEXT_EFFECT_LIFETIME_MS : BURST_LIFETIME_MS));
    // Automatic shots reserve two slots for the visitor, and never lock the UI.
    if (launchHistory.current.length >= (automated ? MAX_ACTIVE_BURSTS-2 : MAX_ACTIVE_BURSTS)) return false;
    if (!automated && time-lastManual.current < 380) return false;
    if (type === 'text' && launchHistory.current.some(entry => entry.text)) return false;
    launchHistory.current.push({ at: time, automatic: automated, text: type === 'text' || type === 'opening' });
    const id = ++nextLaunch.current;
    setLaunch({ id, type, ...extra }); playLaunch(type,id*37,reduced,extra.glyphs);
    if (!automated) {
      lastManual.current = time; setLastType(type); setCooldown(true);
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
      const wait = launchHistory.current.length >= MAX_ACTIVE_BURSTS ? Math.min(...launchHistory.current.map(entry => (entry.text ? TEXT_EFFECT_LIFETIME_MS : BURST_LIFETIME_MS)-(time-entry.at)))+50 : 400;
      cooldownTimer.current = setTimeout(() => { setCooldown(false); }, wait);
    }
    return true;
  }, [visible, fireworks, reduced]);
  const automaticShot = useCallback((type: string, strength: number) => {
    if (type === 'opening') {
      try {
        const salvo = openingText.current ?? createOpeningTextSalvo();
        shoot(type,true,{ strength, text: 'Chúc mừng năm mới', ...salvo });
      } catch { shoot('goat',true,{ strength }); }
    } else shoot(type, true, { strength });
  }, [shoot]);
  const show = useFireworkShow({ active: fireworks, visible, reduced, onLaunch: automaticShot });
  const openWish = (index: number) => { if (phase !== 'TREE_EXPLORE' || content.loading) return; mark(content.wishes[index].id); setSelected(index); };
  const startPreview = () => { setPreviewTarget(Date.now()+10000); dispatch({ type: 'PREVIEW' }); try { sessionStorage.setItem('tet-preview-played', 'true'); } catch {} };
  const updateSound = async (enabled: boolean) => {
    const request = ++soundRequest.current;
    setSound(enabled); writeStorage('tet-sound-enabled',enabled);
    try { await setAudioEnabled(enabled); }
    catch { if (request === soundRequest.current) { setSound(false); writeStorage('tet-sound-enabled',false); } }
  };
  const changeVolume = (value: number) => {
    const next = normalizeVolume(value);
    setVolume(next); setAudioVolume(next);
    void updateSound(next > 0);
  };
  const retryScene = async () => {
    if (!hasWebGL()) return;
    try {
      const { clearWorldCache } = await import('./scenes/World');
      clearWorldCache(); setSceneKey(k => k+1); setFallback(false);
    } catch { setFallback(true); }
  };
  return <main className={`experience experience--${tree ? 'tree' : fireworks ? 'fireworks' : 'home'}${phase === 'COUNTDOWN' ? ' experience--countdown' : ''}${preparingSky ? ' experience--preparing-sky' : ''}`}>
    <div className="world" aria-hidden="true">
      {fallback ? <FallbackScene phase={visualPhase} launch={launch} reduced={reduced} visible={visible} /> : <SceneBoundary key={sceneKey} onError={sceneError}><Suspense fallback={null}><World phase={visualPhase} reduced={reduced} seen={seen} launch={launch} onOpen={openWish} onReady={ready} onTransition={finishTransition} onError={sceneError} modalOpen={selected !== null || content.loading} reset={reset} visible={visible} /></Suspense></SceneBoundary>}
    </div>
    <div className="experience__vignette" />
    <header className="header">
      <a className="brand" href="/" aria-label="Xuân An Yên"><img className="brand__logo" src="/images/tet-2027-logo.png" width="76" height="76" alt="" /><span className="brand__name">Xuân An Yên<span className="brand__sub">TẾT ĐINH MÙI · 2027</span></span></a>
      <div className="header__actions">
        <HeaderAudio lang={lang} enabled={sound} volume={volume} onVolumeChange={changeVolume} />
        <div className="language" aria-label={t('common.language')}><button className={`language__button${vi ? ' language__button--active' : ''}`} aria-pressed={vi} onClick={() => setLang('vi')}>VI</button><span className="language__divider">/</span><button className={`language__button${!vi ? ' language__button--active' : ''}`} aria-pressed={!vi} onClick={() => setLang('en')}>EN</button></div>
      </div>
    </header>
    {phase === 'LOADING' && <div className="loading" role="status"><Icon name="flower" /><p>{t('common.lighting.the.lanterns')}</p><span>{t('common.a.little.home.a.peaceful.new.year')}</span></div>}
    {phase === 'COUNTDOWN' && <section className="welcome">
      <p className="eyebrow"><span className="eyebrow__line" />{t('common.a.new.year.a.way.home')}</p>
      <h1 className="welcome__title">{t('common.a.little')}<br /><em>{t('common.peace.a.new.beginning')}</em></h1>
      <p className="welcome__description">{t('common.leave.the.rush.behind.welcome.the.new')}</p>
      <div className="countdown">
        <p className="countdown__label">{preview ? t('common.new.year.preview') : remaining.done ? t('common.happy.lunar.new.year') : t('common.counting.down.to.new.beginnings')}</p>
        {remaining.done ? <p className="countdown__newyear">Xuân Đinh Mùi 2027</p> : <div className="countdown__digits" aria-label={`${display.days} ${t('common.days')}, ${display.hours} ${t('common.hours')}, ${display.minutes} ${t('common.minutes')}, ${display.seconds} ${t('common.seconds')}`}>
          {[['days', t('common.days.2')], ['hours', t('common.hours.2')], ['minutes', t('common.mins')], ['seconds', t('common.secs')]].map(([key, label], i) => <div className="countdown__unit" key={key}><span className="countdown__value">{String(display[key as keyof typeof display]).padStart(2, '0')}</span><span className="countdown__caption">{label}</span>{i<3 && <span className="countdown__separator">:</span>}</div>)}
        </div>}
        <p className="countdown__date">06.02.2027 <span>·</span> 00:00 <span>·</span> {t('common.vietnam.time')}</p>
      </div>
      {showFireworksEntry && <button className="button button--primary welcome__cta" disabled={preview} onClick={remaining.done ? () => dispatch({ type: 'OPEN_FIREWORKS' }) : startPreview}><Icon name="burst" />{preview ? t('common.the.moment.is.coming') : remaining.done ? t('common.light.up.the.sky') : t('common.preview.new.year.s.eve')}<Icon name="arrow" /></button>}
      {showFireworksEntry && <p className="welcome__note">{t('common.you.don.t.have.to.wait.for')}</p>}
    </section>}
    {flow.revealing && <section className="reveal" role="status"><p className="eyebrow">XUÂN ĐINH MÙI · 2027</p><h1 aria-label={t('common.happy.lunar.new.year.2')}>{t('common.happy')}<br /><em>{t('common.lunar.new.year')}</em></h1><p>{t('common.may.good.things.blossom')}</p></section>}
    {(fireworks || tree || transition) && <>
      <section className="chapter">
        <SceneNavigation lang={lang} active={tree || phase === 'TREE_TRANSITION' ? 'wishes' : 'fireworks'} transitioning={transition} onNavigate={destination => { setSelected(null); dispatch({ type: destination === 'wishes' ? 'OPEN_TREE' : 'OPEN_FIREWORKS' }); }} />
        <h1 className="chapter__title">{tree || phase === 'TREE_TRANSITION' ? t('common.the.spring.wishes.tree') : t('common.the.sky.is.yours')}</h1>
        <p className="chapter__description">{tree || phase === 'TREE_TRANSITION' ? t('common.touch.an.ornament.unfold.a.little.spring') : t('common.a.five.minute.show.add.shapes.write')}</p>
      </section>
      {fireworks && <FireworksControls lang={lang} show={show} cooldown={cooldown} lastType={lastType} onShoot={type => shoot(type)} onText={(text, salvo) => shoot('text', false, { text, points: salvo.points, glyphs: salvo.glyphs })} />}
      {tree && <section className={`tree-panel${listOpen || fallback ? ' tree-panel--expanded' : ''}`}>
        <div className="tree-panel__heading"><Icon name="flower" /><span>{seen.length}/{content.wishes.length} {t('common.wishes.opened')}</span><button className="text-button" onClick={() => setListOpen(!listOpen)} aria-expanded={listOpen || fallback}>{listOpen ? t('common.collapse') : t('common.all.wishes')} {listOpen ? '−' : '+'}</button></div>
        {content.loading && <p className="tree-panel__message" role="status">{t('common.preparing.wishes')}</p>}
        {content.error && <p className="tree-panel__message">{t('common.showing.the.original.wishes')} <button className="text-button" onClick={content.retry}>{t('common.retry')}</button></p>}
        {(listOpen || fallback) && <div className="wish-list">{content.wishes.map((wish, i) => <button key={wish.id} className={`wish-list__button${seen.includes(wish.id) ? ' wish-list__button--seen' : ''}`} disabled={content.loading} onClick={() => openWish(i)}><span>{String(i+1).padStart(2,'0')}</span>{wish.title[lang]}{seen.includes(wish.id) && <Icon name="check" />}</button>)}</div>}
        <div className="tree-panel__tools"><span>{seen.length === content.wishes.length ? t('common.eight.wishes.carried.into.a.new.year') : t('common.drag.to.turn.tap.an.ornament.to')}</span><button className="icon-button" onClick={() => setReset(r => r+1)} aria-label={t('common.reset.view')}><Icon name="compass" /></button></div>
      </section>}
    </>}
    {phase !== 'LOADING' && <footer className="footer"><span>{t('common.a.little.home.a.peaceful.new.year.2')}</span><span><Icon name="moon" />{t('common.a.vietnamese.spring.night')}</span></footer>}
    {fallback && <aside className="fallback-notice">{t('common.2d.scene.mode')}<button className="text-button" onClick={() => void retryScene()}>{t('common.retry.3d')}</button></aside>}
    {selected !== null && tree && !content.loading && <WishDialog wish={content.wishes[selected]} index={selected} total={content.wishes.length} lang={lang} onClose={() => setSelected(null)} onChange={openWish} />}
    <div className="sr-only" aria-live="polite">{transition ? t('common.changing.scene') : launch?.text ? `${t('common.sky.writing')} ${launch.text}` : ''}</div>
  </main>;
}

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
  const [lang, setLang] = useState<Language>(() => readStorage('tet-language', 'vi') === 'en' ? 'en' : 'vi');
  const vi = lang === 'vi', t = (a: string, b: string) => vi ? a : b;
  const [flow, dispatch] = useReducer(flowReducer, initialFlow);
  const [now, setNow] = useState(Date.now());
  const [previewTarget, setPreviewTarget] = useState<number | null>(null);
  const [fallback, setFallback] = useState(() => !hasWebGL());
  const [sceneKey, setSceneKey] = useState(0);
  const [sound, setSound] = useState(false);
  const [volume, setVolume] = useState(() => normalizeVolume(readStorage('tet-sound-volume',DEFAULT_VOLUME)));
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
  useEffect(() => { writeStorage('tet-language', lang); document.documentElement.lang = lang; document.title = t('Xuân An Yên — Tết Đinh Mùi 2027', 'Xuân An Yên — Lunar New Year 2027'); document.querySelector('meta[name="description"]')?.setAttribute('content', t('Tự tay thắp sáng bầu trời và hái lời chúc đầu xuân Đinh Mùi 2027.', 'Light up the sky and discover eight spring wishes for Lunar New Year 2027.')); }, [lang]);
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
    launchHistory.current = launchHistory.current.filter(entry => time-entry.at < BURST_LIFETIME_MS);
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
      const wait = launchHistory.current.length >= MAX_ACTIVE_BURSTS ? BURST_LIFETIME_MS+50-(time-launchHistory.current[0].at) : 400;
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
  const toggleSound = async () => {
    try { await setAudioEnabled(!sound); setSound(!sound); writeStorage('tet-sound-enabled', !sound); } catch { setSound(false); }
  };
  const retryScene = async () => {
    if (!hasWebGL()) return;
    try {
      const { clearWorldCache } = await import('./scenes/World');
      clearWorldCache(); setSceneKey(k => k+1); setFallback(false);
    } catch { setFallback(true); }
  };
  return <main className={`experience experience--${tree ? 'tree' : fireworks ? 'fireworks' : 'home'}`}>
    <div className="world" aria-hidden="true">
      {fallback ? <FallbackScene phase={visualPhase} launch={launch} reduced={reduced} visible={visible} /> : <SceneBoundary key={sceneKey} onError={sceneError}><Suspense fallback={null}><World phase={visualPhase} reduced={reduced} seen={seen} launch={launch} onOpen={openWish} onReady={ready} onTransition={finishTransition} onError={sceneError} modalOpen={selected !== null || content.loading} reset={reset} visible={visible} /></Suspense></SceneBoundary>}
    </div>
    <div className="experience__vignette" />
    <header className="header">
      <a className="brand" href="/" aria-label="Xuân An Yên"><img className="brand__logo" src="/images/tet-2027-logo.png" width="76" height="76" alt="" /><span className="brand__name">Xuân An Yên<span className="brand__sub">TẾT ĐINH MÙI · 2027</span></span></a>
      <div className="header__actions">
        <button className="icon-button header__sound" onClick={() => void toggleSound()} aria-label={sound ? t('Tắt âm thanh', 'Mute sound') : t('Bật âm thanh', 'Enable sound')} aria-pressed={sound}><Icon name={sound ? 'sound' : 'muted'} /><span>{sound ? t('Âm thanh bật', 'Sound on') : t('Âm thanh tắt', 'Sound off')}</span></button>
        <div className="language" aria-label={t('Ngôn ngữ', 'Language')}><button className={`language__button${vi ? ' language__button--active' : ''}`} aria-pressed={vi} onClick={() => setLang('vi')}>VI</button><span className="language__divider">/</span><button className={`language__button${!vi ? ' language__button--active' : ''}`} aria-pressed={!vi} onClick={() => setLang('en')}>EN</button></div>
      </div>
    </header>
    {phase === 'LOADING' && <div className="loading" role="status"><Icon name="flower" /><p>{t('Đang thắp đèn đón xuân…', 'Lighting the lanterns…')}</p><span>{t('Một góc nhà, một mùa an yên.', 'A little home. A peaceful new year.')}</span></div>}
    {phase === 'COUNTDOWN' && <section className="welcome">
      <p className="eyebrow"><span className="eyebrow__line" />{t('XUÂN VỀ, MÌNH VỀ NHÀ', 'A NEW YEAR. A WAY HOME.')}</p>
      <h1 className="welcome__title">{t('Chạm vào', 'A little')}<br /><em>{t('một mùa an yên.', 'peace, a new beginning.')}</em></h1>
      <p className="welcome__description">{t('Gác lại những bộn bề. Cùng đón khoảnh khắc giao thừa, thắp sáng bầu trời và gửi nhau những điều tốt đẹp.', 'Leave the rush behind. Welcome the new year, light up the sky, and share a little kindness.')}</p>
      <div className="countdown">
        <p className="countdown__label">{preview ? t('XEM TRƯỚC GIAO THỪA', 'NEW YEAR PREVIEW') : remaining.done ? t('CHÚC MỪNG NĂM MỚI', 'HAPPY LUNAR NEW YEAR') : t('CÙNG ĐẾM NGƯỢC ĐẾN GIAO THỪA', 'COUNTING DOWN TO NEW BEGINNINGS')}</p>
        {remaining.done ? <p className="countdown__newyear">Xuân Đinh Mùi 2027</p> : <div className="countdown__digits" aria-label={`${display.days} ${t('ngày', 'days')}, ${display.hours} ${t('giờ', 'hours')}, ${display.minutes} ${t('phút', 'minutes')}, ${display.seconds} ${t('giây', 'seconds')}`}>
          {[['days', t('NGÀY','DAYS')], ['hours', t('GIỜ','HOURS')], ['minutes', t('PHÚT','MINS')], ['seconds', t('GIÂY','SECS')]].map(([key, label], i) => <div className="countdown__unit" key={key}><span className="countdown__value">{String(display[key as keyof typeof display]).padStart(2, '0')}</span><span className="countdown__caption">{label}</span>{i<3 && <span className="countdown__separator">:</span>}</div>)}
        </div>}
        <p className="countdown__date">06.02.2027 <span>·</span> 00:00 <span>·</span> {t('GIỜ VIỆT NAM', 'VIETNAM TIME')}</p>
      </div>
      {showFireworksEntry && <button className="button button--primary welcome__cta" disabled={preview} onClick={remaining.done ? () => dispatch({ type: 'OPEN_FIREWORKS' }) : startPreview}><Icon name="burst" />{preview ? t('Khoảnh khắc đang đến…', 'The moment is coming…') : remaining.done ? t('Thắp sáng bầu trời', 'Light up the sky') : t('Xem trước giao thừa', 'Preview New Year’s Eve')}<Icon name="arrow" /></button>}
      {showFireworksEntry && <p className="welcome__note">{t('Không cần chờ đến Tết để cảm nhận mùa xuân.', 'You don’t have to wait for spring to feel it.')}</p>}
    </section>}
    {flow.revealing && <section className="reveal" role="status"><p className="eyebrow">XUÂN ĐINH MÙI · 2027</p><h1 aria-label={t('Chúc Mừng Năm Mới', 'Happy Lunar New Year')}>{t('Chúc Mừng', 'Happy')}<br /><em>{t('Năm Mới', 'Lunar New Year')}</em></h1><p>{t('Mong mọi điều tốt đẹp sẽ nở hoa.', 'May good things blossom.')}</p></section>}
    {(fireworks || tree || transition) && <>
      <section className="chapter">
        <p className="eyebrow">{tree || phase === 'TREE_TRANSITION' ? t('02 / GỬI NHAU ĐIỀU TỐT ĐẸP','02 / A LITTLE KINDNESS') : t('01 / THẮP SÁNG KHOẢNH KHẮC','01 / LIGHT UP THE MOMENT')}</p>
        <h1 className="chapter__title">{tree || phase === 'TREE_TRANSITION' ? t('Cây Lộc Đầu Xuân', 'The Spring Wishes Tree') : t('Bầu trời là của bạn.', 'The sky is yours.')}</h1>
        <p className="chapter__description">{tree || phase === 'TREE_TRANSITION' ? t('Chạm vào vật treo, mở một lời chúc an lành.', 'Touch an ornament. Unfold a little spring blessing.') : t('Màn diễn 5 phút. Thêm hình, viết chữ, thắp sáng bầu trời theo cách của bạn.', 'A five-minute show. Add shapes, write in sparks, and make this sky your own.')}</p>
      </section>
      {fireworks && <FireworksControls lang={lang} show={show} cooldown={cooldown} lastType={lastType} soundEnabled={sound} volume={volume} onVolumeChange={value => setVolume(normalizeVolume(value))} onToggleSound={() => void toggleSound()} onShoot={type => shoot(type)} onText={(text, salvo) => shoot('text', false, { text, points: salvo.points, glyphs: salvo.glyphs })} />}
      {tree && <section className={`tree-panel${listOpen || fallback ? ' tree-panel--expanded' : ''}`}>
        <div className="tree-panel__heading"><Icon name="flower" /><span>{seen.length}/{content.wishes.length} {t('LỜI CHÚC ĐÃ MỞ', 'WISHES OPENED')}</span><button className="text-button" onClick={() => setListOpen(!listOpen)} aria-expanded={listOpen || fallback}>{listOpen ? t('Thu gọn', 'Collapse') : t('Danh sách lời chúc', 'All wishes')} {listOpen ? '−' : '+'}</button></div>
        {content.loading && <p className="tree-panel__message" role="status">{t('Đang chuẩn bị lời chúc…', 'Preparing wishes…')}</p>}
        {content.error && <p className="tree-panel__message">{t('Đang dùng lời chúc có sẵn.', 'Showing the original wishes.')} <button className="text-button" onClick={content.retry}>{t('Thử lại', 'Retry')}</button></p>}
        {(listOpen || fallback) && <div className="wish-list">{content.wishes.map((wish, i) => <button key={wish.id} className={`wish-list__button${seen.includes(wish.id) ? ' wish-list__button--seen' : ''}`} disabled={content.loading} onClick={() => openWish(i)}><span>{String(i+1).padStart(2,'0')}</span>{wish.title[lang]}{seen.includes(wish.id) && <Icon name="check" />}</button>)}</div>}
        <div className="tree-panel__tools"><span>{seen.length === content.wishes.length ? t('Bạn đã mang về đủ 8 lời chúc đầu xuân.', 'Eight wishes, carried into a new year.') : t('Kéo để xoay cây · Chạm vật treo để đọc', 'Drag to turn · Tap an ornament to read')}</span><button className="icon-button" onClick={() => setReset(r => r+1)} aria-label={t('Đặt lại góc nhìn', 'Reset view')}><Icon name="reset" /></button></div>
      </section>}
      <nav className="scene-nav" aria-label={t('Chuyển cảnh', 'Scene navigation')}><span className="scene-nav__step">{tree ? '02' : '01'}<span> / 02</span></span><button className="button button--outline" disabled={transition} onClick={() => { setSelected(null); dispatch({ type: tree ? 'OPEN_FIREWORKS' : 'OPEN_TREE' }); }}><span className={fireworks ? 'sr-only' : undefined}>{transition ? t('Đang chuyển cảnh…', 'Moving into the scene…') : tree ? t('Quay lại pháo hoa', 'Back to fireworks') : t('Khám phá cây mai', 'Explore the wishes tree')}</span><Icon name={tree ? 'burst' : 'arrow'} /></button></nav>
    </>}
    {phase !== 'LOADING' && <footer className="footer"><span>{t('MỘT GÓC NHÀ. MỘT MÙA AN YÊN.', 'A LITTLE HOME. A PEACEFUL NEW YEAR.')}</span><span><Icon name="moon" />{t('ĐÊM XUÂN VIỆT NAM', 'A VIETNAMESE SPRING NIGHT')}</span></footer>}
    {fallback && <aside className="fallback-notice">{t('Chế độ cảnh 2D', '2D scene mode')}<button className="text-button" onClick={() => void retryScene()}>{t('Thử lại 3D', 'Retry 3D')}</button></aside>}
    {selected !== null && tree && !content.loading && <WishDialog wish={content.wishes[selected]} index={selected} total={content.wishes.length} lang={lang} onClose={() => setSelected(null)} onChange={openWish} />}
    <div className="sr-only" aria-live="polite">{transition ? t('Đang chuyển cảnh', 'Changing scene') : launch?.text ? `${t('Pháo chữ:', 'Sky writing:')} ${launch.text}` : ''}</div>
  </main>;
}

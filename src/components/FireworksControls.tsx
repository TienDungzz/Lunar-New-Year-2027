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
  const vi = lang === 'vi', t = (a: string, b: string) => vi ? a : b;
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
        else setError(t('Bầu trời đang đầy, thử lại sau một chút.', 'The sky is full. Try again in a moment.'));
      }
    } catch {
      if (mounted.current) setError(t('Chưa tạo được pháo chữ. Vui lòng thử lại.', 'Could not create sky writing. Please try again.'));
    } finally { busy.current = false; if (mounted.current) setPreparing(false); }
  };
  return <section className={`firework-dock firework-dock--${effectivePosition}${mobile ? ' firework-dock--mobile' : ''}${textActive ? ' firework-dock--text-active' : ''}`} aria-label={t('Điều khiển pháo hoa', 'Firework controls')}>
    {!mobile && <div className="dock-position" role="group" aria-label={t('Vị trí bảng pháo hoa','Firework panel position')}>
      <span className="sr-only">{t('VỊ TRÍ BẢNG','PANEL POSITION')}</span>
      {(['bottom','left','right'] as const).map(value => {
        const label = value === 'bottom' ? t('Đặt bảng phía dưới','Dock panel at bottom') : value === 'left' ? t('Đặt bảng bên trái','Dock panel on left') : t('Đặt bảng bên phải','Dock panel on right');
        return <button key={value} className="dock-position__button" aria-label={label} title={label} aria-pressed={position === value} onClick={() => setPosition(value)}><Icon name={`dock-${value}`} /></button>;
      })}
    </div>}
    <div className="firework-dock__show">
      <div className="firework-dock__status"><span className="live-dot" /><span className="sr-only">{show.complete ? t('MÀN DIỄN ĐÃ KẾT THÚC', 'THE SHOW HAS FINISHED') : show.playing ? t('TỰ BẮN · MÀN DIỄN 5 PHÚT', 'AUTO SHOW · FIVE MINUTES') : t('ĐÃ TẠM DỪNG TỰ BẮN', 'AUTO SHOW PAUSED')}</span><time className="firework-dock__timer" aria-label={t('Thời gian tự bắn còn lại', 'Auto show time remaining')}>{String(Math.floor(show.remaining/60)).padStart(2,'0')}:{String(show.remaining%60).padStart(2,'0')}</time></div>
      <div className="firework-dock__actions">{onVolumeChange && <button className="text-button firework-dock__play" onClick={() => setVolumeOpen(value => !value)} aria-label={t('Điều chỉnh âm lượng','Adjust volume')} title={`${t('Âm lượng','Volume')}: ${volume}%`} aria-expanded={volumeOpen} aria-controls="firework-volume-controls"><Icon name="volume" /></button>}{onToggleSound && <button className="text-button firework-dock__play" onClick={onToggleSound} aria-pressed={soundEnabled} aria-label={soundEnabled ? t('Âm thanh bật', 'Sound on') : t('Bật âm thanh pháo hoa', 'Enable firework sound')} title={soundEnabled ? t('Tắt âm thanh','Mute sound') : t('Bật âm thanh pháo hoa','Enable firework sound')}><Icon name={soundEnabled ? 'sound' : 'muted'} /></button>}<button className="text-button firework-dock__play" onClick={show.complete ? show.restart : show.toggle} aria-label={show.complete ? t('Phát lại 5 phút', 'Replay 5 minutes') : show.playing ? t('Tạm dừng tự bắn', 'Pause auto show') : t('Tiếp tục tự bắn', 'Resume auto show')} title={show.complete ? t('Phát lại 5 phút','Replay 5 minutes') : show.playing ? t('Tạm dừng tự bắn','Pause auto show') : t('Tiếp tục tự bắn','Resume auto show')}><Icon name={show.complete ? 'reset' : show.playing ? 'pause' : 'play'} /></button></div>
    </div>
    {onVolumeChange && volumeOpen && <div id="firework-volume-controls" className="volume-control" role="group" aria-label={t('Âm lượng pháo hoa','Firework volume')}>
      <button className="volume-control__button" onClick={() => onVolumeChange(Math.max(0,volume-10))} disabled={volume === 0} aria-label={t('Giảm âm lượng','Decrease volume')} title={t('Giảm âm lượng','Decrease volume')}><Icon name="minus" /></button>
      <input className="volume-control__slider" type="range" min="0" max="100" step="1" value={volume} onChange={event => onVolumeChange(Number(event.target.value))} aria-label={t('Âm lượng pháo hoa','Firework volume')} aria-valuetext={`${volume}%${soundEnabled ? '' : t(' · đang tắt tiếng',' · muted')}`} />
      <button className="volume-control__button" onClick={() => onVolumeChange(Math.min(100,volume+10))} disabled={volume === 100} aria-label={t('Tăng âm lượng','Increase volume')} title={t('Tăng âm lượng','Increase volume')}><Icon name="plus" /></button>
      <output className="volume-control__value" aria-hidden="true">{volume}%</output>
      {!soundEnabled && !mobile && <span className="volume-control__muted">{t('Đang tắt tiếng','Muted')}</span>}
    </div>}
    <div className="firework-dock__buttons">{fireworkTypes.map(type => <button key={type.id} className={`firework-button${lastType === type.id || type.id === 'text' && writing ? ' firework-button--selected' : ''}`} disabled={type.id !== 'text' && cooldown} onClick={() => type.id === 'text' ? setWriting(value => !value) : onShoot(type.id)} style={{ '--firework-color': type.color } as React.CSSProperties} aria-label={type.id === 'text' ? t('Mở pháo hoa chữ', 'Open sky writing') : t('Bắn ', 'Launch ') + type[lang]} title={type[lang]} aria-expanded={type.id === 'text' ? writing : undefined}><Icon name={type.id} /></button>)}</div>
    <div className="firework-dock__presets">{textFireworkPresets.map(preset => <button key={preset.id} className="firework-button" disabled={cooldown || preparing} onClick={() => void submit(preset)} aria-label={t('Bắn ', 'Launch ') + preset.text} title={preset.text}><Icon name={preset.icon} /></button>)}</div>
    {!writing && error && <p className="sky-writing__error" role="alert">{error}</p>}
    {writing && <form className="sky-writing" onSubmit={event => { event.preventDefault(); void submit(); }}>
      <label className="sky-writing__label" htmlFor="firework-text">{t('Viết điều bạn muốn gửi lên trời', 'Write something for the sky')}</label>
      <div className="sky-writing__row"><input ref={input} id="firework-text" className="sky-writing__input" value={text} maxLength={64} onChange={event => { setText(event.target.value); setError(''); }} aria-describedby="firework-text-help" aria-invalid={!validation.valid} placeholder={t('VD: XUÂN AN YÊN', 'E.g. HELLO 2027')} autoComplete="off" onKeyDown={event => { if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault(); }} /><span className={`sky-writing__count${validation.count > MAX_TEXT_CHARACTERS ? ' sky-writing__count--invalid' : ''}`}>{validation.count}/{MAX_TEXT_CHARACTERS}</span><button className="button button--primary sky-writing__submit" disabled={!validation.valid || preparing || cooldown} type="submit" aria-label={preparing ? t('Đang tạo…','Preparing…') : t('Bắn chữ','Launch text')} aria-busy={preparing}><Icon name="text" /></button></div>
      <p id="firework-text-help" className="sky-writing__help">{validation.error === 'length' ? t('Tối đa 12 ký tự, tính cả khoảng trắng.', 'Up to 12 characters, including spaces.') : validation.error === 'characters' ? t('Dùng chữ, số, khoảng trắng hoặc ! ? . & + - và dấu nháy.', 'Use letters, numbers, spaces or ! ? . & + - and apostrophes.') : validation.error === 'empty' ? t('Nhập ít nhất một chữ hoặc số.', 'Enter at least one letter or number.') : t('Tối đa 12 ký tự · Hỗ trợ dấu tiếng Việt · Chữ được vẽ bằng hạt sáng.', 'Up to 12 characters · Vietnamese accents supported · Drawn with sparks.')}</p>
      {error && <p className="sky-writing__error" role="alert">{error}</p>}
    </form>}
    <p className="sr-only" role={textActive ? 'status' : undefined}>{textActive ? t('Đang trình diễn pháo chữ · Mỗi quả một ký tự, cùng nổ giữa bầu trời.', 'Sky writing · One shell per character, bursting together at center stage.') : cooldown ? t('Chờ một nhịp để bầu trời kịp rực rỡ…', 'A moment for the sky to sparkle…') : t('Chạm icon để bắn thêm · Bạn vẫn tự bắn được khi màn diễn đang chạy.', 'Tap an icon to add your own fireworks, even during the auto show.')}</p>
  </section>;
}


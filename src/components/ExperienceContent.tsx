import type { Experience } from '../hooks/useExperience';
import HeaderAudio from './HeaderAudio';
import Icon from './Icons';

export function ExperienceHeader({ experience }: { experience: Experience }) {
  const { t, vi, lang, setLang, sound, volume, changeVolume } = experience;
  return <header className="header">
      <a className="brand" href="/" aria-label="Xuân An Yên"><img className="brand__logo" src="/images/tet-2027-logo.png" width="76" height="76" alt="" /><span className="brand__name">Xuân An Yên<span className="brand__sub">TẾT ĐINH MÙI · 2027</span></span></a>
      <div className="header__actions">
        <HeaderAudio lang={lang} enabled={sound} volume={volume} onVolumeChange={changeVolume} />
        <div className="language" aria-label={t('common.language')}><button className={`language__button${vi ? ' language__button--active' : ''}`} aria-pressed={vi} onClick={() => setLang('vi')}>VI</button><span className="language__divider">/</span><button className={`language__button${!vi ? ' language__button--active' : ''}`} aria-pressed={!vi} onClick={() => setLang('en')}>EN</button></div>
      </div>
    </header>;
}

export function ExperienceWelcome({ experience }: { experience: Experience }) {
  const { phase, t, preview, remaining, display, showFireworksEntry, dispatch, startPreview } = experience;
  if (phase !== 'COUNTDOWN') return null;
  return <section className="welcome">
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
    </section>;
}

export function ExperienceWishes({ experience }: { experience: Experience }) {
  const { tree, t, listOpen, fallback, seen, content, lang, openWish, setListOpen, setReset } = experience;
  if (!tree) return null;
  return <section className={`tree-panel${listOpen || fallback ? ' tree-panel--expanded' : ''}`}>
        <div className="tree-panel__heading"><Icon name="flower" /><span>{seen.length}/{content.wishes.length} {t('common.wishes.opened')}</span><button className="text-button" onClick={() => setListOpen(!listOpen)} aria-expanded={listOpen || fallback}>{listOpen ? t('common.collapse') : t('common.all.wishes')} {listOpen ? '−' : '+'}</button></div>
        {content.loading && <p className="tree-panel__message" role="status">{t('common.preparing.wishes')}</p>}
        {content.error && <p className="tree-panel__message">{t('common.showing.the.original.wishes')} <button className="text-button" onClick={content.retry}>{t('common.retry')}</button></p>}
        {(listOpen || fallback) && <div className="wish-list">{content.wishes.map((wish, i) => <button key={wish.id} className={`wish-list__button${seen.includes(wish.id) ? ' wish-list__button--seen' : ''}`} disabled={content.loading} onClick={() => openWish(i)}><span>{String(i+1).padStart(2,'0')}</span>{wish.title[lang]}{seen.includes(wish.id) && <Icon name="check" />}</button>)}</div>}
        <div className="tree-panel__tools"><span>{seen.length === content.wishes.length ? t('common.eight.wishes.carried.into.a.new.year') : t('common.drag.to.turn.tap.an.ornament.to')}</span><button className="icon-button" onClick={() => setReset(r => r+1)} aria-label={t('common.reset.view')}><Icon name="compass" /></button></div>
      </section>;
}

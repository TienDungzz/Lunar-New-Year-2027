import useExperience from './hooks/useExperience';
import ExperienceScene from './components/ExperienceScene';
import { ExperienceHeader, ExperienceWelcome, ExperienceWishes } from './components/ExperienceContent';
import SceneNavigation from './components/SceneNavigation';
import FireworksControls from './components/FireworksControls';
import WishDialog from './components/WishDialog';
import Icon from './components/Icons';

export default function App() {
  const experience = useExperience();
  const { tree, fireworks, phase, preparingSky, t, flow, transition, lang, dispatch, setSelected, show, cooldown, lastType, shoot, fallback, retryScene, selected, content, openWish, launch } = experience;
  return <main className={`experience experience--${tree ? 'tree' : fireworks ? 'fireworks' : 'home'}${phase === 'COUNTDOWN' ? ' experience--countdown' : ''}${preparingSky ? ' experience--preparing-sky' : ''}`}>
    <ExperienceScene experience={experience} />
    <div className="experience__vignette" />
    <ExperienceHeader experience={experience} />
    {phase === 'LOADING' && <div className="loading" role="status"><Icon name="flower" /><p>{t('common.lighting.the.lanterns')}</p><span>{t('common.a.little.home.a.peaceful.new.year')}</span></div>}
    <ExperienceWelcome experience={experience} />
    {flow.revealing && <section className="reveal" role="status"><p className="eyebrow">XUÂN ĐINH MÙI · 2027</p><h1 aria-label={t('common.happy.lunar.new.year.2')}>{t('common.happy')}<br /><em>{t('common.lunar.new.year')}</em></h1><p>{t('common.may.good.things.blossom')}</p></section>}
    {(fireworks || tree || transition) && <>
      <section className="chapter">
        <SceneNavigation lang={lang} active={tree || phase === 'TREE_TRANSITION' ? 'wishes' : 'fireworks'} transitioning={transition} onNavigate={destination => { setSelected(null); dispatch({ type: destination === 'wishes' ? 'OPEN_TREE' : 'OPEN_FIREWORKS' }); }} />
        <h1 className="chapter__title">{tree || phase === 'TREE_TRANSITION' ? t('common.the.spring.wishes.tree') : t('common.the.sky.is.yours')}</h1>
        <p className="chapter__description">{tree || phase === 'TREE_TRANSITION' ? t('common.touch.an.ornament.unfold.a.little.spring') : t('common.a.five.minute.show.add.shapes.write')}</p>
      </section>
      {fireworks && <FireworksControls draft={experience.skyWriting} lang={lang} show={show} cooldown={cooldown} lastType={lastType} onShoot={type => shoot(type)} onText={(text, salvo) => shoot('text', false, { text, points: salvo.points, glyphs: salvo.glyphs })} />}
      <ExperienceWishes experience={experience} />
    </>}
    {phase !== 'LOADING' && <footer className="footer"><span>{t('common.a.little.home.a.peaceful.new.year.2')}</span><span><Icon name="moon" />{t('common.a.vietnamese.spring.night')}</span></footer>}
    {fallback && <aside className="fallback-notice">{t('common.2d.scene.mode')}<button className="text-button" onClick={() => void retryScene()}>{t('common.retry.3d')}</button></aside>}
    {selected !== null && tree && !content.loading && <WishDialog wish={content.wishes[selected]} index={selected} total={content.wishes.length} lang={lang} onClose={() => setSelected(null)} onChange={openWish} />}
    <div className="sr-only" aria-live="polite">{transition ? t('common.changing.scene') : launch?.text ? `${t('common.sky.writing')} ${launch.text}` : ''}</div>
  </main>;
}

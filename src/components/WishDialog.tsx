import { createTranslator } from '../i18n';
import { useEffect, useRef } from 'react';
import type { Language, Wish } from '../hooks/useWishContent';
import Icon from './Icons';

export default function WishDialog({ wish, index, total, lang, onClose, onChange }: { wish: Wish; index: number; total: number; lang: Language; onClose: () => void; onChange: (index: number) => void }) {
  const t = createTranslator(lang);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    return () => { ref.current?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="wish-dialog" aria-labelledby="wish-title" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}>
    <button className="icon-button wish-dialog__close" onClick={onClose} aria-label={t('common.close.wish')}><Icon name="close" /></button>
    <div className="wish-dialog__flower"><Icon name="flower" /></div>
    <p className="eyebrow">{t('common.a.little.spring.blessing')}</p>
    <p className="wish-dialog__number">{String(index+1).padStart(2, '0')} / {total}</p>
    <h2 id="wish-title" className="wish-dialog__title">{wish.title[lang]}</h2>
    <p className="wish-dialog__body">{wish.body[lang]}</p>
    <div className="wish-dialog__signature"><span>Xuân Đinh Mùi · 2027</span></div>
    <div className="wish-dialog__navigation">
      <button className="text-button" onClick={() => onChange((index+total-1)%total)}>← {t('common.previous')}</button>
      <button className="text-button" onClick={() => onChange((index+1)%total)}>{t('common.next')} →</button>
    </div>
  </dialog>;
}

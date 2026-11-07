import { useEffect, useRef } from 'react';
import type { Language, Wish } from '../hooks/useWishContent';
import Icon from './Icons';

export default function WishDialog({ wish, index, total, lang, onClose, onChange }: { wish: Wish; index: number; total: number; lang: Language; onClose: () => void; onChange: (index: number) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    return () => { ref.current?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="wish-dialog" aria-labelledby="wish-title" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}>
    <button className="icon-button wish-dialog__close" onClick={onClose} aria-label={lang === 'vi' ? 'Đóng lời chúc' : 'Close wish'}><Icon name="close" /></button>
    <div className="wish-dialog__flower"><Icon name="flower" /></div>
    <p className="eyebrow">{lang === 'vi' ? 'MỘT CHÚT LỘC ĐẦU XUÂN' : 'A LITTLE SPRING BLESSING'}</p>
    <p className="wish-dialog__number">{String(index+1).padStart(2, '0')} / {total}</p>
    <h2 id="wish-title" className="wish-dialog__title">{wish.title[lang]}</h2>
    <p className="wish-dialog__body">{wish.body[lang]}</p>
    <div className="wish-dialog__signature">{lang === 'vi' ? 'Gửi bạn, một năm an yên.' : 'To you, a year of peace.'}<span>Xuân Đinh Mùi · 2027</span></div>
    <div className="wish-dialog__navigation">
      <button className="text-button" onClick={() => onChange((index+total-1)%total)}>← {lang === 'vi' ? 'Lời trước' : 'Previous'}</button>
      <button className="text-button" onClick={() => onChange((index+1)%total)}>{lang === 'vi' ? 'Lời tiếp' : 'Next'} →</button>
    </div>
  </dialog>;
}

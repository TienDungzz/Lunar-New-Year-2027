import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import FireworksControls from '../../src/components/FireworksControls';

const show = { playing: true, remaining: 280, complete: false, toggle: vi.fn(), restart: vi.fn() };
const props = { lang: 'vi' as const, show, cooldown: false, lastType: 'goat', onShoot: vi.fn(() => true), onText: () => true, onToggleSound: vi.fn() };
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('selects all three desktop positions, marks the active one and restores the saved choice', () => {
  const { unmount } = render(<FireworksControls {...props} />);
  const dock = () => screen.getByRole('region', { name: 'Điều khiển pháo hoa' });
  expect(dock().classList.contains('firework-dock--bottom')).toBe(true);
  for (const [label, position] of [['Đặt bảng bên trái','left'],['Đặt bảng bên phải','right'],['Đặt bảng phía dưới','bottom'],['Đặt bảng bên phải','right']]) {
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(dock().classList.contains(`firework-dock--${position}`)).toBe(true);
    expect(screen.getByRole('button', { name: label }).getAttribute('aria-pressed')).toBe('true');
    expect(JSON.parse(localStorage.getItem('tet-firework-dock')!)).toBe(position);
  }
  unmount(); render(<FireworksControls {...props} />);
  expect(dock().classList.contains('firework-dock--right')).toBe(true);
});

it('forces mobile to the bottom with icons only, then restores the desktop side without resetting state', () => {
  localStorage.setItem('tet-firework-dock',JSON.stringify('left'));
  const listeners = new Set<() => void>();
  const media = { matches: false, media: '', addEventListener: (_event: string, callback: () => void) => listeners.add(callback), removeEventListener: (_event: string, callback: () => void) => listeners.delete(callback) };
  vi.spyOn(window,'matchMedia').mockImplementation(query => { media.media = query; return media as unknown as MediaQueryList; });
  render(<FireworksControls {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Mở pháo hoa chữ' }));
  fireEvent.change(screen.getByLabelText('Viết điều bạn muốn gửi lên trời'), { target: { value: 'TẾT 2027' } });
  act(() => { media.matches = true; listeners.forEach(callback => callback()); });
  expect(media.media).toContain('pointer: coarse');
  const dock = screen.getByRole('region', { name: 'Điều khiển pháo hoa' });
  expect(dock.classList.contains('firework-dock--bottom')).toBe(true);
  expect(dock.classList.contains('firework-dock--mobile')).toBe(true);
  expect(screen.queryByRole('group', { name: 'Vị trí bảng pháo hoa' })).toBeNull();
  for (const label of ['Bắn Dê Đinh Mùi','Tạm dừng tự bắn','Bật âm thanh pháo hoa','Bắn chữ']) {
    const button = screen.getByRole('button', { name: label });
    expect(button.querySelector('svg')).toBeTruthy();
    expect(button.querySelector('span')).toBeNull();
  }
  expect((screen.getByLabelText('Viết điều bạn muốn gửi lên trời') as HTMLInputElement).value).toBe('TẾT 2027');
  expect(JSON.parse(localStorage.getItem('tet-firework-dock')!)).toBe('left');
  act(() => { media.matches = false; listeners.forEach(callback => callback()); });
  expect(dock.classList.contains('firework-dock--left')).toBe(true);
  expect(screen.getByRole('button', { name: 'Bắn Dê Đinh Mùi' }).getAttribute('title')).toBe('Dê Đinh Mùi');
});

it('falls back to bottom for invalid saved position data', () => {
  localStorage.setItem('tet-firework-dock',JSON.stringify('top'));
  render(<FireworksControls {...props} />);
  expect(screen.getByRole('button', { name: 'Đặt bảng phía dưới' }).getAttribute('aria-pressed')).toBe('true');
});

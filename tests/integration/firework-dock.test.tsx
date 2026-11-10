import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import FireworksControls from '../../src/components/FireworksControls';

const show = { playing: true, remaining: 280, complete: false, toggle: vi.fn(), restart: vi.fn() };
const props = { lang: 'vi' as const, show, cooldown: false, lastType: 'goat', onShoot: vi.fn(() => true), onText: () => true };
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('always docks at the bottom and ignores the retired saved side preference', () => {
  localStorage.setItem('tet-firework-dock',JSON.stringify('right'));
  const { unmount } = render(<FireworksControls {...props} />);
  const dock = () => screen.getByRole('region', { name: 'Điều khiển pháo hoa' });
  expect(dock().classList.contains('firework-dock--bottom')).toBe(true);
  expect(dock().querySelector('.live-dot')).toBeNull();
  expect(dock().querySelector('.firework-dock__progress-line')).toBeTruthy();
  expect(screen.queryByRole('group', { name: 'Vị trí bảng pháo hoa' })).toBeNull();
  expect(screen.queryByRole('button', { name: /Đặt bảng/ })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Thu gọn bảng pháo hoa' })).toBeNull();
  unmount(); render(<FireworksControls {...props} />);
  expect(dock().classList.contains('firework-dock--bottom')).toBe(true);
});

it('collapses all twenty mobile choices into one strip beside a separate pause control', () => {
  vi.spyOn(window,'matchMedia').mockReturnValue({ matches: true, addEventListener() {}, removeEventListener() {} } as unknown as MediaQueryList);
  const shoot = vi.fn(() => true), toggle = vi.fn();
  render(<FireworksControls {...props} onShoot={shoot} show={{ ...show, toggle }} />);
  const collapse = screen.getByRole('button', { name: 'Thu gọn bảng pháo hoa' });
  expect(collapse.parentElement).toBe(screen.getByRole('button', { name: 'Tạm dừng tự bắn' }).parentElement);
  fireEvent.click(collapse);
  const expand = screen.getByRole('button', { name: 'Mở rộng bảng pháo hoa' });
  expect(expand.getAttribute('aria-expanded')).toBe('false');
  const dock = screen.getByRole('region', { name: 'Điều khiển pháo hoa' });
  expect(dock.classList.contains('firework-dock--collapsed')).toBe(true);
  expect(dock.querySelectorAll('.firework-dock__choices button')).toHaveLength(20);
  fireEvent.click(screen.getByRole('button', { name: 'Bắn Dê Đinh Mùi' }));
  expect(shoot).toHaveBeenCalledWith('goat');
  expect(toggle).not.toHaveBeenCalled();
  fireEvent.click(expand);
  expect(dock.classList.contains('firework-dock--collapsed')).toBe(false);
});

it('preserves writing when collapsed and expands automatically when the text icon is chosen', () => {
  vi.spyOn(window,'matchMedia').mockReturnValue({ matches: true, addEventListener() {}, removeEventListener() {} } as unknown as MediaQueryList);
  render(<FireworksControls {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Mở pháo hoa chữ' }));
  fireEvent.change(screen.getByRole('textbox'),{ target: { value: 'XUÂN AN YÊN' } });
  fireEvent.click(screen.getByRole('button', { name: 'Thu gọn bảng pháo hoa' }));
  expect(screen.queryByRole('textbox')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Mở pháo hoa chữ' }));
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('XUÂN AN YÊN');
  expect(screen.getByRole('button', { name: 'Thu gọn bảng pháo hoa' }).getAttribute('aria-expanded')).toBe('true');
});

it('keeps text input and the bottom layout when switching between desktop and mobile', () => {
  const listeners = new Set<() => void>();
  const media = { matches: false, addEventListener: (_event: string, callback: () => void) => listeners.add(callback), removeEventListener: (_event: string, callback: () => void) => listeners.delete(callback) };
  vi.spyOn(window,'matchMedia').mockReturnValue(media as unknown as MediaQueryList);
  render(<FireworksControls {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Mở pháo hoa chữ' }));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'TẾT 2027' } });
  for (const mobile of [true,false]) {
    act(() => { media.matches = mobile; listeners.forEach(callback => callback()); });
    const dock = screen.getByRole('region', { name: 'Điều khiển pháo hoa' });
    expect(dock.classList.contains('firework-dock--bottom')).toBe(true);
    expect(dock.classList.contains('firework-dock--mobile')).toBe(mobile);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('TẾT 2027');
    expect(screen.getByRole('button', { name: 'Bắn Dê Đinh Mùi' }).querySelector('span')).toBeNull();
  }
});

it('does not write a position preference when controls are used', () => {
  const write = vi.spyOn(Storage.prototype,'setItem');
  render(<FireworksControls {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Bắn Dê Đinh Mùi' }));
  expect(write.mock.calls.some(([key]) => key === 'tet-firework-dock')).toBe(false);
});

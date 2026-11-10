import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import FireworksControls from '../../src/components/FireworksControls';
import { createPresetTextSalvo, createTextSalvo } from '../../src/lib/fireworkText';
import { fireworkTypes } from '../../src/lib/experience.mjs';

vi.mock('../../src/lib/fireworkText', async importOriginal => ({ ...(await importOriginal<typeof import('../../src/lib/fireworkText')>()), createPresetTextSalvo: vi.fn(async () => ({ points: [[0,0,0]], glyphs: [{ character: 'A', center: [0,0,0], points: [[0,0,0]] }] })), createTextSalvo: vi.fn(async () => ({ points: [[0,0,0], [1,1,0]], glyphs: [{ character: 'A', center: [0,0,0], points: [[0,0,0], [1,1,0]] }] })) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const show = { playing: true, remaining: 300, complete: false, toggle: vi.fn(), restart: vi.fn() };

it('shows a rejected launch as a detached notice that expires without changing the control grid', async () => {
  vi.useFakeTimers();
  try {
    render(<FireworksControls lang="en" show={show} cooldown={false} lastType="goat" onShoot={() => true} onText={() => false} />);
    const dock = screen.getByRole('region', { name: 'Firework controls' });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Launch 2027' })));
    const notice = screen.getByRole('alert');
    expect(dock.contains(notice)).toBe(false);
    expect(document.querySelectorAll('.firework-dock__choices button')).toHaveLength(20);
    await act(async () => { vi.advanceTimersByTime(4000); });
    expect(screen.queryByRole('alert')).toBeNull();
  } finally { vi.useRealTimers(); }
});

it('launches both fixed greetings directly without opening the custom text form and respects cooldown', async () => {
  const onText = vi.fn(() => true);
  const props = { lang: 'vi' as const, show, cooldown: false, lastType: 'burst', onShoot: () => true, onText };
  const { rerender } = render(<FireworksControls {...props} />);
  for (const [text,id] of [['Chúc mừng năm mới','new-year'],['2027','year-2027']]) {
    await act(async () => fireEvent.click(screen.getByRole('button', { name: `Bắn ${text}` })));
    expect(createPresetTextSalvo).toHaveBeenLastCalledWith(id);
    expect(onText).toHaveBeenLastCalledWith(text,expect.objectContaining({ glyphs: expect.any(Array) }));
  }
  expect(screen.queryByRole('textbox')).toBeNull();
  rerender(<FireworksControls {...props} cooldown />);
  expect((screen.getByRole('button', { name: 'Bắn 2027' }) as HTMLButtonElement).disabled).toBe(true);
});

it('exposes seventeen named icon buttons and allows manual shots during the auto show', () => {
  const onShoot = vi.fn(() => true);
  render(<FireworksControls lang="vi" show={show} cooldown={false} lastType="burst" onShoot={onShoot} onText={() => true} />);
  for (const type of fireworkTypes.filter(t => t.id !== 'text')) fireEvent.click(screen.getByRole('button', { name: `Bắn ${type.vi}` }));
  expect(onShoot).toHaveBeenCalledTimes(17);
  expect(screen.getByText('05:00')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Tạm dừng tự bắn' }));
  expect(show.toggle).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('button', { name: 'Bật âm thanh pháo hoa' })).toBeNull();
});

it('validates the twenty-four-character limit before generating and launching actual particle targets', async () => {
  const onText = vi.fn(() => true);
  render(<FireworksControls lang="vi" show={show} cooldown={false} lastType="burst" onShoot={() => true} onText={onText} />);
  fireEvent.click(screen.getByRole('button', { name: 'Mở pháo hoa chữ' }));
  const input = screen.getByLabelText('Viết điều bạn muốn gửi lên trời');
  fireEvent.change(input, { target: { value: 'A'.repeat(25) } });
  expect(screen.getByText('25/24')).toBeTruthy();
  expect((screen.getByRole('button', { name: 'Bắn chữ' }) as HTMLButtonElement).disabled).toBe(true);
  expect(createTextSalvo).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: 'TẾT 2027'.normalize('NFD') } });
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Bắn chữ' })));
  expect(createTextSalvo).toHaveBeenCalledWith('TẾT 2027');
  expect(onText).toHaveBeenCalledWith('TẾT 2027', { points: [[0,0,0], [1,1,0]], glyphs: [{ character: 'A', center: [0,0,0], points: [[0,0,0], [1,1,0]] }] });
  fireEvent.click(screen.getByRole('button', { name: 'Mở pháo hoa chữ' }));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Chúc mừng năm mới' } });
  expect(screen.getByText('17/24')).toBeTruthy();
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Bắn chữ' })));
  expect(createTextSalvo).toHaveBeenLastCalledWith('Chúc mừng năm mới');
  expect(onText).toHaveBeenLastCalledWith('Chúc mừng năm mới',expect.anything());
});

it('does not launch stale text if the visitor leaves while the font is preparing', async () => {
  let resolve!: (salvo: { points: number[][]; glyphs: { character: string; center: number[]; points: number[][] }[] }) => void;
  vi.mocked(createTextSalvo).mockImplementationOnce(() => new Promise(done => { resolve = done; }));
  const onText = vi.fn(() => true);
  const { unmount } = render(<FireworksControls lang="en" show={show} cooldown={false} lastType="burst" onShoot={() => true} onText={onText} />);
  fireEvent.click(screen.getByRole('button', { name: 'Open sky writing' }));
  fireEvent.click(screen.getByRole('button', { name: 'Launch text' }));
  unmount();
  await act(async () => resolve({ points: [[0,0,0]], glyphs: [{ character: 'A', center: [0,0,0], points: [[0,0,0]] }] }));
  expect(onText).not.toHaveBeenCalled();
});




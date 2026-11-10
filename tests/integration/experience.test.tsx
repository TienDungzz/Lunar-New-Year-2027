import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../../src/App';
import * as audio from '../../src/lib/audio';

vi.mock('../../src/lib/fireworkText', async importOriginal => ({ ...(await importOriginal<typeof import('../../src/lib/fireworkText')>()), createPresetTextSalvo: vi.fn(async () => ({ points: [[0,0,0]], glyphs: [{ character: 'A', center: [0,0,0], points: [[0,0,0]] }] })), createTextSalvo: vi.fn(async () => ({
points: [[-2,0,0],[0,0,0],[2,0,0]],
glyphs: ['T','Ế','T'].map((character,index) => ({ character, center: [(index-1)*2,0,0], points: [[0,0,0],[.1,.1,0]] })),
})) }));

async function advance(ms: number) { await act(async () => { vi.advanceTimersByTime(ms); }); }
async function enterFireworks() {
fireEvent.click(screen.getByRole('button', { name: /Xem trước giao thừa/ }));
await advance(10000);
expect(screen.getByRole('heading', { name: /Chúc Mừng Năm Mới/ })).toBeTruthy();
await advance(1800);
fireEvent.click(screen.getByRole('button', { name: /Tạm dừng tự bắn/ }));
}

it('preserves the custom sky-writing draft and open form across scene navigation', async () => {
  vi.setSystemTime(new Date('2027-02-06T00:01:00+07:00'));
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Thắp sáng bầu trời/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Mở pháo hoa chữ' }));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'TẾT AN VUI' } });
  fireEvent.click(screen.getByRole('button', { name: 'Lời chúc' }));
  await advance(600);
  fireEvent.click(screen.getByRole('button', { name: 'Pháo hoa' }));
  await advance(600);
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('TẾT AN VUI');
});

it('enters fireworks once after returning from a tab hidden across real midnight without preview mode', async () => {
  let hidden = false;
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  vi.setSystemTime(new Date('2027-02-05T23:59:50+07:00'));
  window.history.replaceState({}, '', '/');
  const shots = vi.spyOn(audio, 'playLaunch');
  render(<App />);
  hidden = true;
  fireEvent(document, new Event('visibilitychange'));
  await advance(11000);
  expect(shots).not.toHaveBeenCalled();
  expect(screen.queryByRole('region', { name: 'Điều khiển pháo hoa' })).toBeNull();
  hidden = false;
  fireEvent(document, new Event('visibilitychange'));
  expect(shots.mock.calls.filter(call => call[0] === 'opening')).toHaveLength(1);
  expect(screen.getByRole('region', { name: 'Điều khiển pháo hoa' })).toBeTruthy();
});

it('releases the opening text slot after its shorter lifetime instead of keeping it for nine seconds', async () => {
  const sounds = vi.spyOn(audio,'playLaunch');
  render(<App />);
  await enterFireworks();
  sounds.mockClear();
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Bắn 2027' })));
  expect(sounds.mock.calls.some(call => call[0] === 'text')).toBe(false);
  await advance(4701);
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Bắn 2027' })));
  expect(sounds.mock.calls.some(call => call[0] === 'text')).toBe(true);
});
it('mutes at zero and enables on a positive slider or plus-button gesture without a mute button', async () => {
  const enable = vi.spyOn(audio,'setAudioEnabled').mockResolvedValue(undefined);
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'EN' }));
  fireEvent.click(screen.getByRole('button', { name: 'Adjust volume' }));
  expect(enable).not.toHaveBeenCalled();
  const slider = screen.getByRole('slider') as HTMLInputElement;
  expect(slider.value).toBe('0');
  expect(enable).not.toHaveBeenCalled();
  expect(slider.getAttribute('aria-valuetext')).toBe('0% · muted');
  expect(screen.queryByRole('button', { name: 'Enable sound' })).toBeNull();
  await act(async () => fireEvent.change(slider,{ target: { value: '35' } }));
  expect(enable).toHaveBeenLastCalledWith(true);
  expect(slider.getAttribute('aria-valuetext')).toBe('35%');
  await act(async () => fireEvent.change(slider,{ target: { value: '0' } }));
  expect(enable).toHaveBeenLastCalledWith(false);
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Increase volume' })));
  expect(slider.value).toBe('10');
  expect(JSON.parse(localStorage.getItem('tet-sound-volume')!)).toBe(10);
  expect(enable).toHaveBeenLastCalledWith(true);
});
it.each(['/', '/?mode=normal', '/?mode=Preview', '/?mode='])('hides preview before midnight without exact mode=preview (%s)', url => {
  window.history.replaceState({},'',url);
  render(<App />);
  expect(screen.queryByRole('button', { name: /Xem trước giao thừa/ })).toBeNull();
  expect(screen.queryByRole('button', { name: /Thắp sáng bầu trời/ })).toBeNull();
  expect(screen.getByText('CÙNG ĐẾM NGƯỢC ĐẾN GIAO THỪA')).toBeTruthy();
});
it('shows entry after midnight even without preview mode', () => {
  window.history.replaceState({},'','/');
  vi.setSystemTime(new Date('2027-02-06T00:01:00+07:00'));
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Thắp sáng bầu trời/ }));
  expect(screen.getByRole('region', { name: 'Điều khiển pháo hoa' })).toBeTruthy();
});
it.each(['preview','real'])('prepares the sky at three seconds and launches exactly at zero (%s)', async mode => {
  vi.setSystemTime(new Date(mode === 'real' ? '2027-02-05T23:59:50+07:00' : '2026-11-07T10:00:00+07:00'));
  const shots = vi.spyOn(audio,'playLaunch');
  render(<App />);
  shots.mockClear();
  if (mode === 'preview') fireEvent.click(screen.getByRole('button', { name: /Xem trước giao thừa/ }));
  await advance(6999);
  expect(document.querySelector('.experience--countdown')).toBeTruthy();
  expect(document.querySelector('.experience--preparing-sky')).toBeNull();
  expect(document.querySelector('.fallback-scene__moon')).toBeTruthy();
  expect(shots).not.toHaveBeenCalled();
  await advance(1);
  expect(document.querySelector('.experience--preparing-sky')).toBeTruthy();
  expect(document.querySelector('.fallback-scene__moon')).toBeNull();
  expect(screen.queryByRole('region', { name: 'Điều khiển pháo hoa' })).toBeNull();
  await advance(2999);
  expect(shots).not.toHaveBeenCalled();
  await advance(1);
  expect(shots).toHaveBeenCalledTimes(1);
  expect(shots.mock.calls[0][0]).toBe('opening');
  expect(document.querySelector('.experience--countdown')).toBeNull();
  expect(shots.mock.calls[0][3]?.length).toBeGreaterThan(0);
  expect(screen.getByRole('heading', { name: 'Chúc Mừng Năm Mới' })).toBeTruthy();
  expect(screen.getByRole('region', { name: 'Điều khiển pháo hoa' })).toBeTruthy();
});
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear();
  window.history.replaceState({}, '', '/?mode=preview');
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-07T10:00:00+07:00'));
  vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it('previews, launches all shapes, reads all wishes, and returns without losing progress', async () => {
  render(<App />);
  expect(document.querySelector('.fallback-scene__moon')).toBeTruthy();
  await enterFireworks();
  expect(document.querySelector('.fallback-scene__moon')).toBeNull();
  for (const shape of ['Pháo chùm', 'Trái tim', 'Vòng tròn', 'Thác sáng']) {
    const button = screen.getByRole('button', { name: `Bắn ${shape}` }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    fireEvent.click(button);
    expect(button.disabled).toBe(true);
    await advance(401);
  }
  // The interactive scene never advances by itself.
  await advance(30000);
  expect(screen.getByRole('heading', { name: 'Bầu trời là của bạn.' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Lời chúc' }));
  await advance(600);
  expect(document.querySelector('.fallback-scene__moon')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /01.*Bình an/ }));
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Bình an' })).toBeTruthy();
  for (let i = 1; i < 8; i++) fireEvent.click(screen.getByRole('button', { name: /Tiếp/ }));
  expect(screen.getByRole('heading', { name: 'Bạn bè' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /Tiếp/ }));
  expect(screen.getByRole('heading', { name: 'Bình an' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /Trước/ }));
  expect(screen.getByRole('heading', { name: 'Bạn bè' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Đóng lời chúc' }));
  expect(screen.getByText('8/8 LỜI CHÚC ĐÃ MỞ')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'EN' }));
  expect(screen.getByText('8/8 WISHES OPENED')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Fireworks' }));
  await advance(600);
  expect((screen.getByRole('button', { name: 'Launch Heart' }) as HTMLButtonElement).disabled).toBe(false);
  expect(screen.queryByRole('button', { name: /Skip intro/ })).toBeNull();
  const progress = JSON.parse(localStorage.getItem('tet-wishes-seen')!);
  expect(progress.sets.default).toHaveLength(8);
  cleanup(); render(<App />);
  expect(document.documentElement.lang).toBe('en');
});

it('opens after midnight with a gesture, without replaying the countdown', async () => {
  vi.setSystemTime(new Date('2027-02-06T00:01:00+07:00'));
  render(<App />);
  expect(screen.getByText('CHÚC MỪNG NĂM MỚI')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /Thắp sáng bầu trời/ }));
  expect(screen.getByRole('button', { name: /Tạm dừng tự bắn/ })).toBeTruthy();
  expect((screen.getByRole('button', { name: 'Bắn Trái tim' }) as HTMLButtonElement).disabled).toBe(false);
});

it('keeps automatic and manual fireworks running alongside large text without cancelling audio', async () => {
  const sounds = vi.spyOn(audio, 'playLaunch');
  const stop = vi.spyOn(audio, 'stopFireworkAudio');
  vi.setSystemTime(new Date('2027-02-06T00:01:00+07:00'));
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Thắp sáng bầu trời/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Mở pháo hoa chữ' }));
  fireEvent.change(screen.getByLabelText('Viết điều bạn muốn gửi lên trời'), { target: { value: 'TẾT' } });
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Bắn chữ' })));
  expect(document.querySelector('.firework-dock--text-active')).toBeNull();
  expect(screen.queryByRole('textbox')).toBeNull();
  const stopsAfterMount = stop.mock.calls.length;
  expect(sounds.mock.calls.some(call => call[0] === 'text')).toBe(true);
  await advance(401);
  const rocket = screen.getByRole('button', { name: 'Bắn Tên lửa' }) as HTMLButtonElement;
  expect(rocket.disabled).toBe(false);
  fireEvent.click(rocket);
  expect(sounds.mock.calls.some(call => call[0] === 'rocket')).toBe(true);
  await advance(2000);
  expect(sounds.mock.calls.some(call => call[0] === 'goat')).toBe(true);
  expect(screen.getByText('04:58')).toBeTruthy();
  expect(stop.mock.calls.length).toBe(stopsAfterMount);
});

it('recovers from invalid saved progress instead of breaking the wish list', async () => {
  localStorage.setItem('tet-wishes-seen', '{invalid-json');
  render(<App />);
  await enterFireworks();
  fireEvent.click(screen.getByRole('button', { name: 'Lời chúc' }));
  await advance(600);
  expect(screen.getByText('0/8 LỜI CHÚC ĐÃ MỞ')).toBeTruthy();
});

it('migrates old progress by retaining valid wishes and removing retired or duplicate IDs', async () => {
  localStorage.setItem('tet-wishes-seen', JSON.stringify({ version: 1, sets: { default: ['wish-01', 'wish-08', 'wish-09', 'wish-12', 'wish-01'] } }));
  render(<App />);
  await enterFireworks();
  fireEvent.click(screen.getByRole('button', { name: 'Lời chúc' }));
  await advance(600);
  expect(screen.getByText('2/8 LỜI CHÚC ĐÃ MỞ')).toBeTruthy();
  expect(JSON.parse(localStorage.getItem('tet-wishes-seen')!).sets.default).toEqual(['wish-01', 'wish-08']);
});

it('keeps fireworks usable while content loads and rejects stale content after URL changes', async () => {
  vi.setSystemTime(new Date('2027-02-06T00:01:00+07:00'));
  vi.stubEnv('VITE_CONTENT_API_URL', '/api/{id}');
  window.history.replaceState({}, '', '/?i=first&mode=preview');
  const requests = new Map<string, (value: Response) => void>();
  // Deliberately emulate a transport that delivers after cancellation.
  vi.stubGlobal('fetch', vi.fn((url: string) => new Promise<Response>(resolve => requests.set(url, resolve))));
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Thắp sáng bầu trời/ }));
  expect((screen.getByRole('button', { name: 'Bắn Trái tim' }) as HTMLButtonElement).disabled).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Lời chúc' }));
  await advance(600);
  expect(screen.getByText('Đang chuẩn bị lời chúc…')).toBeTruthy();
  expect((screen.getByRole('button', { name: /01.*Bình an/ }) as HTMLButtonElement).disabled).toBe(true);
  act(() => { window.history.pushState({}, '', '/?i=second'); window.dispatchEvent(new PopStateEvent('popstate')); });
  const respond = (title: string) => new Response(JSON.stringify({ schemaVersion: 1, wishes: { 'wish-01': { title: { vi: title } } } }), { headers: { 'content-type': 'application/json' } });
  await act(async () => { requests.get(`${location.origin}/api/second`)!(respond('Lời chúc mới')); });
  fireEvent.click(screen.getByRole('button', { name: /01.*Lời chúc mới/ }));
  expect(screen.getByRole('heading', { name: 'Lời chúc mới' })).toBeTruthy();
  await act(async () => { requests.get(`${location.origin}/api/first`)!(respond('Nội dung cũ')); });
  expect(screen.queryByText('Nội dung cũ')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Lời chúc mới' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Đóng lời chúc' }));
  expect(screen.getByText('1/8 LỜI CHÚC ĐÃ MỞ')).toBeTruthy();
  act(() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); });
  expect(screen.getByText('0/8 LỜI CHÚC ĐÃ MỞ')).toBeTruthy();
  expect(screen.getByRole('button', { name: /01.*Bình an/ })).toBeTruthy();
});

it('releases the wish buttons after an API timeout', async () => {
  vi.setSystemTime(new Date('2027-02-06T00:01:00+07:00'));
  vi.stubEnv('VITE_CONTENT_API_URL', '/api/{id}');
  window.history.replaceState({}, '', '/?i=timeout&mode=preview');
  vi.stubGlobal('fetch', vi.fn((_url: string, options: RequestInit) => new Promise<Response>((_resolve, reject) => {
    options.signal!.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  })));
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Thắp sáng bầu trời/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Lời chúc' }));
  await advance(600);
  await advance(7500);
  expect(screen.getByText(/Đang dùng lời chúc có sẵn/)).toBeTruthy();
  expect((screen.getByRole('button', { name: /01.*Bình an/ }) as HTMLButtonElement).disabled).toBe(false);
});



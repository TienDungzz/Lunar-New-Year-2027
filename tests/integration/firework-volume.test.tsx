import { useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import FireworksControls from '../../src/components/FireworksControls';
import { normalizeVolume } from '../../src/lib/audioPreferences.mjs';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function Controls() {
  const [volume, setVolume] = useState(70);
  return <FireworksControls lang="en" show={{ playing: true, remaining: 300, complete: false, toggle() {}, restart() {} }} cooldown={false} lastType="" onShoot={() => true} onText={() => true} volume={volume} onVolumeChange={setVolume} />;
}
it('supports slider and ten-percent steps with bounded controls while muted', () => {
  render(<Controls />);
  fireEvent.click(screen.getByRole('button', { name: 'Adjust volume' }));
  const slider = screen.getByRole('slider', { name: 'Firework volume' }) as HTMLInputElement;
  fireEvent.click(screen.getByRole('button', { name: 'Decrease volume' }));
  expect(slider.value).toBe('60');
  fireEvent.click(screen.getByRole('button', { name: 'Increase volume' }));
  expect(slider.value).toBe('70');
  fireEvent.change(slider, { target: { value: '0' } });
  expect((screen.getByRole('button', { name: 'Decrease volume' }) as HTMLButtonElement).disabled).toBe(true);
  expect(slider.getAttribute('aria-valuetext')).toBe('0% · muted');
  fireEvent.change(slider, { target: { value: '100' } });
  expect((screen.getByRole('button', { name: 'Increase volume' }) as HTMLButtonElement).disabled).toBe(true);
});
it('reveals volume from an icon on mobile and can collapse it again', () => {
  vi.spyOn(window,'matchMedia').mockImplementation(() => ({ matches: true, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList);
  render(<Controls />);
  const button = screen.getByRole('button', { name: 'Adjust volume' });
  expect(button.querySelector('svg')).toBeTruthy();
  expect(screen.queryByRole('slider')).toBeNull();
  fireEvent.click(button);
  expect(screen.getByRole('slider')).toBeTruthy();
  fireEvent.click(button);
  expect(screen.queryByRole('slider')).toBeNull();
});
it('normalizes invalid saved preferences and clamps the percentage', () => {
  expect([null,'90',NaN,Infinity].map(normalizeVolume)).toEqual([70,70,70,70]);
  expect([-5,120,45.6].map(normalizeVolume)).toEqual([0,100,46]);
});

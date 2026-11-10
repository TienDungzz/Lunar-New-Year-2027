import { useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import HeaderAudio from '../../src/components/HeaderAudio';
import { normalizeVolume } from '../../src/lib/audioPreferences.mjs';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function Controls() {
  const [volume, setVolume] = useState(70);
  return <HeaderAudio lang="en" enabled={volume > 0} volume={volume} onVolumeChange={setVolume} />;
}
it('supports slider and ten-percent steps with bounded controls and mute at zero', () => {
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
it('shows zero for a muted page even with a saved full volume and synchronizes after a gesture', () => {
  const change = vi.fn();
  const { rerender } = render(<HeaderAudio lang="en" enabled={false} volume={100} onVolumeChange={change} />);
  const trigger = screen.getByRole('button', { name: 'Adjust volume' });
  expect(trigger.getAttribute('title')).toBe('Volume: 0%');
  fireEvent.click(trigger);
  const slider = screen.getByRole('slider') as HTMLInputElement;
  expect(slider.value).toBe('0');
  expect(slider.getAttribute('aria-valuetext')).toBe('0% · muted');
  expect(change).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Increase volume' }));
  expect(change).toHaveBeenLastCalledWith(10);
  rerender(<HeaderAudio lang="en" enabled volume={10} onVolumeChange={change} />);
  expect(slider.value).toBe('10');
  expect(trigger.getAttribute('title')).toBe('Volume: 10%');
});
it('reveals volume from an icon on mobile and can collapse it again', () => {
  vi.spyOn(window,'matchMedia').mockImplementation(() => ({ matches: false, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList);
  render(<Controls />);
  const button = screen.getByRole('button', { name: 'Adjust volume' });
  expect(screen.getAllByRole('button')).toHaveLength(1);
  expect(screen.queryByRole('button', { name: 'Enable sound' })).toBeNull();
  expect(button.querySelector('svg')).toBeTruthy();
  expect(screen.queryByRole('slider')).toBeNull();
  fireEvent.mouseEnter(button.parentElement!);
  expect(screen.queryByRole('slider')).toBeNull();
  fireEvent.click(button);
  expect(screen.getByRole('slider')).toBeTruthy();
  expect(screen.queryByText('Muted')).toBeNull();
  expect(screen.queryByText('70%')).toBeNull();
  fireEvent.click(button);
  expect(screen.queryByRole('slider')).toBeNull();
});
it('opens on desktop hover, keeps the popup interactive, and closes on leave or Escape', () => {
  vi.spyOn(window,'matchMedia').mockImplementation(() => ({ matches: true, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList);
  render(<Controls />);
  const trigger = screen.getByRole('button', { name: 'Adjust volume' }), root = trigger.parentElement!;
  fireEvent.mouseEnter(root);
  expect(screen.getByRole('slider')).toBeTruthy();
  fireEvent.change(screen.getByRole('slider'), { target: { value: '45' } });
  expect(trigger.getAttribute('title')).toBe('Volume: 45%');
  fireEvent.mouseLeave(root);
  expect(screen.queryByRole('slider')).toBeNull();
  fireEvent.mouseEnter(root);
  fireEvent.keyDown(root,{ key: 'Escape' });
  expect(screen.queryByRole('slider')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});
it('dismisses a minimal slider popup outside the header', () => {
  render(<HeaderAudio lang="en" enabled={false} volume={70} onVolumeChange={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Adjust volume' }));
  expect(screen.getByRole('slider')).toBeTruthy();
  fireEvent.pointerDown(document.body);
  expect(screen.queryByRole('slider')).toBeNull();
  expect(screen.getAllByRole('button')).toHaveLength(1);
});
it('normalizes invalid saved preferences and clamps the percentage', () => {
  expect([null,'90',NaN,Infinity].map(normalizeVolume)).toEqual([70,70,70,70]);
  expect([-5,120,45.6].map(normalizeVolume)).toEqual([0,100,46]);
});

import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import FireworksControls from '../../src/components/FireworksControls';
import SceneNavigation from '../../src/components/SceneNavigation';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it.each([360, 390, 768, 1440])('keeps all choices accessible in the DOM at %ipx with custom text last', width => {
  vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
    matches: query.includes('max-width: 699px') && width < 700,
    media: query, addEventListener() {}, removeEventListener() {},
  }) as unknown as MediaQueryList);
  const navigate = vi.fn();
  const show = { playing: true, remaining: 300, complete: false, toggle: vi.fn(), restart: vi.fn() };
  render(<>
    <SceneNavigation lang="en" active="fireworks" transitioning={false} onNavigate={navigate} />
    <FireworksControls lang="en" show={show} cooldown={false} lastType="goat" onShoot={() => true} onText={() => true} />
  </>);
  const choices = document.querySelectorAll('.firework-dock__choices button');
  expect(choices).toHaveLength(20);
  expect(choices[19]).toBe(screen.getByRole('button', { name: 'Open sky writing' }));
  expect(choices[17].getAttribute('title')).toBe('Chúc mừng năm mới');
  expect(choices[18].getAttribute('title')).toBe('2027');
  expect(!!screen.queryByRole('button', { name: 'Collapse firework controls' })).toBe(width < 700);
  fireEvent.click(screen.getByRole('button', { name: 'Wishes' }));
  expect(navigate).toHaveBeenCalledWith('wishes');
  fireEvent.click(choices[19]);
  expect(screen.getByRole('textbox')).toBeTruthy();
});

import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import SceneNavigation from '../../src/components/SceneNavigation';

afterEach(cleanup);
it('marks the current scene and navigates only to a different scene', () => {
  const navigate = vi.fn();
  render(<SceneNavigation lang="vi" active="fireworks" transitioning={false} onNavigate={navigate} />);
  const fireworks = screen.getByRole('button', { name: 'Pháo hoa' }), wishes = screen.getByRole('button', { name: 'Lời chúc' });
  expect(fireworks.getAttribute('aria-current')).toBe('page');
  expect(wishes.getAttribute('aria-current')).toBeNull();
  fireEvent.click(fireworks);
  expect(navigate).not.toHaveBeenCalled();
  fireEvent.click(wishes);
  expect(navigate).toHaveBeenCalledWith('wishes');
});
it('moves the indicator with the destination and locks both items during transitions', () => {
  const navigate = vi.fn();
  const { rerender } = render(<SceneNavigation lang="en" active="wishes" transitioning onNavigate={navigate} />);
  const nav = screen.getByRole('navigation', { name: 'Scene navigation' });
  expect(nav.classList.contains('scene-navigation--wishes')).toBe(true);
  expect(nav.getAttribute('aria-busy')).toBe('true');
  const fireworks = screen.getByRole('button', { name: 'Fireworks' }) as HTMLButtonElement;
  expect(fireworks.disabled).toBe(true);
  fireEvent.click(fireworks);
  expect(navigate).not.toHaveBeenCalled();
  rerender(<SceneNavigation lang="en" active="wishes" transitioning={false} onNavigate={navigate} />);
  fireEvent.click(fireworks);
  expect(navigate).toHaveBeenCalledWith('fireworks');
  expect(screen.getByRole('button', { name: 'Wishes' }).getAttribute('aria-current')).toBe('page');
});

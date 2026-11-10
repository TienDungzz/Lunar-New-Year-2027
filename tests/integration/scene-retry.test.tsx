import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { RecoverableWorld } from '../../src/components/ExperienceScene';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('retries a rejected scene import with a fresh lazy component instead of reusing its rejected promise', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const load = vi.fn()
    .mockRejectedValueOnce(new TypeError('Failed to fetch dynamically imported module'))
    .mockResolvedValue({ default: () => <div>Recovered world</div> });
  const onError = vi.fn();
  const props = { phase: 'COUNTDOWN', reduced: false, seen: [], launch: null, onOpen: vi.fn(), onReady: vi.fn(), onTransition: vi.fn(), onError, modalOpen: false, reset: 0, visible: true, load };
  const view = render(<RecoverableWorld {...props} version={0} />);
  await act(async () => {});
  expect(onError).toHaveBeenCalledTimes(1);
  expect(load).toHaveBeenCalledTimes(1);
  view.rerender(<RecoverableWorld {...props} version={1} />);
  await act(async () => {});
  expect(load).toHaveBeenCalledTimes(2);
  expect(screen.getByText('Recovered world')).toBeTruthy();
});

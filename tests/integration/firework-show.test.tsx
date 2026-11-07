import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import useFireworkShow from '../../src/hooks/useFireworkShow';

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

it('runs for exactly five active minutes, stops launching, and can replay', () => {
  const onLaunch = vi.fn();
  const { result } = renderHook(() => useFireworkShow({ active: true, visible: true, reduced: false, onLaunch }));
  act(() => vi.advanceTimersByTime(299800));
  expect(result.current.complete).toBe(false);
  expect(result.current.remaining).toBe(1);
  expect(onLaunch.mock.calls.length).toBeGreaterThan(200);
  const types = new Set(onLaunch.mock.calls.map(call => call[0]));
  expect(types.size).toBeGreaterThanOrEqual(10);
  act(() => vi.advanceTimersByTime(200));
  expect(result.current.complete).toBe(true);
  expect(result.current.playing).toBe(false);
  const count = onLaunch.mock.calls.length;
  act(() => vi.advanceTimersByTime(300000));
  expect(onLaunch).toHaveBeenCalledTimes(count);
  act(() => result.current.restart());
  expect(result.current.remaining).toBe(300);
  expect(result.current.playing).toBe(true);
  act(() => vi.advanceTimersByTime(2000));
  expect(onLaunch.mock.calls.length).toBeGreaterThan(count);
});

it('pauses for hidden tabs, manual pause and tree navigation without a backlog', () => {
  const onLaunch = vi.fn();
  const { result, rerender } = renderHook(({ active, visible }) => useFireworkShow({ active, visible, reduced: false, onLaunch }), { initialProps: { active: true, visible: true } });
  act(() => vi.advanceTimersByTime(10000));
  const remaining = result.current.remaining, count = onLaunch.mock.calls.length;
  rerender({ active: true, visible: false });
  act(() => vi.advanceTimersByTime(180000));
  expect(result.current.remaining).toBe(remaining);
  expect(onLaunch).toHaveBeenCalledTimes(count);
  rerender({ active: false, visible: true });
  act(() => vi.advanceTimersByTime(60000));
  expect(result.current.remaining).toBe(remaining);
  rerender({ active: true, visible: true });
  act(() => vi.advanceTimersByTime(200));
  expect(onLaunch.mock.calls.length-count).toBeLessThanOrEqual(1);
  act(() => result.current.toggle());
  const paused = result.current.remaining, pausedCount = onLaunch.mock.calls.length;
  act(() => vi.advanceTimersByTime(10000));
  expect(result.current.remaining).toBe(paused);
  expect(onLaunch).toHaveBeenCalledTimes(pausedCount);
});

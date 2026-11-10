import { afterEach, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import FireworkProgress from '../../src/components/FireworkProgress';

afterEach(cleanup);
it('drains the complete perimeter with active show time and restores it on replay', () => {
  const { container, rerender } = render(<FireworkProgress remaining={300} elapsed={0} />);
  const offset = () => container.querySelector('.firework-dock__progress-line')?.getAttribute('stroke-dashoffset');
  expect(offset()).toBe('0');
  rerender(<FireworkProgress remaining={150} elapsed={150000} />);
  expect(offset()).toBe('50');
  rerender(<FireworkProgress remaining={150} elapsed={150000} />);
  expect(offset()).toBe('50');
  rerender(<FireworkProgress remaining={0} elapsed={300000} />);
  expect(offset()).toBe('100');
  rerender(<FireworkProgress remaining={300} elapsed={0} />);
  expect(offset()).toBe('0');
  expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
});
it('uses remaining seconds when elapsed is absent and clamps the border', () => {
  const { container, rerender } = render(<FireworkProgress remaining={60} />);
  const line = () => container.querySelector('.firework-dock__progress-line');
  expect(line()?.getAttribute('stroke-dashoffset')).toBe('80');
  rerender(<FireworkProgress remaining={-1} />);
  expect(line()?.getAttribute('stroke-dashoffset')).toBe('100');
  rerender(<FireworkProgress remaining={400} />);
  expect(line()?.getAttribute('stroke-dashoffset')).toBe('0');
});

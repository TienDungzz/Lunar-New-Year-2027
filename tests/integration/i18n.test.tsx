import { expect, it } from 'vitest';
import { createTranslator, normalizeLocale } from '../../src/i18n';
import vi from '../../src/i18n/vi.json';
import en from '../../src/i18n/en.json';

it('keeps the same keys and placeholders in both message catalogs', () => {
  expect(Object.keys(en).sort()).toEqual(Object.keys(vi).sort());
  for (const key of Object.keys(vi) as (keyof typeof vi)[]) {
    expect(en[key].trim().length).toBeGreaterThan(0);
    expect(vi[key].trim().length).toBeGreaterThan(0);
    const placeholders = (message: string) => [...message.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map(match => match[1]).sort();
    expect(placeholders(en[key])).toEqual(placeholders(vi[key]));
  }
});
it('uses only supported locales with Vietnamese as the default', () => {
  for (const value of [null,'fr','EN','../en',{},'']) expect(normalizeLocale(value)).toBe('vi');
  expect(normalizeLocale('en')).toBe('en');
  expect(createTranslator('vi')('common.close.wish')).toBe('Đóng lời chúc');
  expect(createTranslator('en')('common.close.wish')).toBe('Close wish');
  expect(createTranslator('vi')('fireworks.launchPreset',{ name: 'Trái tim' })).toBe('Bắn Trái tim');
  expect(createTranslator('en')('fireworks.volumeValue',{ volume: 70 })).toBe('Volume: 70%');
});

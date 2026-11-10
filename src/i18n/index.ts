import viMessages from './vi.json';
import enMessages from './en.json';

export type Locale = 'vi' | 'en';
export type MessageKey = keyof typeof viMessages;
export function normalizeLocale(value: unknown): Locale {
  return value === 'en' ? 'en' : 'vi';
}
export function createTranslator(locale: Locale) {
  const catalog = locale === 'en' ? enMessages : viMessages;
  return (key: MessageKey, values: Record<string, string | number> = {}) => {
    const message = catalog[key] || viMessages[key];
    return message.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (placeholder, name: string) =>
      Object.hasOwn(values,name) ? String(values[name]) : placeholder);
  };
}

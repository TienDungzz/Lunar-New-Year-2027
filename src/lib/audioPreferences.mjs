export const DEFAULT_VOLUME = 70;
export function normalizeVolume(value) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0,Math.min(100,Math.round(value))) : DEFAULT_VOLUME;
}

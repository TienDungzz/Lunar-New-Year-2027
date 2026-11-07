export const SHOW_DURATION_MS = 5 * 60 * 1000;
export const MAX_TEXT_CHARACTERS = 12;
export const MAX_ACTIVE_BURSTS = 8;
export const BURST_LIFETIME_MS = 9000;

export function countCharacters(value) {
  return [...new Intl.Segmenter('vi', { granularity: 'grapheme' }).segment(value.normalize('NFC').trim())].length;
}
export function validateFireworkText(value) {
  const text = value.normalize('NFC').trim();
  const count = countCharacters(text);
  if (!count) return { valid: false, text, count, error: 'empty' };
  if (count > MAX_TEXT_CHARACTERS) return { valid: false, text, count, error: 'length' };
  if (!/^[\p{L}\p{M}\p{N} !?.&+'-]+$/u.test(text) || !/[\p{L}\p{N}]/u.test(text)) return { valid: false, text, count, error: 'characters' };
  return { valid: true, text, count, error: null };
}
export function getShowCue(elapsed, index, reduced = false) {
  const opening = ['goat', 'rocket', 'cluster', 'fan', 'willow', 'burst', 'flower'];
  const main = ['goat', 'rocket', 'cluster', 'heart', 'crackle', 'double-ring', 'fan', 'butterfly', 'willow', 'waterfall', 'star', 'spiral', 'comet', 'flower', 'burst', 'palm'];
  const finale = ['fan', 'goat', 'cluster', 'rocket', 'crackle', 'willow', 'double-ring', 'burst'];
  const sequence = elapsed < 30000 ? opening : elapsed < 260000 ? main : finale;
  const interval = reduced ? 3200 : elapsed < 30000 ? 1150 : elapsed < 180000 ? 1000 : elapsed < 260000 ? 850 : 700;
  return { type: sequence[index % sequence.length], interval, strength: elapsed >= 260000 ? 1.12 : 1 };
}

// Converts an alpha bitmap to bounded, centered particle targets. Aspect ratio
// is preserved, including Vietnamese accents. The caller owns rasterization.
export function sampleTextBitmap(pixels, width, height, maxPoints = 1100) {
  const hits = [];
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y += 2) for (let x = 0; x < width; x += 2) {
    if (pixels[(y*width+x)*4+3] < 100) continue;
    hits.push([x,y]); minX = Math.min(minX,x); maxX = Math.max(maxX,x); minY = Math.min(minY,y); maxY = Math.max(maxY,y);
  }
  if (!hits.length) return [];
  const midX = (minX+maxX)/2, midY = (minY+maxY)/2;
  const scale = 6 / Math.max(maxX-minX, (maxY-minY)*1.8, 1);
  const count = Math.min(maxPoints, hits.length);
  return Array.from({ length: count }, (_, i) => {
    const [x,y] = hits[Math.floor(i*hits.length/count)];
    return [(x-midX)*scale, (midY-y)*scale, 0];
  });
}

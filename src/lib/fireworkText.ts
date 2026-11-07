import { validateFireworkText } from './fireworkShow.mjs';
import { composeGlyphSalvo } from './textSalvo.mjs';

export type TextGlyph = { character: string; center: number[]; points: number[][] };
export type TextSalvo = { points: number[][]; glyphs: TextGlyph[] };
export const textFireworkPresets = [
  { id: 'new-year', text: 'Chúc mừng năm mới', icon: 'greeting' },
  { id: 'year-2027', text: '2027', icon: 'year' },
] as const;
export async function createPresetTextSalvo(id: string): Promise<TextSalvo> {
  const preset = textFireworkPresets.find(item => item.id === id);
  if (!preset) throw Error('Unknown text preset');
  return rasterizeText(preset.text);
}
export async function createTextSalvo(value: string): Promise<TextSalvo> {
  const validation = validateFireworkText(value);
  if (!validation.valid) throw Error('Invalid firework text');
  return rasterizeText(validation.text);
}
async function rasterizeText(text: string): Promise<TextSalvo> {
  await document.fonts.load('400 90px "Tet Sans"');
  const bitmaps = [...new Intl.Segmenter('vi', { granularity: 'grapheme' }).segment(text)].map(({ segment: character }) => {
    const canvas = document.createElement('canvas');
    canvas.width = 220; canvas.height = 190;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw Error('Canvas 2D unavailable');
    context.font = '400 90px "Tet Sans", sans-serif';
    const advance = context.measureText(character).width;
    canvas.width = Math.ceil(advance)+48;
    context.font = '400 90px "Tet Sans", sans-serif';
    context.textAlign = 'left'; context.textBaseline = 'alphabetic'; context.fillStyle = '#fff';
    context.fillText(character,24,130);
    return { character, advance, width: canvas.width, height: canvas.height, padding: 24, baseline: 130,
      pixels: context.getImageData(0,0,canvas.width,canvas.height).data };
  });
  const salvo = composeGlyphSalvo(bitmaps);
  if (!salvo.glyphs.length) throw Error('Text has no visible glyphs');
  return salvo;
}

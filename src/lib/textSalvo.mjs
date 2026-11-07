export const TEXT_SALVO_POINT_BUDGET = 2400;
export const TEXT_FLIGHT_SECONDS = 1.5;
export const TEXT_SPARK_SECONDS = 6.8;
export const TEXT_FOCUS_MS = 8500;

export function getTextScale(viewWidth, viewHeight, halfWidth, halfHeight) {
  return Math.min(viewWidth*.43/Math.max(.1,halfWidth),viewHeight*.20/Math.max(.1,halfHeight));
}

// All glyphs use the same baseline and pixel scale. Spaces advance the cursor
// without creating a rocket. Each visible grapheme owns a separate shell.
export function composeGlyphSalvo(glyphs, maxPoints = TEXT_SALVO_POINT_BUDGET) {
  const visible = [];
  let cursor = 0, minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const glyph of glyphs) {
    const hits = [], padding = glyph.padding ?? 24, baseline = glyph.baseline ?? 130;
    for (let y = 0; y < glyph.height; y += 2) for (let x = 0; x < glyph.width; x += 2) {
      if (glyph.pixels[(y*glyph.width+x)*4+3] < 100) continue;
      const px = cursor+x-padding, py = baseline-y;
      hits.push([px,py]); minX = Math.min(minX,px); maxX = Math.max(maxX,px); minY = Math.min(minY,py); maxY = Math.max(maxY,py);
    }
    if (hits.length) visible.push({ character: glyph.character, center: cursor+glyph.advance/2, hits });
    cursor += glyph.advance+6;
  }
  if (!visible.length) return { glyphs: [], points: [] };
  const midX = (minX+maxX)/2, midY = (minY+maxY)/2;
  const scale = 6/Math.max(maxX-minX,(maxY-minY)*1.8,1);
  const ink = visible.reduce((sum,glyph) => sum+glyph.hits.length,0);
  const budget = Math.max(0,maxPoints-visible.length);
  const letters = visible.map(glyph => {
    const count = Math.min(glyph.hits.length,1+Math.floor(budget*glyph.hits.length/ink));
    const center = [(glyph.center-midX)*scale,0,0];
    const points = Array.from({ length: count }, (_, i) => {
      const [x,y] = glyph.hits[Math.floor(i*glyph.hits.length/count)];
      return [(x-glyph.center)*scale,(y-midY)*scale,0];
    });
    return { character: glyph.character, center, points };
  });
  return { glyphs: letters, points: letters.flatMap(glyph => glyph.points.map(point => [point[0]+glyph.center[0],point[1],point[2]])) };
}

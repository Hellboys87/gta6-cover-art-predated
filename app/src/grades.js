// Colour grades for Neon Coast: each grade is a gradient map (shadows -> mids -> highlights)
// plus a blend strength and a saturation nudge. Grading happens once per photo per grade on an
// offscreen canvas, then the renderer blits the graded copy into every panel that uses it.

export const GRADES = [
  {
    id: 'vice-sunset', name: 'Vice Sunset',
    stops: [[0, '#160a2e'], [0.32, '#5c1a4d'], [0.58, '#e8486b'], [0.8, '#ff8a3d'], [1, '#ffe9a8']],
    blend: 0.62, saturation: 1.18, contrast: 1.06,
  },
  {
    id: 'neon-nights', name: 'Neon Nights',
    stops: [[0, '#02181f'], [0.35, '#0b3d5c'], [0.62, '#c62b8f'], [0.85, '#ff5e7a'], [1, '#a8fbff']],
    blend: 0.78, saturation: 1.3, contrast: 1.1,
  },
  {
    id: 'golden-hour', name: 'Golden Hour',
    stops: [[0, '#241103'], [0.35, '#6e3410'], [0.62, '#d97b2b'], [0.85, '#ffc44d'], [1, '#fff6d8']],
    blend: 0.55, saturation: 1.12, contrast: 1.03,
  },
  {
    id: 'midnight', name: 'Midnight',
    stops: [[0, '#020610'], [0.35, '#0d2440'], [0.62, '#2f639e'], [0.85, '#7db4e6'], [1, '#eaf6ff']],
    blend: 0.66, saturation: 0.82, contrast: 1.12,
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// A 256-entry lookup table: grey level in, gradient-mapped [r, g, b] out.
export function buildGradientLut(grade) {
  const stops = grade.stops.map(([at, hex]) => [at * 255, hexToRgb(hex)]);
  const lut = new Uint8Array(256 * 3);
  for (let v = 0; v < 256; v++) {
    let a = stops[0];
    let b = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
      if (v >= stops[i][0] && v <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break; }
    }
    const span = Math.max(1, b[0] - a[0]);
    const t = Math.min(1, Math.max(0, (v - a[0]) / span));
    for (let c = 0; c < 3; c++) lut[v * 3 + c] = Math.round(a[1][c] + (b[1][c] - a[1][c]) * t);
  }
  return lut;
}

const gradedCache = new Map();

// Returns a canvas holding `image` re-coloured by the grade. Cached: panels share one copy.
export function gradedCopy(image, gradeId) {
  const key = `${gradeId}|${image.dataset?.coastId ?? image.src ?? ''}|${image.naturalWidth}x${image.naturalHeight}`;
  if (gradedCache.has(key)) return gradedCache.get(key);
  const grade = gradeById(gradeId);
  const lut = buildGradientLut(grade);
  const maxSide = 1280;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const w = Math.max(1, Math.round(image.naturalWidth * scale));
  const h = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, w, h);
  const frame = ctx.getImageData(0, 0, w, h);
  const px = frame.data;
  const blend = grade.blend;
  const keep = 1 - blend;
  const sat = grade.saturation;
  const con = grade.contrast;
  for (let i = 0; i < px.length; i += 4) {
    let r = px[i];
    let g = px[i + 1];
    let b = px[i + 2];
    // Contrast around mid-grey, then saturation around the pixel's own luminance.
    r = (r - 128) * con + 128;
    g = (g - 128) * con + 128;
    b = (b - 128) * con + 128;
    const lum = Math.min(255, Math.max(0, Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b)));
    r = lum + (r - lum) * sat;
    g = lum + (g - lum) * sat;
    b = lum + (b - lum) * sat;
    const base = Math.min(255, Math.max(0, Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b)));
    const li = base * 3;
    px[i] = Math.min(255, Math.max(0, r * keep + lut[li] * blend));
    px[i + 1] = Math.min(255, Math.max(0, g * keep + lut[li + 1] * blend));
    px[i + 2] = Math.min(255, Math.max(0, b * keep + lut[li + 2] * blend));
  }
  ctx.putImageData(frame, 0, 0);
  gradedCache.set(key, canvas);
  return canvas;
}

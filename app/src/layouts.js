// Poster layouts for Neon Coast. Panels are fractions of the poster (x, y, w, h in 0..1),
// so the same arrangement works at square, poster and wide export sizes. The lettering is
// drawn over the panels afterwards, the way a real cover's title sits on the art.

export const LAYOUTS = [
  {
    id: 'grid-six', name: 'Panel Grid · 6',
    panels: [
      { x: 0.0, y: 0.0, w: 0.34, h: 0.54 },
      { x: 0.34, y: 0.0, w: 0.33, h: 0.54 },
      { x: 0.67, y: 0.0, w: 0.33, h: 0.54 },
      { x: 0.0, y: 0.54, w: 0.34, h: 0.46 },
      { x: 0.34, y: 0.54, w: 0.33, h: 0.46 },
      { x: 0.67, y: 0.54, w: 0.33, h: 0.46 },
    ],
  },
  {
    id: 'hero-three', name: 'Hero + Three',
    panels: [
      { x: 0.0, y: 0.0, w: 0.62, h: 1.0 },
      { x: 0.62, y: 0.0, w: 0.38, h: 0.34 },
      { x: 0.62, y: 0.34, w: 0.38, h: 0.33 },
      { x: 0.62, y: 0.67, w: 0.38, h: 0.33 },
    ],
  },
  {
    id: 'full-bleed', name: 'Full Bleed',
    panels: [
      { x: 0.0, y: 0.0, w: 1.0, h: 1.0 },
    ],
  },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

// Pixel rectangle for panel `index` on a W x H poster, shrunk by the white gutter.
export function panelRect(layout, index, W, H, gutter) {
  const p = layout.panels[index % layout.panels.length];
  return {
    x: p.x * W + gutter / 2,
    y: p.y * H + gutter / 2,
    w: p.w * W - gutter,
    h: p.h * H - gutter,
  };
}

// Which panel (index) contains poster point (px, py), or -1 when it lands on a gutter.
export function panelAt(layout, px, py, W, H) {
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const p = layout.panels[i];
    if (px >= p.x * W && px <= (p.x + p.w) * W && py >= p.y * H && py <= (p.y + p.h) * H) return i;
  }
  return -1;
}

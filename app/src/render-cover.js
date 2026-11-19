// The Neon Coast poster renderer: graded photos into a panel layout, a warm sky wash over
// the seams, then the lettering. Pure canvas — the same function paints the live preview,
// the screenshot scenes and the exported PNG, so what you see is what downloads.

import { gradedCopy } from './grades.js';
import { layoutById, panelRect } from './layouts.js';
import { drawLettering } from './lettering.js';

// state = {
//   layoutId, gradeId,
//   slots: [{ image, panX, panY, zoom }]  one entry per panel (image may be null),
//   title, subtitle, caption, heat, showHeat, showBadge,
//   selected: index or -1, showSelection: bool
// }

function paintSky(ctx, W, H) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#2b1052');
  sky.addColorStop(0.45, '#8f2a6b');
  sky.addColorStop(0.75, '#ff7a3d');
  sky.addColorStop(1, '#2a0f33');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // A low sun disc behind the panels, visible in the gutters.
  const sunR = Math.min(W, H) * 0.30;
  const sun = ctx.createRadialGradient(W * 0.5, H * 0.46, 0, W * 0.5, H * 0.46, sunR);
  sun.addColorStop(0, 'rgba(255, 224, 150, 0.95)');
  sun.addColorStop(0.7, 'rgba(255, 150, 80, 0.55)');
  sun.addColorStop(1, 'rgba(255, 120, 90, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, W, H);
}

function paintPanel(ctx, rect, slot, gradeId) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (slot?.image) {
    const art = gradedCopy(slot.image, gradeId);
    const iw = art.width;
    const ih = art.height;
    const zoom = slot.zoom ?? 1;
    const scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
    const dw = iw * scale;
    const dh = ih * scale;
    const cx = rect.x + rect.w / 2 + (slot.panX ?? 0) * rect.w * 0.5;
    const cy = rect.y + rect.h / 2 + (slot.panY ?? 0) * rect.h * 0.5;
    ctx.drawImage(art, cx - dw / 2, cy - dh / 2, dw, dh);
  } else {
    ctx.fillStyle = '#3a1c5e';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  // A whisper of shade at each panel foot grounds the composition.
  const shade = ctx.createLinearGradient(0, rect.y + rect.h * 0.6, 0, rect.y + rect.h);
  shade.addColorStop(0, 'rgba(16, 3, 28, 0)');
  shade.addColorStop(1, 'rgba(16, 3, 28, 0.30)');
  ctx.fillStyle = shade;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

export function renderCover(ctx, W, H, state) {
  const layout = layoutById(state.layoutId);
  const gutter = Math.max(6, Math.min(W, H) * 0.012);
  paintSky(ctx, W, H);
  layout.panels.forEach((_, i) => {
    const rect = panelRect(layout, i, W, H, gutter);
    paintPanel(ctx, rect, state.slots[i], state.gradeId);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.lineWidth = Math.max(2, gutter * 0.32);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });
  // Outer frame line, like a printed poster's trim.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = Math.max(3, gutter * 0.5);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);

  drawLettering(ctx, W, H, state);

  if (state.showSelection && state.selected >= 0) {
    const rect = panelRect(layout, state.selected, W, H, gutter);
    ctx.save();
    ctx.strokeStyle = '#2ee6c8';
    ctx.lineWidth = Math.max(3, gutter * 0.45);
    ctx.setLineDash([gutter * 1.1, gutter * 0.7]);
    ctx.strokeRect(rect.x - gutter * 0.3, rect.y - gutter * 0.3, rect.w + gutter * 0.6, rect.h + gutter * 0.6);
    ctx.restore();
  }
}

// Poster lettering for Neon Coast: a heavy gradient title with a dark outline and a slight
// italic lean, a handwritten subtitle, a caption bar along the foot, a row of heat stars and
// a small diagonal badge. All type is drawn on canvas with the bundled display fonts.

export const DISPLAY_FONT = '"AntonCoast", "Arial Black", sans-serif';
export const SCRIPT_FONT = '"PacificoCoast", "Comic Sans MS", cursive';

function fitFontSize(ctx, text, fontFamily, weight, maxWidth, startSize) {
  let size = startSize;
  while (size > 14) {
    ctx.font = `${weight} ${size}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  }
  return size;
}

// Five-point star path centred on (cx, cy).
function starPath(ctx, cx, cy, radius) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawHeatStars(ctx, W, H, heat) {
  const n = Math.max(0, Math.min(5, Math.round(heat)));
  if (n === 0) return;
  const r = Math.min(W, H) * 0.026;
  const gap = r * 2.5;
  const total = gap * 4;
  const cy = H * 0.965;
  let cx = W / 2 - total / 2;
  for (let i = 0; i < 5; i++) {
    starPath(ctx, cx, cy, r);
    if (i < n) {
      ctx.fillStyle = '#ffc44d';
      ctx.strokeStyle = 'rgba(20, 6, 24, 0.85)';
      ctx.lineWidth = r * 0.16;
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.fill();
    }
    cx += gap;
  }
}

function drawBadge(ctx, W, H) {
  const bw = W * 0.30;
  const bh = H * 0.042;
  ctx.save();
  // Kept fully inside the trim: the tilt lifts one corner, so the ribbon sits a
  // little lower and further in than a flush corner badge would.
  ctx.translate(W - bw * 0.58, bh * 1.65);
  ctx.rotate(0.06);
  ctx.fillStyle = '#ff4f9a';
  ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(1.5, bh * 0.07);
  ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${bh * 0.44}px "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ORIGINAL · FAN MADE', 0, bh * 0.03);
  ctx.restore();
}

// Draws every text layer. `words` = { title, subtitle, caption, heat, showHeat, showBadge }.
export function drawLettering(ctx, W, H, words) {
  const short = Math.min(W, H);
  // Soft darkening behind the title and the foot so type stays readable on busy photos.
  const topShade = ctx.createLinearGradient(0, 0, 0, H * 0.30);
  topShade.addColorStop(0, 'rgba(10, 2, 20, 0.55)');
  topShade.addColorStop(1, 'rgba(10, 2, 20, 0)');
  ctx.fillStyle = topShade;
  ctx.fillRect(0, 0, W, H * 0.30);
  const footShade = ctx.createLinearGradient(0, H * 0.78, 0, H);
  footShade.addColorStop(0, 'rgba(10, 2, 20, 0)');
  footShade.addColorStop(1, 'rgba(10, 2, 20, 0.62)');
  ctx.fillStyle = footShade;
  ctx.fillRect(0, H * 0.78, W, H * 0.22);

  const title = (words.title ?? '').trim().toUpperCase();
  if (title) {
    const size = fitFontSize(ctx, title, DISPLAY_FONT, '400', W * 0.94, short * 0.155);
    ctx.save();
    ctx.translate(W / 2, H * 0.055 + size * 0.82);
    ctx.transform(1, 0, -0.09, 1, 0, 0); // the poster lean
    ctx.font = `400 ${size}px ${DISPLAY_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const grad = ctx.createLinearGradient(0, -size, 0, size * 0.25);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.45, '#ffe9a8');
    grad.addColorStop(0.78, '#ff9e5e');
    grad.addColorStop(1, '#ff4f9a');
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#180722';
    ctx.lineWidth = size * 0.20;
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.14;
    ctx.shadowOffsetY = size * 0.05;
    ctx.strokeText(title, 0, 0);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = grad;
    ctx.fillText(title, 0, 0);
    ctx.restore();
  }

  const subtitle = (words.subtitle ?? '').trim();
  if (subtitle) {
    const size = fitFontSize(ctx, subtitle, SCRIPT_FONT, '400', W * 0.8, short * 0.052);
    ctx.font = `400 ${size}px ${SCRIPT_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.save();
    ctx.translate(W / 2, H * 0.055 + short * 0.155 + size * 1.15);
    ctx.rotate(-0.025);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(24, 7, 34, 0.9)';
    ctx.lineWidth = size * 0.16;
    ctx.strokeText(subtitle, 0, 0);
    ctx.fillStyle = '#7df9e8';
    ctx.fillText(subtitle, 0, 0);
    ctx.restore();
  }

  const caption = (words.caption ?? '').trim();
  if (caption) {
    const size = fitFontSize(ctx, caption.toUpperCase(), DISPLAY_FONT, '400', W * 0.9, short * 0.042);
    ctx.font = `400 ${size}px ${DISPLAY_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const y = words.showHeat && words.heat > 0 ? H * 0.925 : H * 0.955;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(24, 7, 34, 0.92)';
    ctx.lineWidth = size * 0.22;
    ctx.strokeText(caption.toUpperCase(), W / 2, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(caption.toUpperCase(), W / 2, y);
  }

  if (words.showHeat) drawHeatStars(ctx, W, H, words.heat ?? 0);
  if (words.showBadge) drawBadge(ctx, W, H);
}

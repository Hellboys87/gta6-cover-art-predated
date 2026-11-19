// Neon Coast Cover Studio — editor wiring.
// Loads photos (the visitor's own files stay on their machine; bundled samples are offered
// as starters), keeps one slot per layout panel, and re-renders the poster on every change.
// Deterministic scenes for screenshots arrive as ?shot=cover-wide / cover-tall /
// cover-square / editor and paint a fixed arrangement from the samples.

import { GRADES } from './grades.js';
import { LAYOUTS, layoutById, panelAt } from './layouts.js';
import { renderCover } from './render-cover.js';

const SAMPLES = [
  { id: 'pier', label: 'Pier', src: 'samples/pier.jpg' },
  { id: 'boulevard', label: 'Boulevard', src: 'samples/boulevard.jpg' },
  { id: 'neon-street', label: 'Neon Street', src: 'samples/neon-street.jpg' },
  { id: 'rooftop', label: 'Rooftop', src: 'samples/rooftop.jpg' },
];

const canvas = document.getElementById('poster');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const state = {
  layoutId: 'grid-six',
  gradeId: 'vice-sunset',
  slots: [],
  selected: 0,
  title: 'NEON COAST',
  subtitle: 'welcome to Leonida nights',
  caption: 'One last ride down Ocean Drive',
  heat: 5,
  showHeat: true,
  showBadge: true,
  fillAll: false,
};

let coastCounter = 0;

function note(text) {
  if (statusEl) statusEl.textContent = text;
}

export function loadPhoto(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      img.dataset.coastId = `photo-${coastCounter++}`;
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

function blankSlot(image = null) {
  return { image, panX: 0, panY: 0, zoom: 1 };
}

// Keeps the slot list matched to the current layout, recycling photos where possible.
function syncSlots() {
  const count = layoutById(state.layoutId).panels.length;
  const kept = [];
  for (let i = 0; i < count; i++) kept.push(state.slots[i] ?? blankSlot(state.slots[0]?.image ?? null));
  state.slots = kept;
  if (state.selected >= count) state.selected = 0;
}

function redraw(showSelection = true) {
  renderCover(ctx, canvas.width, canvas.height, { ...state, showSelection });
}

function assignPhoto(image) {
  if (state.fillAll) {
    state.slots = state.slots.map((s) => ({ ...s, image }));
  } else {
    state.slots[state.selected] = { ...state.slots[state.selected], image };
  }
  redraw();
}

// --- fonts ---------------------------------------------------------------
async function loadDisplayFonts() {
  const jobs = [];
  try {
    const anton = new FontFace('AntonCoast', "url('./fonts/Anton-Regular.ttf')");
    const pacifico = new FontFace('PacificoCoast', "url('./fonts/Pacifico-Regular.ttf')");
    jobs.push(anton.load().then((f) => document.fonts.add(f)));
    jobs.push(pacifico.load().then((f) => document.fonts.add(f)));
    await Promise.all(jobs);
  } catch {
    // Bundled fonts unavailable: the lettering falls back to a heavy local stack.
  }
}

// --- controls ------------------------------------------------------------
function segmentedRow(el, items, currentId, onPick) {
  el.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = item.name ?? item.label;
    if (item.id === currentId) b.classList.add('active');
    b.addEventListener('click', () => {
      onPick(item.id);
      segmentedRow(el, items, item.id, onPick);
    });
    el.appendChild(b);
  }
}

function wireControls(sampleImages) {
  const sampleRow = document.getElementById('sample-row');
  for (const sample of SAMPLES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = sample.label;
    b.addEventListener('click', () => {
      assignPhoto(sampleImages.get(sample.id));
      note(`${sample.label} placed in ${state.fillAll ? 'every panel' : `panel ${state.selected + 1}`}.`);
    });
    sampleRow.appendChild(b);
  }

  document.getElementById('photo-input').addEventListener('change', async (event) => {
    const files = [...event.target.files];
    if (!files.length) return;
    for (const file of files) {
      const image = await loadPhoto(URL.createObjectURL(file));
      assignPhoto(image);
      if (!state.fillAll && state.selected < state.slots.length - 1) state.selected++;
    }
    note(files.length === 1 ? 'Your photo is on the poster.' : `${files.length} photos placed.`);
    redraw();
  });

  document.getElementById('fill-all').addEventListener('change', (e) => {
    state.fillAll = e.target.checked;
  });

  const zoom = document.getElementById('zoom');
  const zoomValue = document.getElementById('zoom-value');
  zoom.addEventListener('input', () => {
    const slot = state.slots[state.selected];
    if (slot) slot.zoom = Number(zoom.value) / 100;
    zoomValue.textContent = `${zoom.value}%`;
    redraw();
  });

  segmentedRow(document.getElementById('layout-row'), LAYOUTS, state.layoutId, (id) => {
    state.layoutId = id;
    syncSlots();
    document.getElementById('zoom').value = String(Math.round((state.slots[state.selected]?.zoom ?? 1) * 100));
    document.getElementById('zoom-value').textContent = `${Math.round((state.slots[state.selected]?.zoom ?? 1) * 100)}%`;
    redraw();
  });
  segmentedRow(document.getElementById('grade-row'), GRADES, state.gradeId, (id) => {
    state.gradeId = id;
    redraw();
  });

  const bindText = (id, key) => {
    document.getElementById(id).addEventListener('input', (e) => {
      state[key] = e.target.value;
      redraw();
    });
  };
  bindText('title-input', 'title');
  bindText('subtitle-input', 'subtitle');
  bindText('caption-input', 'caption');

  document.getElementById('heat-toggle').addEventListener('change', (e) => {
    state.showHeat = e.target.checked;
    redraw();
  });
  document.getElementById('heat').addEventListener('input', (e) => {
    state.heat = Number(e.target.value);
    document.getElementById('heat-value').textContent = e.target.value;
    redraw();
  });
  document.getElementById('badge-toggle').addEventListener('change', (e) => {
    state.showBadge = e.target.checked;
    redraw();
  });

  document.getElementById('size-select').addEventListener('change', (e) => {
    const [w, h] = e.target.value.split('x').map(Number);
    canvas.width = w;
    canvas.height = h;
    redraw();
  });

  document.getElementById('export-btn').addEventListener('click', () => {
    redraw(false);
    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `neon-coast-cover-${canvas.width}x${canvas.height}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      note(`Saved neon-coast-cover-${canvas.width}x${canvas.height}.png`);
      redraw(true);
    }, 'image/png');
  });

  // Panel select + drag to pan.
  let dragging = null;
  const toPosterPoint = (event) => {
    const box = canvas.getBoundingClientRect();
    return [
      ((event.clientX - box.left) / box.width) * canvas.width,
      ((event.clientY - box.top) / box.height) * canvas.height,
    ];
  };
  canvas.addEventListener('pointerdown', (event) => {
    const [px, py] = toPosterPoint(event);
    const hit = panelAt(layoutById(state.layoutId), px, py, canvas.width, canvas.height);
    if (hit >= 0) state.selected = hit;
    const slot = state.slots[state.selected];
    if (slot) {
      document.getElementById('zoom').value = String(Math.round(slot.zoom * 100));
      document.getElementById('zoom-value').textContent = `${Math.round(slot.zoom * 100)}%`;
    }
    dragging = { x: px, y: py };
    canvas.setPointerCapture(event.pointerId);
    redraw();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const [px, py] = toPosterPoint(event);
    const slot = state.slots[state.selected];
    if (slot) {
      slot.panX = Math.max(-1, Math.min(1, slot.panX + ((px - dragging.x) / canvas.width) * 2));
      slot.panY = Math.max(-1, Math.min(1, slot.panY + ((py - dragging.y) / canvas.height) * 2));
    }
    dragging = { x: px, y: py };
    redraw();
  });
  const stopDrag = () => { dragging = null; };
  canvas.addEventListener('pointerup', stopDrag);
  canvas.addEventListener('pointercancel', stopDrag);
}

// --- screenshot scenes -----------------------------------------------------
const SHOT_SCENES = {
  'cover-wide': { w: 1920, h: 1080, layoutId: 'grid-six', gradeId: 'vice-sunset', title: 'NEON COAST', subtitle: 'welcome to Leonida nights', caption: 'One last ride down Ocean Drive', order: ['neon-street', 'pier', 'rooftop', 'boulevard', 'pier', 'neon-street'] },
  'cover-tall': { w: 1080, h: 1350, layoutId: 'hero-three', gradeId: 'neon-nights', title: 'MIDNIGHT HEAT', subtitle: 'the city pays in neon', caption: 'Every saint has a price', order: ['rooftop', 'neon-street', 'boulevard', 'pier'] },
  'cover-square': { w: 1080, h: 1080, layoutId: 'grid-six', gradeId: 'golden-hour', title: 'GOLDEN HOUR', subtitle: 'vice tastes sweet', caption: 'Sunset is just the starting gun', order: ['boulevard', 'rooftop', 'pier', 'neon-street', 'rooftop', 'boulevard'] },
};

async function loadSamples() {
  const map = new Map();
  for (const sample of SAMPLES) map.set(sample.id, await loadPhoto(sample.src));
  return map;
}

function fillFromOrder(order, sampleImages) {
  state.slots = order.map((id, i) => {
    const slot = blankSlot(sampleImages.get(id));
    slot.panX = i % 2 === 0 ? 0.04 : -0.04;
    return slot;
  });
}

async function runShotScene(name, sampleImages) {
  if (name === 'editor') {
    state.layoutId = 'grid-six';
    state.gradeId = 'vice-sunset';
    syncSlots();
    fillFromOrder(['pier', 'neon-street', 'boulevard', 'rooftop', 'neon-street', 'pier'], sampleImages);
    state.selected = 1;
    state.title = 'NEON COAST';
    state.subtitle = 'welcome to Leonida nights';
    state.caption = 'One last ride down Ocean Drive';
    wireControls(sampleImages);
    redraw(true);
    return;
  }
  const scene = SHOT_SCENES[name] ?? SHOT_SCENES['cover-square'];
  document.body.classList.add('shot');
  canvas.width = scene.w;
  canvas.height = scene.h;
  state.layoutId = scene.layoutId;
  state.gradeId = scene.gradeId;
  state.title = scene.title;
  state.subtitle = scene.subtitle;
  state.caption = scene.caption;
  syncSlots();
  fillFromOrder(scene.order, sampleImages);
  state.selected = -1;
  redraw(false);
}

// --- boot ------------------------------------------------------------------
async function boot() {
  syncSlots();
  redraw(false);
  const sampleImages = await loadSamples();
  await loadDisplayFonts();
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    await runShotScene(shot, sampleImages);
  } else {
    fillFromOrder(['pier', 'boulevard', 'neon-street', 'rooftop', 'boulevard', 'pier'], sampleImages);
    wireControls(sampleImages);
    redraw(true);
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

boot();

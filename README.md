[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Hellboys87/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Hellboys87/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Neon Coast Cover Studio

Turn your own photos plus a caption into GTA-style multi-panel cover art — Vice City / Leonida
neon-sunset energy, rendered entirely in the browser on canvas and exported as a PNG. Load a
photo, pick a layout and a colour grade, write your lettering, export. A few steps, no uploads,
no network: your photos never leave your machine.

## Features

- **Three layouts** — a six-panel poster grid, a hero panel plus three, and a full-bleed cover.
- **Per-panel art direction** — one photo can fill every panel or each panel can hold its own;
  click a panel to select it, drag on the poster to pan, and zoom with the slider.
- **Four real colour grades** — Vice Sunset, Neon Nights, Golden Hour and Midnight, applied as
  gradient-map / duotone grading per pixel on canvas.
- **Poster lettering** — a big gradient display title with a dark outline and italic lean, a
  script subtitle, an editable caption, a toggleable five-star "heat" row and a small badge.
- **Exports** — PNG at 1080×1080, 1080×1350 and 1920×1080, with a live preview that re-renders
  on every change. Four bundled sample photos are included as starters.
- **Bundled display fonts** — Anton and Pacifico (SIL Open Font License, see `app/fonts/OFL.txt`),
  loaded locally via FontFace; the app runs fully offline.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser.

This is an original fan-made tool: all artwork, lettering and code are original, and it uses no
Rockstar logos, wordmarks, official artwork, characters or game fonts.

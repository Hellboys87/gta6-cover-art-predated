// Neon Coast Cover Studio — hand-in program for gta6-cover-art-01 (Node, standard library only).
// The entry itself is the static offline app in app/ beside this file. This program copies app/
// and screenshots/ into the output directory and writes dossier.json there with the vendored
// make.fun library, using the scorer's own caps so an oversized entry fails here first.
//
//   MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const entryDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(entryDir, 'app'), join(outputDir, 'app'), { recursive: true });

const shotsDir = join(outputDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
const localShots = join(entryDir, 'screenshots');
if (existsSync(localShots)) {
  cpSync(localShots, shotsDir, { recursive: true });
}

// The scorer's caps, mirrored here so an entry the scorer would refuse fails at hand-in time.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};
writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, dossierCaps));
console.log(`Neon Coast Cover Studio handed in: app/ and screenshots/ copied to ${outputDir}, dossier.json written.`);

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videoPath = path.resolve(__dirname, '..', 'Untitled design.mp4');
const publicDir = path.resolve(__dirname, 'public');

const TIERS = [
  { name: 'frames',    width: 1920 },
  { name: 'frames@2x', width: 3840 },
];

for (const tier of TIERS) {
  const outDir = path.join(publicDir, tier.name);
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of fs.readdirSync(outDir)) {
    if (f.startsWith('frame_') && f.endsWith('.jpg')) fs.unlinkSync(path.join(outDir, f));
  }

  console.log(`\nExtracting ${tier.width}px frames → ${outDir}`);
  // -qscale:v 1 is ffmpeg's max-quality JPEG (lower number = higher quality).
  // scale=W:-2 preserves aspect ratio and forces an even height (required by some encoders).
  const cmd = `"${ffmpeg}" -y -i "${videoPath}" -vf "fps=30,scale=${tier.width}:-2:flags=lanczos" -qscale:v 1 "${outDir}/frame_%04d.jpg"`;
  execSync(cmd, { stdio: 'inherit' });
}

console.log('\nExtraction complete.');

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videoPath1 = path.resolve(__dirname, 'public', 'flow.mp4');
const videoPath2 = path.resolve(__dirname, 'public', 'mp_.mp4');
const publicDir = path.resolve(__dirname, 'public');

// Ensure execution permissions on ffmpeg binary (crucial for Vercel/Linux environments)
if (ffmpeg) {
  try {
    fs.chmodSync(ffmpeg, 0o755);
    console.log(`Successfully set execution permissions (0755) for ffmpeg binary at: ${ffmpeg}`);
  } catch (e) {
    console.warn(`Warning: Could not set execution permissions for ffmpeg: ${e.message}`);
  }
} else {
  console.error("Error: ffmpeg-static could not find a valid ffmpeg binary.");
  process.exit(1);
}

// We only need the 1x frames (1920px) since the optimized WebGL canvas handles sharp rendering 
// and high DPR displays extremely efficiently without needing 3840px raw frames (which cause 4K lag and huge build sizes).
const TIERS = [
  { name: 'frames', width: 1920 }
];

for (const tier of TIERS) {
  const outDir = path.join(publicDir, tier.name);
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of fs.readdirSync(outDir)) {
    if (f.startsWith('frame_') && f.endsWith('.jpg')) {
      fs.unlinkSync(path.join(outDir, f));
    }
  }

  console.log(`\nExtracting ${tier.width}px frames → ${outDir}`);
  // -qscale:v 1 is ffmpeg's max-quality JPEG (lower number = higher quality).
  const filter = `[0:v]scale=1280:720,fps=30,format=yuv420p,trim=start=0:end=7.5,setpts=PTS-STARTPTS[v0]; [1:v]scale=1280:720,fps=30,format=yuv420p,setpts=PTS-STARTPTS[v1]; [v0][v1]xfade=transition=fade:duration=1:offset=6.5[v_fade]; [v_fade]scale=${tier.width}:-2:flags=lanczos[out]`;
  const cmd = `"${ffmpeg}" -y -i "${videoPath1}" -i "${videoPath2}" -filter_complex "${filter}" -map "[out]" -qscale:v 1 "${outDir}/frame_%04d.jpg"`;
  
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Error running ffmpeg extraction command: ${err.message}`);
    if (err.stdout) console.log(`stdout: ${err.stdout.toString()}`);
    if (err.stderr) console.error(`stderr: ${err.stderr.toString()}`);
    process.exit(1);
  }
}

console.log('\nExtraction complete.');

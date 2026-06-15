// Copy the @ricky0123/vad-web + onnxruntime-web runtime assets into
// public/vad/ so they're served from the site origin. We point the MicVAD
// constructor at /vad/ via baseAssetPath/onnxWASMBasePath. Self-hosting
// avoids CDN-blocked-by-CSP issues and keeps everything first-party.
//
// Runs from `prebuild` so Vercel picks it up automatically.

import { createRequire } from 'node:module';
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const publicVadDir = join(projectRoot, 'public', 'vad');
const require = createRequire(import.meta.url);

mkdirSync(publicVadDir, { recursive: true });

// vad-web is a direct dep, so we can resolve it from this project. onnxruntime-web
// is a transitive dep of vad-web — under pnpm it's only visible from vad-web's own
// node_modules, so we resolve it through a require rooted at the vad-web entry.
const vadEntry = require.resolve('@ricky0123/vad-web');
const vadDist = dirname(vadEntry); // .../@ricky0123/vad-web/dist
const requireFromVad = createRequire(vadEntry);
// onnxruntime-web's package.json blocks subpath resolution, but the `./wasm`
// export resolves to a file inside its dist/, which is what we want.
const ortDistWasm = dirname(requireFromVad.resolve('onnxruntime-web/wasm'));

const vadFiles = [
  'silero_vad_legacy.onnx',
  'silero_vad_v5.onnx',
  'vad.worklet.bundle.min.js',
];

const ortFiles = [
  'ort-wasm-simd-threaded.mjs',
  'ort-wasm-simd-threaded.wasm',
  'ort-wasm-simd-threaded.jsep.mjs',
  'ort-wasm-simd-threaded.jsep.wasm',
  'ort-wasm-simd-threaded.asyncify.mjs',
  'ort-wasm-simd-threaded.asyncify.wasm',
  'ort-wasm-simd-threaded.jspi.mjs',
  'ort-wasm-simd-threaded.jspi.wasm',
];

function copy(srcDir, file) {
  const src = join(srcDir, file);
  if (!existsSync(src)) {
    console.warn(`[copy-vad-assets] skip missing: ${src}`);
    return;
  }
  copyFileSync(src, join(publicVadDir, file));
}

for (const f of vadFiles) copy(vadDist, f);
for (const f of ortFiles) copy(ortDistWasm, f);

console.log(`[copy-vad-assets] copied ${vadFiles.length + ortFiles.length} files to ${publicVadDir}`);

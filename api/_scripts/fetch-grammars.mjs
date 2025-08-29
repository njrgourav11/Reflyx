import { createWriteStream } from 'node:fs';
import { mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.resolve(__dirname, '../_lib/indexer/grammars');

const assets = [
  // NOTE: Replace these URLs with actual WASM assets you host or from a reliable source
  { url: 'https://example.com/tree-sitter-javascript.wasm', file: 'tree-sitter-javascript.wasm' },
  { url: 'https://example.com/tree-sitter-typescript.wasm', file: 'tree-sitter-typescript.wasm' },
];

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  await new Promise((resolve, reject) => {
    const fileStream = createWriteStream(dest);
    res.body.pipe(fileStream);
    res.body.on('error', reject);
    fileStream.on('finish', resolve);
  });
}

(async () => {
  try {
    await mkdir(outDir, { recursive: true });
    for (const a of assets) {
      const dest = path.join(outDir, a.file);
      try {
        await access(dest);
        console.log(`Exists: ${dest}`);
      } catch {
        console.log(`Downloading ${a.url} -> ${dest}`);
        await download(a.url, dest);
      }
    }
    console.log('Grammar fetch complete');
  } catch (e) {
    console.error('Grammar fetch failed', e);
    process.exit(1);
  }
})();


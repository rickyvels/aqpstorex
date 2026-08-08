// Descarga las imágenes del manifiesto a public/img/. Reanudable: omite las ya bajadas.
// Uso: node scripts/fetch-images.mjs
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { dirname } from 'node:path';

const manifest = JSON.parse(readFileSync('data/images.manifest.json', 'utf8'));
const CONCURRENCY = 8;

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/png,image/jpeg',
  'Accept-Language': 'es-PE,es;q=0.9',
  Referer: 'https://tradingstore.pe/tienda/',
};

let ok = 0;
let skip = 0;
let fail = 0;
const failures = [];

async function download({ url, dest }) {
  if (existsSync(dest) && statSync(dest).size > 0) {
    skip++;
    return;
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length === 0) throw new Error('vacío');
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, buf);
      ok++;
      return;
    } catch (err) {
      if (attempt === 3) {
        fail++;
        failures.push({ url, dest, error: String(err.message || err) });
        return;
      }
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

const queue = [...manifest];
let done = 0;
const total = queue.length;

async function worker() {
  while (queue.length) {
    const item = queue.shift();
    await download(item);
    done++;
    if (done % 50 === 0 || done === total) {
      process.stdout.write(`\r${done}/${total}  ok:${ok} omitidas:${skip} fallos:${fail}   `);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log('');
if (failures.length) {
  writeFileSync('data/images.failures.json', JSON.stringify(failures, null, 2));
  console.log(`Fallos guardados en data/images.failures.json (${failures.length})`);
}
console.log(`Listo. Descargadas ${ok}, omitidas ${skip}, fallidas ${fail}.`);

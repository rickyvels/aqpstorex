// Prueba de humo del gate B2B: compara respuestas sin sesión y con sesión.
// Uso: node scripts/smoke-auth.mjs
import { SignJWT } from 'jose';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'desarrollo-inseguro-cambiar-en-produccion-aqpstorex',
);

const token = await new SignJWT({ ruc: '20123456789', razonSocial: 'Cliente Demo S.A.C.' })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('8h')
  .sign(secret);

const cookie = `aqpx_session=${token}`;
let failures = 0;

async function check(label, path, { auth = false, expect = 200 } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: auth ? { cookie } : {},
    redirect: 'manual',
  });
  const body = res.status === 200 ? await res.text() : '';
  const ok = res.status === expect;
  if (!ok) failures++;
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label.padEnd(46)} ${res.status} (esperado ${expect})`);
  return body;
}

console.log('--- Sin sesión ---');
const anonShop = await check('GET /tienda', '/tienda');
await check('GET /distribucion → redirige', '/distribucion', { expect: 307 });
await check('GET /api/distribucion/lista-precios', '/api/distribucion/lista-precios', {
  expect: 401,
});

console.log('\n--- Con sesión ---');
const authShop = await check('GET /tienda', '/tienda', { auth: true });
const dist = await check('GET /distribucion', '/distribucion', { auth: true, expect: 200 });
const csv = await check('GET /api/distribucion/lista-precios', '/api/distribucion/lista-precios', {
  auth: true,
  expect: 200,
});

// `res.text()` descarta el BOM al decodificar, así que se comprueba sobre los bytes.
const csvBytes = new Uint8Array(
  await fetch(`${BASE}/api/distribucion/lista-precios`, { headers: { cookie } }).then((r) =>
    r.arrayBuffer(),
  ),
);

console.log('\n--- Contenido ---');
const assert = (label, condition) => {
  if (!condition) failures++;
  console.log(`${condition ? 'OK  ' : 'FAIL'}  ${label}`);
};

const GATE = 'Accede para ver Precios y Stock';
assert('anónimo ve el aviso de precio bloqueado', anonShop.includes(GATE));
assert('anónimo NO ve precios en soles', !/S\/&#x27;?\s?\d|S\/\s\d/.test(anonShop));
assert('con sesión desaparece el aviso', !authShop.includes(GATE));
assert('con sesión aparecen precios en soles', /S\/\s?\d/.test(authShop));
assert('distribución saluda al cliente', dist.includes('Cliente Demo'));
assert('CSV tiene cabecera correcta', csv.startsWith('SKU;Nombre;Marca'));
assert(
  'CSV empieza con BOM UTF-8 (para Excel)',
  csvBytes[0] === 0xef && csvBytes[1] === 0xbb && csvBytes[2] === 0xbf,
);
assert('CSV trae 495 filas de producto', csv.trim().split(/\r?\n/).length === 496);

console.log(`\n${failures === 0 ? '✓ Todo correcto' : `✗ ${failures} fallo(s)`}`);
process.exit(failures === 0 ? 0 : 1);

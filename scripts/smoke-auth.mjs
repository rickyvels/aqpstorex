// Prueba de humo del gate B2B: compara respuestas sin sesión y con sesión, y
// verifica la comprobación de credenciales que usa el formulario de acceso.
// Uso: node scripts/smoke-auth.mjs
import { SignJWT } from 'jose';
import { findByRuc, verifyPassword } from '../src/lib/users.ts';

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

const anonHome = await check('GET / (invitado)', '/');

console.log('\n--- Contenido ---');
const assert = (label, condition) => {
  if (!condition) failures++;
  console.log(`${condition ? 'OK  ' : 'FAIL'}  ${label}`);
};

// Un precio de producto siempre va dentro del bloque de precio de la tarjeta.
// Buscar "S/" a secas daría falsos positivos con los umbrales de la escala de
// volumen ("Desde S/ 3,000 / mes"), que son texto de marketing, no precios.
const hasProductPrice = (html) => /text-brand">S\/\s?[\d.,]+/.test(html);

const GATE = 'Ver precio mayorista';
assert('invitado ve la llamada a ver precio', anonShop.includes(GATE));
assert('invitado NO ve precios de producto', !hasProductPrice(anonShop));
assert('invitado ve la disponibilidad', /En stock|Bajo pedido/.test(anonShop));
assert('con sesión desaparece la llamada', !authShop.includes(GATE));
assert('con sesión aparecen precios de producto', hasProductPrice(authShop));
assert('distribución saluda al cliente', dist.includes('Cliente Demo'));

console.log('\n--- Home de invitado ---');
assert('CTA primario de registro', anonHome.includes('Crear cuenta mayorista'));
assert('bloque de valor mayorista', anonHome.includes('Desbloquea precios de distribuidor'));
assert('escala de descuento por volumen', anonHome.includes('Escala por volumen'));
assert('franja de marcas', anonHome.includes('Marcas que distribuimos'));
assert('enlace de salto al contenido', anonHome.includes('Saltar al contenido'));
assert('datos estructurados Organization', anonHome.includes('"@type":"Organization"'));
assert('copyright con el año en curso', anonHome.includes(String(new Date().getFullYear())));
assert('sección de Portátiles presente', anonHome.includes('Portátiles / Laptops'));

console.log('\n--- Fuga por filtro de precio ---');
const anonFiltered = await check('GET /tienda?min=100&max=200 (invitado)', '/tienda?min=100&max=200');
const authFiltered = await check('GET /tienda?min=100&max=200 (con sesión)', '/tienda?min=100&max=200', {
  auth: true,
});
// Se lee del atributo del contador de resultados: buscar "N productos" en el
// HTML capturaría antes el texto descriptivo de la cabecera.
const totalOf = (html) => Number(html.match(/data-resultados="(\d+)"/)?.[1] ?? -1);
assert('invitado: el filtro de precio se ignora', totalOf(anonFiltered) === totalOf(anonShop));
assert('invitado: no se ofrece filtro de precio', !anonFiltered.includes('Precio (S/)'));
assert('con sesión: el filtro sí acota', totalOf(authFiltered) < totalOf(authShop));
assert('CSV tiene cabecera correcta', csv.startsWith('SKU;Nombre;Marca'));
assert(
  'CSV empieza con BOM UTF-8 (para Excel)',
  csvBytes[0] === 0xef && csvBytes[1] === 0xbb && csvBytes[2] === 0xbf,
);
assert('CSV trae 495 filas de producto', csv.trim().split(/\r?\n/).length === 496);

console.log('\n--- Credenciales ---');
const demo = findByRuc('20123456789');
assert('la cuenta demo existe', !!demo);
assert('acepta la contraseña correcta', !!demo && verifyPassword('demo1234', demo.passwordHash));
assert('rechaza una contraseña incorrecta', !!demo && !verifyPassword('incorrecta', demo.passwordHash));
assert('rechaza un RUC inexistente', !findByRuc('99999999999'));
assert('la contraseña no se guarda en claro', !!demo && !demo.passwordHash.includes('demo1234'));

console.log(`\n${failures === 0 ? '✓ Todo correcto' : `✗ ${failures} fallo(s)`}`);
process.exit(failures === 0 ? 0 : 1);

// Reproduce las condiciones de Vercel y comprueba que el acceso funciona.
//
//   npm run build && node scripts/smoke-serverless.mjs
//
// Simula lo que rompía en producción: disco de solo lectura (VERCEL=1), sin
// data/users.json, clientes definidos en AQPX_USERS y SESSION_SECRET presente.
// Levanta `next start` en el 3100 con ese entorno, prueba y lo apaga.
import { spawn } from 'node:child_process';
import { randomBytes, scryptSync } from 'node:crypto';
import { SignJWT } from 'jose';

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
const PASSWORD = 'ClaveDePrueba123';

const hash = (password) => {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
};

const testUser = {
  ruc: '20999888777',
  razonSocial: 'Cliente Serverless S.A.C.',
  email: 'test@aqpstorex.pe',
  phone: '51900000000',
  passwordHash: hash(PASSWORD),
  approved: true,
  createdAt: new Date().toISOString(),
};

const env = {
  ...process.env,
  NODE_ENV: 'production',
  VERCEL: '1', // fuerza el modo solo lectura
  SESSION_SECRET: randomBytes(32).toString('base64url'),
  AQPX_USERS: JSON.stringify([testUser]),
};

let failures = 0;
const assert = (label, condition) => {
  if (!condition) failures++;
  console.log(`${condition ? 'OK  ' : 'FAIL'}  ${label}`);
};

// --------------------------------------------- almacén en solo lectura ----

console.log('--- Almacén de clientes sin disco escribible ---');
Object.assign(process.env, {
  VERCEL: env.VERCEL,
  AQPX_USERS: env.AQPX_USERS,
  SESSION_SECRET: env.SESSION_SECRET,
});

const { findByRuc, verifyPassword, isWritable, createUser, listUsers } = await import(
  '../src/lib/users.ts'
);

assert('el almacén se detecta como NO escribible', isWritable() === false);
assert('los clientes se cargan desde AQPX_USERS', listUsers().length === 1);

const user = findByRuc(testUser.ruc);
assert('encuentra al cliente de la variable', !!user);
assert('acepta su contraseña', !!user && verifyPassword(PASSWORD, user.passwordHash));
assert('rechaza una contraseña incorrecta', !!user && !verifyPassword('otra-cosa', user.passwordHash));

// Antes esto lanzaba EROFS y tumbaba la petición entera.
const nuevo = createUser({
  ruc: '20111222333',
  razonSocial: 'Nueva Empresa S.A.C.',
  email: 'nueva@ejemplo.pe',
  phone: '51900000000',
  password: 'unaclave123',
});
assert('el registro no lanza en solo lectura', nuevo.ok === true);
assert('el registro informa que no persistió', nuevo.ok && nuevo.persisted === false);

// ------------------------------------------------------------ servidor ----

console.log('\nArrancando `next start` con el entorno de Vercel simulado…');
const server = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['next', 'start', '-p', String(PORT)],
  { env, stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' },
);

const serverLog = [];
server.stdout.on('data', (d) => serverLog.push(d.toString()));
server.stderr.on('data', (d) => serverLog.push(d.toString()));

async function waitForServer(timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE, { signal: AbortSignal.timeout(4000) });
      if (res.ok) return true;
    } catch {
      /* aún no escucha */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

const cleanup = () => {
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(server.pid), '/f', '/t']);
  else server.kill('SIGTERM');
};

try {
  if (!(await waitForServer())) {
    console.error('\n✗ El servidor no arrancó. Salida:\n' + serverLog.join(''));
    cleanup();
    process.exit(1);
  }

  const get = async (path, cookie) => {
    const res = await fetch(`${BASE}${path}`, {
      headers: cookie ? { cookie } : {},
      redirect: 'manual',
    });
    return { status: res.status, body: res.status === 200 ? await res.text() : '' };
  };

  console.log('\n--- Las páginas renderizan sin sesión ---');
  for (const path of ['/', '/tienda', '/acceder', '/registro', '/contactanos']) {
    assert(`GET ${path} → 200`, (await get(path)).status === 200);
  }

  console.log('\n--- El área privada sigue protegida ---');
  assert('GET /distribucion redirige', (await get('/distribucion')).status === 307);
  assert(
    'GET /api/distribucion/lista-precios → 401',
    (await get('/api/distribucion/lista-precios')).status === 401,
  );

  console.log('\n--- No se filtra la cuenta de prueba ---');
  assert('la página de acceso no muestra credenciales demo', !(await get('/acceder')).body.includes('demo1234'));

  console.log('\n--- Con sesión emitida por la clave de producción ---');
  const token = await new SignJWT({ ruc: testUser.ruc, razonSocial: testUser.razonSocial })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(new TextEncoder().encode(env.SESSION_SECRET));
  const cookie = `aqpx_session=${token}`;

  const dist = await get('/distribucion', cookie);
  assert('GET /distribucion con sesión → 200', dist.status === 200);
  assert('saluda al cliente de AQPX_USERS', dist.body.includes('Cliente Serverless'));
  assert('con sesión se ven precios', /text-brand">S\/\s?[\d.,]+/.test((await get('/tienda', cookie)).body));

  const errores = serverLog.join('').match(/EROFS|read-only file system/gi);
  assert('sin errores EROFS en los logs del servidor', !errores);
} finally {
  cleanup();
}

console.log(`\n${failures === 0 ? '✓ Todo correcto' : `✗ ${failures} fallo(s)`}`);
process.exit(failures === 0 ? 0 : 1);

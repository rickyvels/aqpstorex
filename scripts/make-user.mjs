// Prepara las variables de entorno que necesita el sitio en producción.
//
//   npm run users:new
//
// Pide los datos de un cliente, convierte la contraseña en hash y escribe
// `vercel-env.txt` con los valores listos para pegar en Vercel. La contraseña
// en claro nunca se guarda ni se transmite.
//
// Para añadir un cliente a una lista que ya existe, pega el valor actual de
// AQPX_USERS cuando el script lo pida.
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { randomBytes, scryptSync } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const hash = (password) => {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
};

/**
 * Pregunta por consola. Si la entrada no es un terminal (por ejemplo en una
 * prueba con `echo ... | node`), consume las respuestas de stdin en orden en
 * lugar de esperar interacción.
 */
async function makeAsker() {
  if (stdin.isTTY) {
    const rl = createInterface({ input: stdin, output: stdout });
    return { ask: (q) => rl.question(q).then((a) => a.trim()), close: () => rl.close() };
  }

  const chunks = [];
  for await (const chunk of stdin) chunks.push(chunk);
  const lines = chunks.join('').split(/\r?\n/);
  let i = 0;
  return {
    ask: async (q) => {
      const answer = (lines[i++] ?? '').trim();
      console.log(`${q}${answer}`);
      return answer;
    },
    close: () => {},
  };
}

const { ask, close } = await makeAsker();

console.log('\nAlta de cliente mayorista para producción\n');

const ruc = await ask('RUC (11 dígitos): ');
const razonSocial = await ask('Razón social: ');
const email = await ask('Correo: ');
const phone = await ask('Teléfono (ej. 51958123456): ');
const password = await ask('Contraseña (mínimo 8 caracteres): ');

console.log('\nSi ya tienes clientes en AQPX_USERS, pega aquí su valor actual.');
const existingRaw = await ask('AQPX_USERS actual (Enter para empezar de cero): ');

close();

const problems = [];
if (!/^\d{11}$/.test(ruc)) problems.push('El RUC debe tener 11 dígitos.');
if (!razonSocial) problems.push('Falta la razón social.');
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) problems.push('El correo no es válido.');
if (password.length < 8) problems.push('La contraseña debe tener al menos 8 caracteres.');

let existing = [];
if (existingRaw) {
  try {
    const parsed = JSON.parse(existingRaw);
    if (!Array.isArray(parsed)) throw new Error('no es un array');
    existing = parsed;
  } catch (error) {
    problems.push(`El AQPX_USERS actual no se pudo interpretar: ${error.message}`);
  }
}

if (existing.some((u) => u?.ruc === ruc)) problems.push(`El RUC ${ruc} ya está en la lista.`);

if (problems.length) {
  console.error('\n✗ Revisa estos datos:');
  for (const p of problems) console.error(`  · ${p}`);
  process.exit(1);
}

const user = {
  ruc,
  razonSocial,
  email: email.toLowerCase(),
  phone,
  passwordHash: hash(password),
  approved: true,
  createdAt: new Date().toISOString(),
};

const users = [...existing, user];
const sessionSecret = randomBytes(48).toString('base64url');

const contenido = `Variables de entorno para Vercel
Proyecto → Settings → Environment Variables
Marca las tres casillas: Production, Preview y Development.

Tras guardarlas hay que REDESPLEGAR: las variables nuevas no se aplican
al despliegue que ya está en línea.

────────────────────────────────────────────────────────────
Nombre:  SESSION_SECRET
Valor:
${sessionSecret}

────────────────────────────────────────────────────────────
Nombre:  AQPX_USERS
Valor:
${JSON.stringify(users)}

────────────────────────────────────────────────────────────
Clientes en la lista: ${users.length}
${users.map((u) => `  · ${u.ruc}  ${u.razonSocial}`).join('\n')}

Este archivo contiene un secreto de producción: no lo subas al repositorio
(ya está en .gitignore) y bórralo cuando termines.
`;

// Con BOM: sin él, el Bloc de notas y PowerShell en Windows muestran los
// acentos como mojibake.
writeFileSync('vercel-env.txt', `﻿${contenido}`, 'utf8');

console.log('\n─────────────────────────────────────────────');
console.log('Listo. Los valores están en  vercel-env.txt');
console.log('─────────────────────────────────────────────\n');
console.log(`Clientes en la lista: ${users.length}`);
for (const u of users) console.log(`  · ${u.ruc}  ${u.razonSocial}`);
console.log('\nAbre el archivo, copia los dos valores en Vercel y redespliega.');
console.log('Cuando termines, borra vercel-env.txt.\n');

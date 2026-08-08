// Genera la entrada de un cliente mayorista para la variable AQPX_USERS.
//
//   node scripts/make-user.mjs
//
// Pide los datos por consola y devuelve el JSON listo para pegar en Vercel.
// La contraseña se convierte en hash aquí mismo: nunca se guarda ni se
// transmite en claro.
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { randomBytes, scryptSync } from 'node:crypto';

const hash = (password) => {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
};

const rl = createInterface({ input: stdin, output: stdout });

const ruc = (await rl.question('RUC (11 dígitos): ')).trim();
const razonSocial = (await rl.question('Razón social: ')).trim();
const email = (await rl.question('Correo: ')).trim();
const phone = (await rl.question('Teléfono (ej. 51900000000): ')).trim();
const password = (await rl.question('Contraseña (mínimo 8 caracteres): ')).trim();

rl.close();

const problems = [];
if (!/^\d{11}$/.test(ruc)) problems.push('El RUC debe tener 11 dígitos.');
if (!razonSocial) problems.push('Falta la razón social.');
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) problems.push('El correo no es válido.');
if (password.length < 8) problems.push('La contraseña debe tener al menos 8 caracteres.');

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

console.log('\n─────────────────────────────────────────────');
console.log('Entrada del cliente:\n');
console.log(JSON.stringify(user, null, 2));
console.log('\n─────────────────────────────────────────────');
console.log('Valor para la variable AQPX_USERS (un solo cliente):\n');
console.log(JSON.stringify([user]));
console.log('\nSi ya tienes clientes en AQPX_USERS, añade este objeto al array existente.');

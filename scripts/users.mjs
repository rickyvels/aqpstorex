// Administración de clientes mayoristas desde la terminal.
//
//   node scripts/users.mjs list
//   node scripts/users.mjs approve <ruc>
//   node scripts/users.mjs revoke  <ruc>
//   node scripts/users.mjs delete  <ruc>
//
// Las contraseñas se establecen únicamente desde /registro: este script nunca
// las lee ni las modifica.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FILE = join(process.cwd(), 'data', 'users.json');

if (!existsSync(FILE)) {
  console.error('No existe data/users.json todavía. Arranca el sitio con `npm run dev` y vuelve a intentarlo.');
  console.error('Este script gestiona el almacén LOCAL. En producción los clientes van en AQPX_USERS');
  console.error('(genera la entrada con: node scripts/make-user.mjs).');
  process.exit(1);
}

const read = () => JSON.parse(readFileSync(FILE, 'utf8'));
const write = (users) => writeFileSync(FILE, JSON.stringify(users, null, 2));

const [command, ruc] = process.argv.slice(2);

function requireRuc() {
  if (!ruc) {
    console.error(`Falta el RUC. Uso: node scripts/users.mjs ${command} <ruc>`);
    process.exit(1);
  }
  const users = read();
  const user = users.find((u) => u.ruc === ruc);
  if (!user) {
    console.error(`No hay ningún cliente con RUC ${ruc}.`);
    process.exit(1);
  }
  return { users, user };
}

switch (command) {
  case 'list': {
    const users = read();
    if (users.length === 0) {
      console.log('No hay clientes registrados.');
      break;
    }
    console.log(`${users.length} cliente(s):\n`);
    for (const u of users) {
      console.log(
        `${u.approved ? '✓ activo   ' : '⏳ pendiente'}  ${u.ruc}  ${u.razonSocial}  <${u.email}>`,
      );
    }
    break;
  }

  case 'approve': {
    const { users, user } = requireRuc();
    user.approved = true;
    write(users);
    console.log(`✓ ${user.razonSocial} (${user.ruc}) ya puede acceder y ver precios.`);
    break;
  }

  case 'revoke': {
    const { users, user } = requireRuc();
    user.approved = false;
    write(users);
    console.log(`Acceso suspendido para ${user.razonSocial} (${user.ruc}).`);
    break;
  }

  case 'delete': {
    const { users, user } = requireRuc();
    write(users.filter((u) => u.ruc !== user.ruc));
    console.log(`Cliente ${user.razonSocial} (${user.ruc}) eliminado.`);
    break;
  }

  default:
    console.log('Uso: node scripts/users.mjs <list|approve|revoke|delete> [ruc]');
    process.exit(command ? 1 : 0);
}

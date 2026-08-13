import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Almacén de clientes mayoristas.
 *
 * Hay dos backends porque el entorno lo obliga:
 *
 *  · Desarrollo local → `data/users.json`, que se puede leer y escribir.
 *  · Producción (Vercel) → variable de entorno `AQPX_USERS`, en solo lectura.
 *    El sistema de archivos de una función serverless no admite escrituras
 *    fuera de /tmp, y /tmp es efímero y distinto en cada instancia. Intentar
 *    escribir ahí lanzaba EROFS y tumbaba el acceso entero.
 *
 * Cuando el almacén es de solo lectura, el registro no crea la cuenta: la
 * deja como solicitud para que el equipo comercial la valide y la dé de alta.
 * Es el mismo flujo de aprobación que ya tenía, sin fingir una persistencia
 * que no existe.
 */

export type User = {
  ruc: string;
  razonSocial: string;
  email: string;
  phone: string;
  passwordHash: string;
  /** Los registros nuevos quedan pendientes hasta que ventas los valide. */
  approved: boolean;
  createdAt: string;
};

export type PublicUser = Omit<User, 'passwordHash'>;

const FILE = join(process.cwd(), 'data', 'users.json');

// ------------------------------------------------------------ contraseñas ----

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = (stored ?? '').split(':');
  if (!salt || !key) return false;
  let expected: Buffer;
  try {
    expected = Buffer.from(key, 'hex');
  } catch {
    return false;
  }
  const derived = scryptSync(password, salt, 64);
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

// --------------------------------------------------------------- backends ----

const isUser = (u: unknown): u is User =>
  typeof (u as User)?.ruc === 'string' && typeof (u as User)?.passwordHash === 'string';

/**
 * Normaliza el contenido de AQPX_USERS a una lista de clientes.
 *
 * Se acepta tanto el array `[{…}]` como un objeto suelto `{…}`: pegar un único
 * cliente sin los corchetes es el error natural al configurar la variable a
 * mano, y hacerlo fallar en silencio deja el acceso caído sin pista alguna.
 */
function normalizeUsers(parsed: unknown): User[] {
  if (Array.isArray(parsed)) return parsed.filter(isUser);
  if (isUser(parsed)) return [parsed];
  return [];
}

/** Clientes definidos por entorno. */
function readFromEnv(): User[] {
  const raw = process.env.AQPX_USERS;
  if (!raw?.trim()) return [];
  try {
    return normalizeUsers(JSON.parse(raw));
  } catch (error) {
    console.error('[aqpstorex] AQPX_USERS no se pudo interpretar:', error);
    return [];
  }
}

function seed(): User[] {
  // Cuenta de demostración, solo para desarrollo local. No se siembra en
  // producción: una credencial conocida en un sitio publicado es un agujero.
  return [
    {
      ruc: '20123456789',
      razonSocial: 'Cliente Demo S.A.C.',
      email: 'demo@aqpstorex.pe',
      phone: '51900000000',
      passwordHash: hashPassword('demo1234'),
      approved: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

/** ¿Se puede persistir en disco? En serverless, no. */
export function isWritable(): boolean {
  if (process.env.AQPX_USERS?.trim()) return false;
  // Vercel y similares exponen el sistema de archivos en solo lectura.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) return false;
  return true;
}

function readFromFile(): User[] {
  try {
    if (!existsSync(FILE)) {
      mkdirSync(join(process.cwd(), 'data'), { recursive: true });
      const users = seed();
      writeFileSync(FILE, JSON.stringify(users, null, 2));
      return users;
    }
    const parsed = JSON.parse(readFileSync(FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    // Nunca propagar: un fallo de disco no debe tumbar la página de acceso.
    console.error('[aqpstorex] No se pudo leer data/users.json:', error);
    return [];
  }
}

function read(): User[] {
  return isWritable() ? readFromFile() : readFromEnv();
}

function write(users: User[]): boolean {
  if (!isWritable()) return false;
  try {
    writeFileSync(FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('[aqpstorex] No se pudo guardar data/users.json:', error);
    return false;
  }
}

// ------------------------------------------------------------------- API ----

export const toPublic = ({ passwordHash: _passwordHash, ...rest }: User): PublicUser => rest;

export function listUsers(): User[] {
  return read();
}

/** Estado del origen de clientes, sin revelar ningún valor. Para diagnóstico. */
export type UsersDiagnosis =
  | 'archivo-local'
  | 'variable-ausente'
  | 'json-invalido'
  | 'lista-vacia'
  | 'sin-entradas-validas'
  | 'ok';

export function diagnoseUsers(): {
  estado: UsersDiagnosis;
  total: number;
  /** Forma del JSON recibido, para saber qué se pegó realmente en la variable. */
  forma?: string;
} {
  if (isWritable()) return { estado: 'archivo-local', total: readFromFile().length };

  const raw = process.env.AQPX_USERS;
  if (!raw?.trim()) return { estado: 'variable-ausente', total: 0 };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { estado: 'json-invalido', total: 0 };
  }

  const forma = Array.isArray(parsed) ? `array(${parsed.length})` : typeof parsed;
  if (Array.isArray(parsed) && parsed.length === 0) return { estado: 'lista-vacia', total: 0, forma };

  const total = normalizeUsers(parsed).length;
  // JSON válido pero sin entradas con ruc y passwordHash utilizables.
  if (total === 0) return { estado: 'sin-entradas-validas', total: 0, forma };
  return { estado: 'ok', total, forma };
}

export function findByRuc(ruc: string): User | undefined {
  return read().find((u) => u.ruc === ruc.trim());
}

export type RegisterInput = {
  ruc: string;
  razonSocial: string;
  email: string;
  phone: string;
  password: string;
};

export type RegisterResult =
  | { ok: true; persisted: boolean }
  | { ok: false; error: string };

export function createUser(input: RegisterInput): RegisterResult {
  const ruc = input.ruc.trim();

  if (!/^\d{11}$/.test(ruc)) return { ok: false, error: 'El RUC debe tener 11 dígitos.' };
  if (input.password.length < 8)
    return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email))
    return { ok: false, error: 'Correo electrónico no válido.' };
  if (!input.razonSocial.trim()) return { ok: false, error: 'Indica tu razón social.' };

  const users = read();
  if (users.some((u) => u.ruc === ruc)) return { ok: false, error: 'Ese RUC ya está registrado.' };

  const user: User = {
    ruc,
    razonSocial: input.razonSocial.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    passwordHash: hashPassword(input.password),
    approved: false,
    createdAt: new Date().toISOString(),
  };

  // En solo lectura la cuenta no se crea aquí; queda como solicitud y la da de
  // alta el equipo comercial. Se informa al llamante para que el mensaje al
  // usuario sea honesto.
  const persisted = write([...users, user]);
  return { ok: true, persisted };
}

export function setApproved(ruc: string, approved: boolean): boolean {
  const users = read();
  const user = users.find((u) => u.ruc === ruc);
  if (!user) return false;
  user.approved = approved;
  return write(users);
}

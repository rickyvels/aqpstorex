import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Almacén de clientes mayoristas.
 *
 * Para desarrollo se persiste en data/users.json. En producción esto debe
 * reemplazarse por una base de datos real (Postgres, Supabase, etc.): un
 * archivo JSON no soporta escrituras concurrentes ni escala.
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

function hash(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(key, 'hex');
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

function seed(): User[] {
  // Cuenta de demostración para probar el acceso B2B. Cambiar o eliminar
  // antes de publicar el sitio.
  return [
    {
      ruc: '20123456789',
      razonSocial: 'Cliente Demo S.A.C.',
      email: 'demo@aqpstorex.pe',
      phone: '51900000000',
      passwordHash: hash('demo1234'),
      approved: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

function read(): User[] {
  if (!existsSync(FILE)) {
    mkdirSync(join(process.cwd(), 'data'), { recursive: true });
    const users = seed();
    writeFileSync(FILE, JSON.stringify(users, null, 2));
    return users;
  }
  try {
    return JSON.parse(readFileSync(FILE, 'utf8')) as User[];
  } catch {
    return [];
  }
}

function write(users: User[]) {
  writeFileSync(FILE, JSON.stringify(users, null, 2));
}

export const toPublic = ({ passwordHash: _passwordHash, ...rest }: User): PublicUser => rest;

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

export function createUser(input: RegisterInput): { ok: true } | { ok: false; error: string } {
  const users = read();
  const ruc = input.ruc.trim();

  if (!/^\d{11}$/.test(ruc)) return { ok: false, error: 'El RUC debe tener 11 dígitos.' };
  if (users.some((u) => u.ruc === ruc)) return { ok: false, error: 'Ese RUC ya está registrado.' };
  if (input.password.length < 8)
    return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email))
    return { ok: false, error: 'Correo electrónico no válido.' };
  if (!input.razonSocial.trim()) return { ok: false, error: 'Indica tu razón social.' };

  users.push({
    ruc,
    razonSocial: input.razonSocial.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    passwordHash: hash(input.password),
    approved: false,
    createdAt: new Date().toISOString(),
  });
  write(users);
  return { ok: true };
}

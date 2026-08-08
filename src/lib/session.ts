import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'aqpx_session';
const MAX_AGE = 60 * 60 * 8; // 8 horas

export type SessionPayload = {
  ruc: string;
  razonSocial: string;
};

/** Clave fija de desarrollo. Nunca se usa en producción. */
const DEV_SECRET = 'desarrollo-inseguro-cambiar-en-produccion-aqpstorex';

/**
 * ¿Está el servidor en condiciones de emitir sesiones?
 *
 * En producción exige SESSION_SECRET. Se comprueba antes de firmar en lugar de
 * lanzar dentro de `secret()`: así una mala configuración se traduce en un
 * mensaje legible en el formulario y no en una página de error opaca.
 */
export function isSessionConfigured(): boolean {
  return process.env.NODE_ENV !== 'production' || !!process.env.SESSION_SECRET?.trim();
}

function secret(): Uint8Array {
  const value = process.env.SESSION_SECRET?.trim();
  if (value) return new TextEncoder().encode(value);

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Falta SESSION_SECRET. Define la variable de entorno antes de desplegar.');
  }
  return new TextEncoder().encode(DEV_SECRET);
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function readToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.ruc !== 'string' || typeof payload.razonSocial !== 'string') return null;
    return { ruc: payload.ruc, razonSocial: payload.razonSocial };
  } catch {
    return null;
  }
}

/** Sesión actual leída de la cookie, o null si no hay acceso. */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return await readToken(token);
  } catch {
    // Una cookie corrupta o una mala configuración no deben impedir que la
    // página se renderice: simplemente se trata como visitante anónimo.
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE,
} as const;

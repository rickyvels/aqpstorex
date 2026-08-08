import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'aqpx_session';
const MAX_AGE = 60 * 60 * 8; // 8 horas

export type SessionPayload = {
  ruc: string;
  razonSocial: string;
};

function secret(): Uint8Array {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Falta SESSION_SECRET. Define la variable de entorno antes de desplegar.');
    }
    // Clave fija solo para desarrollo local.
    return new TextEncoder().encode('desarrollo-inseguro-cambiar-en-produccion-aqpstorex');
  }
  return new TextEncoder().encode(value);
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
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readToken(token);
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE,
} as const;

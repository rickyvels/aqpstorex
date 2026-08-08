'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createUser, findByRuc, verifyPassword } from './users';
import { SESSION_COOKIE, cookieOptions, createSession } from './session';

export type FormState = { error?: string; success?: string };

/** Solo se aceptan destinos internos, para no convertir esto en un redirector abierto. */
function safeRedirect(value: FormDataEntryValue | null): string {
  const target = typeof value === 'string' ? value : '';
  return target.startsWith('/') && !target.startsWith('//') ? target : '/';
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ruc = String(formData.get('ruc') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = safeRedirect(formData.get('next'));

  if (!ruc || !password) return { error: 'Ingresa tu RUC y contraseña.' };

  const user = findByRuc(ruc);
  // Mismo mensaje para usuario inexistente y contraseña incorrecta: no revela
  // qué RUC están registrados.
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: 'RUC o contraseña incorrectos.' };
  }

  if (!user.approved) {
    return { error: 'Tu cuenta aún está pendiente de aprobación. Te contactaremos por correo.' };
  }

  const token = await createSession({ ruc: user.ruc, razonSocial: user.razonSocial });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions);

  redirect(next);
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = createUser({
    ruc: String(formData.get('ruc') ?? ''),
    razonSocial: String(formData.get('razonSocial') ?? ''),
    email: String(formData.get('email') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    password: String(formData.get('password') ?? ''),
  });

  if (!result.ok) return { error: result.error };

  return {
    success:
      'Solicitud enviada. Nuestro equipo comercial validará tus datos y activará tu cuenta en un plazo de 24 horas hábiles.',
  };
}

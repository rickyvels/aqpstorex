'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createUser, diagnoseUsers, findByRuc, verifyPassword } from './users';
import { SESSION_COOKIE, cookieOptions, createSession, isSessionConfigured } from './session';
import { recordLead } from './forms';

export type FormState = { error?: string; success?: string };

/** Solo se aceptan destinos internos, para no convertir esto en un redirector abierto. */
function safeRedirect(value: FormDataEntryValue | null): string {
  const target = typeof value === 'string' ? value : '';
  return target.startsWith('/') && !target.startsWith('//') ? target : '/';
}

/**
 * Aviso de mala configuración. Lleva un código corto porque las causas son
 * varias y, sin distinguirlas, el fallo es imposible de diagnosticar desde
 * fuera del servidor. El código no revela nada: el detalle va a los logs y a
 * /api/salud.
 */
const misconfigured = (code: string) =>
  `El acceso no está disponible por una incidencia de configuración del servidor (${code}). ` +
  'Escríbenos por WhatsApp y lo resolvemos.';

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ruc = String(formData.get('ruc') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = safeRedirect(formData.get('next'));

  if (!ruc || !password) return { error: 'Ingresa tu RUC y contraseña.' };

  let token: string;
  try {
    if (!isSessionConfigured()) {
      console.error('[aqpstorex] SESSION-1: falta SESSION_SECRET, no se pueden emitir sesiones.');
      return { error: misconfigured('SESSION-1') };
    }

    const diagnosis = diagnoseUsers();
    if (diagnosis.total === 0) {
      console.error(`[aqpstorex] USERS-1: no hay clientes cargados (${diagnosis.estado}).`);
      return { error: misconfigured(`USERS-1:${diagnosis.estado}`) };
    }

    const user = findByRuc(ruc);
    // Mismo mensaje para usuario inexistente y contraseña incorrecta: no revela
    // qué RUC están registrados.
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return { error: 'RUC o contraseña incorrectos.' };
    }

    if (!user.approved) {
      return { error: 'Tu cuenta aún está pendiente de aprobación. Te contactaremos por correo.' };
    }

    token = await createSession({ ruc: user.ruc, razonSocial: user.razonSocial });
    (await cookies()).set(SESSION_COOKIE, token, cookieOptions);
  } catch (error) {
    console.error('[aqpstorex] LOGIN-1: error inesperado al iniciar sesión:', error);
    return { error: misconfigured('LOGIN-1') };
  }

  // Fuera del try: redirect() señaliza lanzando y no debe capturarse.
  redirect(next);
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const input = {
    ruc: String(formData.get('ruc') ?? ''),
    razonSocial: String(formData.get('razonSocial') ?? ''),
    email: String(formData.get('email') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    password: String(formData.get('password') ?? ''),
  };

  try {
    const result = createUser(input);
    if (!result.ok) return { error: result.error };

    // La solicitud se registra siempre, se haya podido persistir la cuenta o no.
    await recordLead('registro', {
      ruc: input.ruc.trim(),
      razonSocial: input.razonSocial.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      persisted: String(result.persisted),
    });

    return {
      success: result.persisted
        ? 'Solicitud enviada. Nuestro equipo comercial validará tus datos y activará tu cuenta en un plazo de 24 horas hábiles.'
        : 'Solicitud recibida. Nuestro equipo comercial validará tu RUC y te enviará los datos de acceso por correo en un plazo de 24 horas hábiles.',
    };
  } catch (error) {
    console.error('[aqpstorex] Error inesperado en el registro:', error);
    return {
      error:
        'No pudimos procesar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp y te damos de alta.',
    };
  }
}

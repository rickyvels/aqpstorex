'use server';

import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Recepción de formularios públicos.
 *
 * Los envíos se entregan por el primer canal disponible:
 *
 *  1. `FORMS_WEBHOOK_URL` — un POST con el contenido. Es la vía recomendada en
 *     producción (Zapier, Make, un endpoint propio, Slack…).
 *  2. `data/submissions.jsonl` — solo si el disco es escribible (desarrollo).
 *  3. Consola del servidor — último recurso, para que nada se pierda en
 *     silencio ni reviente la petición.
 *
 * En serverless el disco es de solo lectura, así que sin webhook los envíos
 * únicamente quedan en los logs: configura el webhook antes de publicar o los
 * mensajes de tus clientes no llegarán a nadie.
 */

export type FormResult = { error?: string; success?: string };

const canWriteToDisk = () => !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME;

async function postToWebhook(kind: string, payload: Record<string, string>): Promise<boolean> {
  const url = process.env.FORMS_WEBHOOK_URL?.trim();
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, at: new Date().toISOString(), ...payload }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch (error) {
    console.error('[aqpstorex] El webhook de formularios falló:', error);
    return false;
  }
}

function appendToDisk(kind: string, payload: Record<string, string>): boolean {
  if (!canWriteToDisk()) return false;
  try {
    const dir = join(process.cwd(), 'data');
    mkdirSync(dir, { recursive: true });
    const line = JSON.stringify({ kind, at: new Date().toISOString(), ...payload });
    appendFileSync(join(dir, 'submissions.jsonl'), `${line}\n`, 'utf8');
    return true;
  } catch (error) {
    console.error('[aqpstorex] No se pudo escribir data/submissions.jsonl:', error);
    return false;
  }
}

/** Entrega un envío. Nunca lanza: un fallo de canal no debe romper el formulario. */
export async function recordLead(kind: string, payload: Record<string, string>): Promise<void> {
  if (await postToWebhook(kind, payload)) return;
  if (appendToDisk(kind, payload)) return;
  console.warn(`[aqpstorex] ENVÍO SIN CANAL (${kind}):`, JSON.stringify(payload));
}

const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

export async function contactAction(_prev: FormResult, formData: FormData): Promise<FormResult> {
  const nombre = String(formData.get('nombre') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const telefono = String(formData.get('telefono') ?? '').trim();
  const empresa = String(formData.get('empresa') ?? '').trim();
  const mensaje = String(formData.get('mensaje') ?? '').trim();

  if (!nombre) return { error: 'Indica tu nombre.' };
  if (!isEmail(email)) return { error: 'Ingresa un correo electrónico válido.' };
  if (mensaje.length < 10) return { error: 'Cuéntanos un poco más en el mensaje.' };

  try {
    await recordLead('contacto', { nombre, email, telefono, empresa, mensaje });
  } catch (error) {
    console.error('[aqpstorex] Error inesperado en el formulario de contacto:', error);
    return { error: 'No pudimos enviar tu mensaje. Escríbenos por WhatsApp mientras lo revisamos.' };
  }

  return { success: 'Mensaje recibido. Un asesor te responderá en las próximas horas hábiles.' };
}

export async function complaintAction(_prev: FormResult, formData: FormData): Promise<FormResult> {
  const get = (k: string) => String(formData.get(k) ?? '').trim();

  const nombre = get('nombre');
  const documento = get('documento');
  const email = get('email');
  const telefono = get('telefono');
  const direccion = get('direccion');
  const tipo = get('tipo');
  const detalle = get('detalle');
  const pedido = get('pedido');

  if (!nombre) return { error: 'Indica tus nombres y apellidos.' };
  if (!documento) return { error: 'Indica tu número de documento.' };
  if (!isEmail(email)) return { error: 'Ingresa un correo electrónico válido.' };
  if (!['reclamo', 'queja'].includes(tipo)) return { error: 'Selecciona si es un reclamo o una queja.' };
  if (detalle.length < 20) return { error: 'Describe el detalle con al menos 20 caracteres.' };

  const code = `LR-${Date.now().toString(36).toUpperCase()}`;

  try {
    await recordLead('libro-reclamaciones', {
      code,
      nombre,
      documento,
      email,
      telefono,
      direccion,
      tipo,
      detalle,
      pedido,
    });
  } catch (error) {
    console.error('[aqpstorex] Error inesperado en el libro de reclamaciones:', error);
    return {
      error: 'No pudimos registrar tu reclamación. Inténtalo de nuevo o escríbenos por correo.',
    };
  }

  return {
    success: `Registro ${code} recibido. Conforme al Código de Protección y Defensa del Consumidor, responderemos en un plazo máximo de 15 días hábiles al correo indicado.`,
  };
}

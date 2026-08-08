'use server';

import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Recepción de formularios públicos.
 *
 * IMPORTANTE: por ahora los envíos solo se registran en data/submissions.jsonl.
 * NO se envía ningún correo. Antes de publicar el sitio hay que conectar un
 * proveedor real (Resend, SendGrid, SMTP…) en `deliver()`; de lo contrario los
 * mensajes de los clientes no llegarán a nadie.
 */

export type FormResult = { error?: string; success?: string };

function deliver(kind: string, payload: Record<string, string>) {
  const dir = join(process.cwd(), 'data');
  mkdirSync(dir, { recursive: true });
  const line = JSON.stringify({ kind, at: new Date().toISOString(), ...payload });
  appendFileSync(join(dir, 'submissions.jsonl'), `${line}\n`, 'utf8');
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

  deliver('contacto', { nombre, email, telefono, empresa, mensaje });

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
  deliver('libro-reclamaciones', {
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

  return {
    success: `Registro ${code} recibido. Conforme al Código de Protección y Defensa del Consumidor, responderemos en un plazo máximo de 15 días hábiles al correo indicado.`,
  };
}

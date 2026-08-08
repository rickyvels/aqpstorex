import { NextResponse } from 'next/server';
import { diagnoseUsers, isWritable } from '@/lib/users';
import { isSessionConfigured } from '@/lib/session';

// Debe evaluarse en cada petición: comprueba el entorno del runtime.
export const dynamic = 'force-dynamic';

/**
 * Diagnóstico de configuración del despliegue.
 *
 * Existe porque un fallo de variables de entorno en serverless se manifiesta
 * como un error genérico en el formulario, sin forma de saber cuál de las
 * piezas falta. Devuelve solo estados, nunca valores: ni la clave de sesión ni
 * los datos de los clientes salen de aquí.
 */
export async function GET() {
  const usuarios = diagnoseUsers();
  const sesion = isSessionConfigured();

  const listo = sesion && (usuarios.estado === 'ok' || usuarios.estado === 'archivo-local');

  return NextResponse.json(
    {
      listo,
      entorno: process.env.VERCEL ? 'vercel' : 'local',
      almacenEscribible: isWritable(),
      claveDeSesion: sesion ? 'definida' : 'ausente',
      clientes: usuarios.estado,
      totalClientes: usuarios.total,
      formularios: process.env.FORMS_WEBHOOK_URL?.trim() ? 'webhook' : 'sin-canal',
    },
    {
      status: listo ? 200 : 503,
      headers: { 'cache-control': 'no-store' },
    },
  );
}

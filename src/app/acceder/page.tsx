import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';
import { getSession } from '@/lib/session';
import { site } from '~/site.config';

export const metadata: Metadata = {
  title: 'Acceso de clientes',
  description: 'Accede a tu cuenta mayorista para ver precios y stock.',
};

export default async function AccederPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect('/');

  const { next } = await searchParams;

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 lg:grid-cols-2 lg:items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Acceso de clientes</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Los precios y el stock de {site.name} son exclusivos para clientes mayoristas registrados.
          Inicia sesión con el RUC de tu empresa para ver el catálogo completo con precios.
        </p>

        <ul className="mt-6 space-y-3 text-sm text-gray-600">
          {[
            'Precios mayoristas de los 495 productos del catálogo',
            'Disponibilidad de stock en tiempo real',
            'Cotizaciones directas con tu asesor asignado',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="mt-0.5 shrink-0 text-green-600"
              >
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        {/* Solo en desarrollo: publicar una credencial conocida es un agujero. */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 rounded-md border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
            <strong className="font-bold">Cuenta de prueba (solo local):</strong> RUC{' '}
            <code>20123456789</code> · contraseña <code>demo1234</code>. En producción los clientes
            se definen en la variable <code>AQPX_USERS</code>.
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <LoginForm next={next} />
      </div>
    </div>
  );
}

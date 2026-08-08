import Link from 'next/link';
import { volumeTiers, deliveryTimes } from '~/site.config';

/**
 * Bloque de conversión para invitados. Sustituye al aviso genérico de
 * "los precios son para mayoristas" por beneficios concretos y una escala de
 * descuento visible, que es lo que justifica crear la cuenta.
 */
export function WholesaleCta({ productCount }: { productCount: number }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12" aria-labelledby="cta-mayorista">
      <div className="overflow-hidden rounded-2xl border border-brand/15 bg-gradient-to-br from-brand-light to-white">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div>
            <span className="inline-block rounded-full bg-brand px-3 py-1 text-xs font-bold tracking-wide text-white">
              Cuenta mayorista gratuita
            </span>

            <h2 id="cta-mayorista" className="mt-4 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Desbloquea precios de distribuidor
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Registrar tu empresa toma dos minutos y no te compromete a comprar. Al activarse tu
              cuenta ves el precio y el stock real de los {productCount} productos del catálogo.
            </p>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                'Precio mayorista de todo el catálogo',
                'Stock disponible en tiempo real',
                'Lista de precios descargable en CSV',
                'Asesor comercial asignado',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-green-600"
                  >
                    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/registro"
                className="rounded-md bg-cta px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cta-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Crear cuenta mayorista
              </Link>
              <Link
                href="/acceder"
                className="rounded-md border border-brand/25 bg-white px-7 py-3.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-light focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          {/* Escala de descuento: hace tangible el beneficio antes de registrarse */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
            <h3 className="text-sm font-bold tracking-wider text-gray-800 uppercase">
              Escala por volumen
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Descuento adicional sobre el precio mayorista según tu compra mensual acumulada.
            </p>

            <ul className="mt-4 divide-y divide-gray-100">
              {volumeTiers.map((tier) => (
                <li key={tier.label} className="flex items-center justify-between gap-4 py-3">
                  <span>
                    <span className="block text-sm font-semibold text-gray-800">{tier.label}</span>
                    <span className="block text-xs text-gray-500">{tier.detail}</span>
                  </span>
                  <span className="shrink-0 rounded-md bg-brand-light px-2.5 py-1 text-sm font-bold text-brand">
                    {tier.discount}
                  </span>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-bold tracking-wider text-gray-800 uppercase">
              Tiempos de entrega
            </h3>
            <ul className="mt-3 space-y-2">
              {deliveryTimes.map((d) => (
                <li key={d.zone} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-gray-600">{d.zone}</span>
                  <span className="font-semibold text-gray-800">{d.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/RegisterForm';
import { getSession } from '@/lib/session';
import { site, volumeTiers } from '~/site.config';

export const metadata: Metadata = {
  title: 'Solicitar cuenta mayorista',
  description: 'Regístrate como cliente mayorista y accede a precios y stock.',
};

const steps = [
  {
    n: 1,
    title: 'Completa el formulario',
    text: 'RUC y datos de contacto de tu empresa. Toma menos de dos minutos.',
    time: 'Ahora',
  },
  {
    n: 2,
    title: 'Validamos tus datos',
    text: 'Verificamos la ficha RUC ante SUNAT y tu actividad comercial.',
    time: 'Hasta 24 h hábiles',
  },
  {
    n: 3,
    title: 'Activamos tu cuenta',
    text: 'Te avisamos por correo y ya puedes ver precios, stock y descargar la lista.',
    time: 'Inmediato tras validar',
  },
];

export default async function RegistroPage() {
  const session = await getSession();
  if (session) redirect('/');

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Solicita tu cuenta mayorista</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          {site.name} distribuye exclusivamente a empresas, revendedores e integradores con RUC
          activo. El registro es gratuito y sin compromiso de compra.
        </p>

        <ol className="mt-8 space-y-5">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                {s.n}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-bold text-gray-800">{s.title}</span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                    {s.time}
                  </span>
                </span>
                <span className="mt-0.5 block text-sm text-gray-600">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>

        <section className="mt-8 rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold tracking-wider text-gray-800 uppercase">
            Escala de descuento por volumen
          </h2>
          <p className="mt-1 text-xs text-gray-600">
            Adicional sobre el precio mayorista, según tu compra mensual acumulada.
          </p>
          <ul className="mt-4 divide-y divide-gray-100">
            {volumeTiers.map((tier) => (
              <li key={tier.label} className="flex items-center justify-between gap-4 py-2.5">
                <span>
                  <span className="block text-sm font-semibold text-gray-800">{tier.label}</span>
                  <span className="block text-xs text-gray-600">{tier.detail}</span>
                </span>
                <span className="shrink-0 rounded-md bg-brand-light px-2.5 py-1 text-sm font-bold text-brand">
                  {tier.discount}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <RegisterForm />
      </div>
    </div>
  );
}

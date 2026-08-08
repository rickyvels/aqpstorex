import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/RegisterForm';
import { getSession } from '@/lib/session';
import { site } from '~/site.config';

export const metadata: Metadata = {
  title: 'Solicitar cuenta mayorista',
  description: 'Regístrate como cliente mayorista y accede a precios y stock.',
};

const steps = [
  { n: 1, title: 'Completa el formulario', text: 'Necesitamos el RUC y los datos de contacto de tu empresa.' },
  { n: 2, title: 'Validamos tus datos', text: 'Verificamos la ficha RUC ante SUNAT y tu actividad comercial.' },
  { n: 3, title: 'Activamos tu cuenta', text: 'Recibirás un correo y podrás ver precios y stock al instante.' },
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
              <span>
                <span className="block text-sm font-bold text-gray-800">{s.title}</span>
                <span className="mt-0.5 block text-sm text-gray-500">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <RegisterForm />
      </div>
    </div>
  );
}

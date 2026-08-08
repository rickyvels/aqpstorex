import type { Metadata } from 'next';
import { ContactForm } from '@/components/ContactForm';
import { site, advisors } from '~/site.config';

export const metadata: Metadata = {
  title: 'Contáctanos',
  description: 'Escríbenos para cotizaciones, soporte o información comercial.',
};

export default function ContactanosPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Contáctanos</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          ¿Necesitas una cotización, información de stock o soporte post venta? Escríbenos y un
          asesor de {site.name} te atenderá.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <ContactForm />
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-gray-200 p-5">
            <h2 className="mb-3 text-sm font-bold tracking-wider text-gray-800 uppercase">Datos de contacto</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>{site.address}</li>
              <li>
                <a href={`mailto:${site.email}`} className="text-cta hover:underline">
                  {site.email}
                </a>
              </li>
              <li>{site.phone}</li>
              <li className="text-xs text-gray-500">{site.hours}</li>
            </ul>
          </section>

          <section className="rounded-lg border border-gray-200 p-5">
            <h2 className="mb-3 text-sm font-bold tracking-wider text-gray-800 uppercase">
              Asesores por WhatsApp
            </h2>
            <ul className="space-y-2">
              {advisors.map((a) => (
                <li key={a.phone}>
                  <a
                    href={`https://api.whatsapp.com/send?phone=${a.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-gray-50"
                  >
                    <span className="block font-semibold text-gray-800">{a.name}</span>
                    <span className="block text-xs text-gray-500">{a.role}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

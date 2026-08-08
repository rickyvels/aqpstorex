import type { Metadata } from 'next';
import { ComplaintForm } from '@/components/ComplaintForm';
import { site } from '~/site.config';

export const metadata: Metadata = {
  title: 'Libro de Reclamaciones',
  description: 'Libro de reclamaciones virtual conforme al Código de Protección y Defensa del Consumidor.',
};

export default function LibroReclamacionesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 rounded-lg border-2 border-brand bg-brand-light px-6 py-5">
        <h1 className="text-xl font-bold text-brand sm:text-2xl">Libro de Reclamaciones Virtual</h1>
        <p className="mt-2 text-sm text-brand-dark/80">
          Conforme al artículo 150.º del Código de Protección y Defensa del Consumidor (Ley N.º
          29571). {site.legalName} — RUC {site.ruc} — {site.address}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <ComplaintForm />
      </div>

      <div className="mt-6 space-y-2 text-xs leading-relaxed text-gray-500">
        <p>
          La formulación del reclamo no impide acudir a otras vías de solución de controversias ni
          es requisito previo para interponer una denuncia ante el INDECOPI.
        </p>
        <p>
          El proveedor deberá dar respuesta al reclamo en un plazo no mayor a quince (15) días
          hábiles, improrrogable.
        </p>
      </div>
    </div>
  );
}

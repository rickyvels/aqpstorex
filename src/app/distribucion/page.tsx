import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getCategories, getProducts } from '@/lib/catalog';
import { site, advisors } from '~/site.config';

export const metadata: Metadata = {
  title: 'Distribución',
  description: 'Portal de distribución para clientes mayoristas.',
};

const resources = [
  {
    title: 'Lista de precios completa',
    text: 'Catálogo con precios mayoristas actualizados, listo para importar a tu sistema.',
    action: 'Descargar CSV',
    href: '/api/distribucion/lista-precios',
  },
  {
    title: 'Catálogo con imágenes',
    text: 'Fichas de producto con fotografías en alta resolución para tu tienda o cotizaciones.',
    action: 'Ver catálogo',
    href: '/tienda',
  },
  {
    title: 'Condiciones comerciales',
    text: 'Escalas de descuento por volumen, formas de pago y políticas de despacho.',
    action: 'Consultar con tu asesor',
    href: '#asesores',
  },
];

export default async function DistribucionPage() {
  // El middleware ya bloquea el acceso; esta comprobación es la red de seguridad
  // por si la ruta cambia o el matcher deja de cubrirla.
  const session = await getSession();
  if (!session) redirect('/acceder?next=%2Fdistribucion');

  const products = getProducts();
  const categories = getCategories();
  const inStock = products.filter((p) => p.inStock).length;

  const stats = [
    { label: 'Productos en catálogo', value: products.length },
    { label: 'Categorías', value: categories.length },
    { label: 'Con stock disponible', value: inStock },
    { label: 'Marcas representadas', value: new Set(products.map((p) => p.brand).filter(Boolean)).size },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-xl bg-gradient-to-br from-brand to-brand-dark px-6 py-8 text-white sm:px-10 sm:py-10">
        <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
          Área privada de distribución
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
          Bienvenido, {session.razonSocial}
        </h1>
        <p className="mt-2 text-sm text-white/80">
          RUC {session.ruc} · Cliente mayorista de {site.name}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-2xl font-extrabold text-brand">{s.value}</p>
            <p className="mt-1 text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Recursos para distribuidores</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {resources.map((r) => (
            <article key={r.title} className="flex flex-col rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="text-base font-bold text-gray-800">{r.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">{r.text}</p>
              <Link
                href={r.href}
                className="mt-4 inline-block rounded-md bg-cta px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-cta-hover"
              >
                {r.action}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="asesores" className="mt-10 scroll-mt-24">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Tu equipo comercial</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {advisors.map((a) => (
            <a
              key={a.phone}
              href={`https://api.whatsapp.com/send?phone=${a.phone}&text=${encodeURIComponent(
                `Hola, soy ${session.razonSocial} (RUC ${session.ruc}).`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-cta"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-light text-sm font-bold text-brand">
                {a.name.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-gray-800">{a.name}</span>
                <span className="block truncate text-xs text-gray-500">{a.role}</span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

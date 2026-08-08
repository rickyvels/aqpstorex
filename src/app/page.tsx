import Link from 'next/link';
import { getCategories, getProducts, getProductsByCategory } from '@/lib/catalog';
import { getSession } from '@/lib/session';
import { CategoryGrid } from '@/components/CategoryGrid';
import { ProductRow } from '@/components/ProductRow';
import { site, homeSections } from '~/site.config';

const benefits = [
  {
    title: 'Precios mayoristas',
    text: 'Escalas de precio por volumen para revendedores y corporativos.',
    icon: (
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" />
    ),
  },
  {
    title: 'Despacho a todo el Perú',
    text: 'Envíos a provincia por los principales operadores logísticos.',
    icon: (
      <>
        <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8Z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </>
    ),
  },
  {
    title: 'Stock real en línea',
    text: 'Consulta disponibilidad actualizada desde tu cuenta de cliente.',
    icon: (
      <>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      </>
    ),
  },
  {
    title: 'Garantía y soporte',
    text: 'Respaldo de marca y gestión de RMA con nuestro equipo técnico.',
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" strokeLinejoin="round" />,
  },
];

export default async function HomePage() {
  const session = await getSession();
  const authenticated = !!session;
  const categories = getCategories();
  const totalProducts = getProducts().length;

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
              Distribuidor mayorista · {totalProducts} productos en catálogo
            </span>
            <h1 className="mt-4 text-3xl leading-tight font-extrabold text-white sm:text-4xl lg:text-5xl">
              Tecnología al por mayor para tu negocio
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
              {site.name} abastece a revendedores, integradores y empresas de todo el Perú con
              cómputo, impresión, redes y accesorios de las principales marcas.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/tienda"
                className="rounded-md bg-white px-6 py-3 text-sm font-bold text-brand transition-colors hover:bg-white/90"
              >
                Ver catálogo
              </Link>
              {!authenticated && (
                <Link
                  href="/registro"
                  className="rounded-md border-2 border-white/40 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  Solicitar cuenta mayorista
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c.slug}
                href={`/categoria/${c.slug}`}
                className="rounded-lg bg-white/10 p-4 backdrop-blur transition-colors hover:bg-white/20"
              >
                <span className="block text-sm font-bold text-white">{c.name}</span>
                <span className="mt-1 block text-xs text-white/70">{c.count} productos</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-light text-brand">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {b.icon}
                </svg>
              </span>
              <span>
                <span className="block text-sm font-bold text-gray-800">{b.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">{b.text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <CategoryGrid categories={categories} />

      {/* Aviso de acceso mayorista */}
      {!authenticated && (
        <section className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-brand/20 bg-brand-light px-6 py-5 sm:flex-row">
            <p className="text-sm text-brand-dark">
              <strong className="font-bold">Los precios son exclusivos para clientes mayoristas.</strong>{' '}
              Accede con tu cuenta o solicita una para ver precios y stock en tiempo real.
            </p>
            <div className="flex shrink-0 gap-2">
              <Link
                href="/acceder"
                className="rounded-md bg-cta px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cta-hover"
              >
                Acceder
              </Link>
              <Link
                href="/registro"
                className="rounded-md border border-brand/30 bg-white px-5 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-white/60"
              >
                Registrarme
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Carruseles por categoría */}
      {homeSections.map((s) => (
        <ProductRow
          key={s.slug}
          title={s.title}
          href={`/categoria/${s.slug}`}
          products={getProductsByCategory(s.slug).slice(0, 12)}
          authenticated={authenticated}
        />
      ))}
    </>
  );
}

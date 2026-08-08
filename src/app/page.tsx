import Link from 'next/link';
import Image from 'next/image';
import {
  getBrands,
  getCategories,
  getCategory,
  getProducts,
  getProductsByCategory,
  getTopBrands,
} from '@/lib/catalog';
import { getSession } from '@/lib/session';
import { CategoryGrid } from '@/components/CategoryGrid';
import { ProductRow } from '@/components/ProductRow';
import { BrandStrip } from '@/components/BrandStrip';
import { WholesaleCta } from '@/components/WholesaleCta';
import { OpeningStatus } from '@/components/OpeningStatus';
import { site, homeSections, heroCategorySlugs } from '~/site.config';

const benefits = [
  {
    title: 'Precios mayoristas',
    text: 'Escalas de precio por volumen para revendedores y corporativos.',
    icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" />,
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
  const products = getProducts();
  const brands = getTopBrands(14);

  const heroCategories = heroCategorySlugs
    .map((slug) => getCategory(slug))
    .filter((c): c is NonNullable<typeof c> => !!c);

  const stats = [
    { value: products.length, label: 'productos' },
    { value: categories.length, label: 'categorías' },
    { value: getBrands().length, label: 'marcas' },
  ];

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
              <OpeningStatus />
            </p>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              Tecnología al por mayor
              <span className="mt-1 block text-accent">para tu negocio</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              {site.name} abastece a revendedores, integradores y empresas de todo el Perú con
              cómputo, impresión, redes y accesorios de las principales marcas.
            </p>

            {/* CTA primario = crear cuenta; el catálogo queda como acción secundaria */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {authenticated ? (
                <Link
                  href="/tienda"
                  className="rounded-md bg-white px-8 py-4 text-base font-bold text-brand shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand focus-visible:outline-none"
                >
                  Ver catálogo con precios
                </Link>
              ) : (
                <>
                  <Link
                    href="/registro"
                    className="rounded-md bg-white px-8 py-4 text-base font-bold text-brand shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand focus-visible:outline-none"
                  >
                    Crear cuenta mayorista
                  </Link>
                  <Link
                    href="/tienda"
                    className="rounded-md border-2 border-white/40 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  >
                    Explorar catálogo
                  </Link>
                </>
              )}
            </div>

            {!authenticated && (
              <p className="mt-4 text-xs text-white/70">
                Gratis · Sin compromiso de compra · Activación en 24 h hábiles
              </p>
            )}

            <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/15 pt-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block text-3xl font-extrabold text-white">{s.value}</span>
                    <span className="block text-xs tracking-wide text-white/70 uppercase">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Accesos rápidos curados por valor comercial, no por volumen */}
          <div className="grid grid-cols-2 gap-3">
            {heroCategories.map((c, i) => (
              <Link
                key={c.slug}
                href={`/categoria/${c.slug}`}
                className="group flex flex-col justify-between rounded-xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                {c.image && (
                  <span className="relative mb-3 block h-20 w-full">
                    <Image
                      src={c.image}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 45vw, 200px"
                      className="object-contain"
                      // Solo las dos primeras entran en el viewport inicial.
                      priority={i < 2}
                    />
                  </span>
                )}
                <span>
                  <span className="block text-sm font-bold text-white">{c.name}</span>
                  <span className="mt-0.5 block text-xs text-white/70">{c.count} productos</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- beneficios */}
      <section className="border-b border-gray-200 bg-gray-50" aria-label="Por qué comprarnos">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-light text-brand">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  {b.icon}
                </svg>
              </span>
              <span>
                <span className="block text-sm font-bold text-gray-800">{b.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-gray-600">{b.text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <CategoryGrid categories={categories} />

      {!authenticated && <WholesaleCta productCount={products.length} />}

      {/* ------------------------------------------------------- carruseles */}
      {homeSections.map((s) => (
        <ProductRow
          key={s.slug}
          title={s.title}
          href={`/categoria/${s.slug}`}
          products={getProductsByCategory(s.slug).slice(0, 10)}
          authenticated={authenticated}
        />
      ))}

      <BrandStrip brands={brands} />
    </>
  );
}

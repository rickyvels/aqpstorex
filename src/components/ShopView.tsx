import Link from 'next/link';
import { Suspense } from 'react';
import { brandsFor, filterProducts, getCategories, getPriceRange } from '@/lib/catalog';
import { getSession } from '@/lib/session';
import { ProductCard } from './ProductCard';
import { Pagination } from './Pagination';
import { SortSelect } from './SortSelect';
import { PriceFilter } from './PriceFilter';
import { FilterPanel } from './FilterPanel';

export type ShopSearchParams = {
  q?: string;
  brand?: string;
  sort?: string;
  page?: string;
  min?: string;
  max?: string;
};

const SORTS = ['nombre', 'precio-asc', 'precio-desc'] as const;
type Sort = (typeof SORTS)[number];

const parseSort = (value?: string): Sort =>
  SORTS.includes(value as Sort) ? (value as Sort) : 'nombre';

export async function ShopView({
  title,
  description,
  basePath,
  category,
  searchParams,
}: {
  title: string;
  description?: string;
  basePath: string;
  /** Cuando viene fijada, la vista es la de una categoría y no se puede cambiar. */
  category?: string;
  searchParams: ShopSearchParams;
}) {
  const session = await getSession();
  const authenticated = !!session;

  const sort = parseSort(searchParams.sort);
  const page = Number(searchParams.page) || 1;
  const q = searchParams.q?.trim() || undefined;
  const brand = searchParams.brand || undefined;

  // El filtro de precio se ignora sin sesión aunque venga en la URL: de otro
  // modo un invitado podría deducir precios por tanteo del rango.
  const parsePrice = (value?: string) => {
    if (!authenticated || !value) return undefined;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  const minPrice = parsePrice(searchParams.min);
  const maxPrice = parsePrice(searchParams.max);

  const result = filterProducts({ q, category, brand, sort, page, perPage: 24, minPrice, maxPrice });
  const categories = getCategories();
  const brands = brandsFor(category);
  const priceRange = getPriceRange(category);

  // Enlaces que conservan el resto de filtros activos.
  const withParam = (key: string, value?: string) => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (brand) next.set('brand', brand);
    if (sort !== 'nombre') next.set('sort', sort);
    if (minPrice != null) next.set('min', String(minPrice));
    if (maxPrice != null) next.set('max', String(maxPrice));
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-gray-500">
        <Link href="/" className="hover:text-cta">
          Inicio
        </Link>
        <span>/</span>
        {category ? (
          <>
            <Link href="/tienda" className="hover:text-cta">
              Tienda
            </Link>
            <span>/</span>
            <span className="text-gray-700">{title}</span>
          </>
        ) : (
          <span className="text-gray-700">Tienda</span>
        )}
      </nav>

      <header className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        {q && (
          <p className="mt-2 text-sm text-gray-600">
            Resultados para <strong>“{q}”</strong>{' '}
            <Link href={withParam('q', undefined)} className="text-cta hover:underline">
              (limpiar)
            </Link>
          </p>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        {/* Filtros */}
        <FilterPanel activeCount={[brand, minPrice, maxPrice].filter((v) => v != null).length}>
          {!category && (
            <section>
              <h2 className="mb-3 text-sm font-bold tracking-wider text-gray-800 uppercase">Categorías</h2>
              <ul className="max-h-80 space-y-1 overflow-y-auto pr-1 text-sm">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/categoria/${c.slug}`}
                      className="flex min-h-11 items-center justify-between rounded px-2 py-2 text-gray-700 transition-colors hover:bg-brand-light hover:text-brand focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none lg:min-h-0 lg:py-1.5"
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-gray-500">{c.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {brands.length > 1 && (
            <section>
              <h2 className="mb-3 text-sm font-bold tracking-wider text-gray-800 uppercase">Marca</h2>
              <ul className="max-h-80 space-y-1 overflow-y-auto pr-1 text-sm">
                <li>
                  <Link
                    href={withParam('brand', undefined)}
                    className={`block rounded px-2 py-1.5 transition-colors ${
                      brand ? 'text-gray-600 hover:bg-brand-light hover:text-brand' : 'bg-brand-light font-semibold text-brand'
                    }`}
                  >
                    Todas las marcas
                  </Link>
                </li>
                {brands.map((b) => (
                  <li key={b}>
                    <Link
                      href={withParam('brand', b)}
                      className={`flex min-h-11 items-center rounded px-2 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none lg:min-h-0 lg:py-1.5 ${
                        brand === b
                          ? 'bg-brand-light font-semibold text-brand'
                          : 'text-gray-700 hover:bg-brand-light hover:text-brand'
                      }`}
                    >
                      {b}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {authenticated && priceRange.max > 0 && (
            <Suspense fallback={null}>
              <PriceFilter min={priceRange.min} max={priceRange.max} />
            </Suspense>
          )}

          {!authenticated && (
            <section className="rounded-lg border border-brand/20 bg-brand-light p-4">
              <h2 className="text-sm font-bold text-brand">¿Eres mayorista?</h2>
              <p className="mt-1 text-xs leading-relaxed text-brand-dark">
                Crea tu cuenta gratuita y desbloquea precios, stock y el filtro por rango de precio
                de todo el catálogo.
              </p>
              <Link
                href="/registro"
                className="mt-3 block rounded-md bg-cta px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-cta-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              >
                Crear cuenta
              </Link>
              <Link
                href="/acceder"
                className="mt-2 block text-center text-xs font-semibold text-brand hover:underline"
              >
                Ya tengo cuenta
              </Link>
            </section>
          )}
        </FilterPanel>

        {/* Resultados */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600" data-resultados={result.total}>
              {result.total} {result.total === 1 ? 'producto' : 'productos'}
              {result.pages > 1 && ` · página ${result.page} de ${result.pages}`}
            </p>
            <Suspense fallback={null}>
              <SortSelect value={sort} />
            </Suspense>
          </div>

          {result.items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 py-20 text-center">
              <p className="text-sm font-medium text-gray-600">No encontramos productos con esos filtros.</p>
              <Link href={basePath} className="mt-2 inline-block text-sm text-cta hover:underline">
                Ver todo el catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {result.items.map((p) => (
                <ProductCard key={p.id} product={p} authenticated={authenticated} />
              ))}
            </div>
          )}

          <Pagination
            page={result.page}
            pages={result.pages}
            basePath={basePath}
            params={{
              q,
              brand,
              sort: sort === 'nombre' ? undefined : sort,
              min: minPrice != null ? String(minPrice) : undefined,
              max: maxPrice != null ? String(maxPrice) : undefined,
            }}
          />
        </section>
      </div>
    </div>
  );
}

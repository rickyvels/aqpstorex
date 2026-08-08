import Link from 'next/link';

/**
 * Franja de marcas distribuidas. Se usan pastillas tipográficas en lugar de
 * logotipos: no disponemos de los archivos de marca con licencia de uso.
 */
export function BrandStrip({ brands }: { brands: { name: string; count: number }[] }) {
  if (brands.length === 0) return null;

  return (
    <section className="border-y border-gray-200 bg-gray-50" aria-labelledby="marcas-titulo">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h2
          id="marcas-titulo"
          className="mb-5 text-center text-xs font-bold tracking-[0.2em] text-gray-500 uppercase"
        >
          Marcas que distribuimos
        </h2>
        <ul className="flex flex-wrap items-center justify-center gap-2">
          {brands.map((b) => (
            <li key={b.name}>
              <Link
                href={`/tienda?brand=${encodeURIComponent(b.name)}`}
                className="flex items-baseline gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-cta hover:text-cta focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none"
              >
                {b.name}
                <span className="text-[11px] font-normal text-gray-500">{b.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import Link from 'next/link';

/** Ventana de páginas alrededor de la actual, con extremos siempre visibles. */
function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current]);
  for (let d = 1; d <= 1; d++) {
    if (current - d > 1) pages.add(current - d);
    if (current + d < total) pages.add(current + d);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push('…');
    out.push(p);
    prev = p;
  }
  return out;
}

export function Pagination({
  page,
  pages,
  basePath,
  params,
}: {
  page: number;
  pages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;

  const href = (p: number) => {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) search.set(k, v);
    if (p > 1) search.set('page', String(p));
    else search.delete('page');
    const qs = search.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const base =
    'grid h-9 min-w-9 place-items-center rounded-md border px-3 text-sm font-medium transition-colors';

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Paginación">
      {page > 1 && (
        <Link href={href(page - 1)} className={`${base} border-gray-300 text-gray-700 hover:border-cta hover:text-cta`}>
          Anterior
        </Link>
      )}

      {pageWindow(page, pages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-gray-500">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? 'page' : undefined}
            className={
              p === page
                ? `${base} border-cta bg-cta text-white`
                : `${base} border-gray-300 text-gray-700 hover:border-cta hover:text-cta`
            }
          >
            {p}
          </Link>
        ),
      )}

      {page < pages && (
        <Link href={href(page + 1)} className={`${base} border-gray-300 text-gray-700 hover:border-cta hover:text-cta`}>
          Siguiente
        </Link>
      )}
    </nav>
  );
}

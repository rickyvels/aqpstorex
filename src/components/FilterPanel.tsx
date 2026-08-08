'use client';

import { useState } from 'react';

/**
 * Contenedor de filtros plegable en móvil.
 *
 * En pantallas pequeñas la barra lateral se apila encima del grid, así que sin
 * plegarla hay que pasar 30+ enlaces de categoría antes de ver un solo
 * producto. A partir de `lg` se muestra siempre expandida.
 */
export function FilterPanel({
  children,
  activeCount = 0,
}: {
  children: React.ReactNode;
  activeCount?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <aside>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="panel-filtros"
        className="flex w-full items-center justify-between rounded-md border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800 focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none lg:hidden"
      >
        <span className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 6h18M7 12h10M11 18h2" strokeLinecap="round" />
          </svg>
          Filtros y categorías
          {activeCount > 0 && (
            <span className="rounded-full bg-cta px-2 py-0.5 text-xs font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        id="panel-filtros"
        className={`space-y-6 ${open ? 'mt-4 block' : 'hidden'} lg:mt-0 lg:block`}
      >
        {children}
      </div>
    </aside>
  );
}

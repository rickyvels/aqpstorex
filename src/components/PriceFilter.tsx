'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

/**
 * Filtro por rango de precio. Solo se renderiza para clientes con sesión: para
 * un invitado, acotar por rango permitiría deducir el precio oculto.
 */
export function PriceFilter({ min, max }: { min: number; max: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [from, setFrom] = useState(params.get('min') ?? '');
  const [to, setTo] = useState(params.get('max') ?? '');

  const apply = (next: URLSearchParams) => {
    next.delete('page');
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (from.trim()) next.set('min', from.trim());
    else next.delete('min');
    if (to.trim()) next.set('max', to.trim());
    else next.delete('max');
    apply(next);
  };

  const clear = () => {
    setFrom('');
    setTo('');
    const next = new URLSearchParams(params);
    next.delete('min');
    next.delete('max');
    apply(next);
  };

  const active = params.has('min') || params.has('max');
  const field =
    'w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-cta';

  return (
    <section>
      <h2 className="mb-3 text-sm font-bold tracking-wider text-gray-800 uppercase">Precio (S/)</h2>

      <form onSubmit={submit} className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <span className="sr-only">Precio mínimo</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder={String(min)}
              className={field}
            />
          </label>
          <span aria-hidden="true" className="text-gray-400">
            –
          </span>
          <label className="flex-1">
            <span className="sr-only">Precio máximo</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder={String(max)}
              className={field}
            />
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none"
          >
            Aplicar
          </button>
          {active && (
            <button
              type="button"
              onClick={clear}
              className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-cta hover:text-cta focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none"
            >
              Limpiar
            </button>
          )}
        </div>
      </form>

      <p className="mt-2 text-xs text-gray-500">
        Rango disponible: S/ {min.toLocaleString('es-PE')} – S/ {max.toLocaleString('es-PE')}
      </p>
    </section>
  );
}

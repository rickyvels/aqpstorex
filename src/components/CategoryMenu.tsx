'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Category } from '@/lib/types';

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/**
 * Desplegable de categorías con filtro incremental.
 *
 * Con 32 categorías, una lista plana obliga a leerlas todas; el buscador deja
 * llegar a cualquiera en dos o tres pulsaciones.
 */
export function CategoryMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return categories;
    return categories.filter((c) => normalize(c.name).includes(term));
  }, [categories, query]);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus(); // devuelve el foco al disparador
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="menu-categorias"
        className="flex h-full items-center gap-2 bg-brand px-5 py-3 text-sm font-bold tracking-wide text-white uppercase focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-inset focus-visible:outline-none"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        </svg>
        Categorías
        <svg
          width="14"
          height="14"
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

      {open && (
        <div
          id="menu-categorias"
          className="absolute top-full left-0 z-50 w-[24rem] rounded-b-md border border-gray-200 bg-white shadow-xl"
        >
          <div className="border-b border-gray-100 p-2">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar categorías…"
              aria-label="Filtrar categorías"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-cta"
            />
          </div>

          <ul className="max-h-[60vh] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-5 py-6 text-center text-sm text-gray-500">
                Sin categorías que coincidan.
              </li>
            ) : (
              filtered.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categoria/${c.slug}`}
                    onClick={close}
                    className="flex items-center justify-between px-5 py-2 text-sm text-gray-700 transition-colors hover:bg-brand-light hover:text-brand focus-visible:bg-brand-light focus-visible:outline-none"
                  >
                    <span>{c.name}</span>
                    <span className="text-xs text-gray-500">{c.count}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>

          <div className="border-t border-gray-100 p-2">
            <Link
              href="/tienda"
              onClick={close}
              className="block rounded-md bg-gray-50 px-4 py-2 text-center text-xs font-semibold text-gray-700 transition-colors hover:bg-brand-light hover:text-brand"
            >
              Ver todo el catálogo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

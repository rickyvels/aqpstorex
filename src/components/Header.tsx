'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { CategoryMenu } from './CategoryMenu';
import { OpeningStatus } from './OpeningStatus';
import { site, nav, featuredCategorySlugs } from '~/site.config';
import type { Category } from '@/lib/types';
import type { SessionPayload } from '@/lib/session';

const searchFallback = <div className="h-11 rounded-md border border-gray-300 bg-white" />;

export function Header({
  categories,
  session,
}: {
  categories: Category[];
  session: SessionPayload | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Cierra el menú móvil al navegar.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const featured = featuredCategorySlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is Category => !!c);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Barra superior */}
      <div className="hidden bg-brand text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <p>{site.tagline} · Despachos a todo el Perú</p>
          <div className="flex items-center gap-5">
            <OpeningStatus />
            <a href={`mailto:${site.email}`} className="hover:underline focus-visible:underline">
              {site.email}
            </a>
          </div>
        </div>
      </div>

      {/* Fila principal */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-gray-300 focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none lg:hidden"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
          aria-controls="menu-movil"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {mobileOpen ? (
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>

        <Logo />

        <div className="ml-auto hidden max-w-xl flex-1 lg:block">
          <Suspense fallback={searchFallback}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3 lg:ml-0">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-right text-xs leading-tight sm:block">
                <span className="block text-gray-600">Conectado</span>
                <span className="block max-w-[14rem] truncate font-semibold text-brand">
                  {session.razonSocial}
                </span>
              </span>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none"
                >
                  Salir
                </button>
              </form>
            </div>
          ) : (
            <>
              <Link
                href="/acceder"
                className="hidden rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-cta hover:text-cta focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none sm:block"
              >
                Acceder
              </Link>
              <Link
                href="/registro"
                className="flex items-center gap-2 rounded-md bg-cta px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cta-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="hidden sm:inline">Crear cuenta</span>
                <span className="sm:hidden">Acceso</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Buscador en móvil */}
      <div className="border-t border-gray-100 px-4 py-2 lg:hidden">
        <Suspense fallback={searchFallback}>
          <SearchBar />
        </Suspense>
      </div>

      {/* Barra de navegación */}
      <nav aria-label="Principal" className="border-t border-gray-200 bg-white">
        <div className="mx-auto hidden max-w-7xl items-stretch gap-1 px-4 lg:flex">
          <CategoryMenu categories={categories} />

          {nav.main.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
              className={`flex items-center px-4 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none ${
                pathname === item.href ? 'text-cta' : 'text-gray-700 hover:text-cta'
              }`}
            >
              {item.label}
            </Link>
          ))}

          <span aria-hidden="true" className="my-2 w-px bg-gray-200" />

          {featured.map((c) => (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className="flex items-center px-3 py-3 text-sm text-gray-700 transition-colors hover:text-cta focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Menú móvil */}
      {mobileOpen && (
        <div id="menu-movil" className="max-h-[75vh] overflow-y-auto border-t border-gray-200 bg-white lg:hidden">
          <p className="bg-brand px-5 py-2 text-xs text-white">
            <OpeningStatus />
          </p>

          {nav.main.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block border-b border-gray-100 px-5 py-3 text-sm font-semibold text-gray-800"
            >
              {item.label}
            </Link>
          ))}

          <p className="bg-gray-50 px-5 py-2 text-xs font-bold tracking-wider text-gray-600 uppercase">
            Categorías
          </p>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className="flex items-center justify-between border-b border-gray-100 px-5 py-2.5 text-sm text-gray-700"
            >
              <span>{c.name}</span>
              <span className="text-xs text-gray-500">{c.count}</span>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

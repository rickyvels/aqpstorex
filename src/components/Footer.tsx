import Link from 'next/link';
import { Logo } from './Logo';
import { site, nav } from '~/site.config';
import type { Category } from '@/lib/types';

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-16 bg-brand-dark text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo inverted />
          <p className="mt-4 text-sm leading-relaxed">{site.description}</p>
          <p className="mt-4 text-xs">
            {site.legalName}
            <br />
            RUC {site.ruc}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">Categorías</h3>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categoria/${c.slug}`} className="transition-colors hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">Empresa</h3>
          <ul className="space-y-2 text-sm">
            {[...nav.main, ...nav.legal].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">Contacto</h3>
          <ul className="space-y-3 text-sm">
            <li>{site.address}</li>
            <li>
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-white">
                {site.email}
              </a>
            </li>
            <li>{site.phone}</li>
            <li className="text-xs text-white/60">{site.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. Todos los derechos reservados.
          </p>
          <p>
            Precios y stock visibles solo para clientes mayoristas registrados.
          </p>
        </div>
      </div>
    </footer>
  );
}

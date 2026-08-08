'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/types';

/** Carrusel horizontal con scroll-snap; las flechas desplazan un "ancho visible". */
export function ProductRow({
  title,
  href,
  products,
  authenticated,
}: {
  title: string;
  href: string;
  products: Product[];
  authenticated: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(240, el.clientWidth * 0.8), behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">{title}</h2>
        <div className="flex items-center gap-2">
          <Link
            href={href}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-cta hover:text-cta"
          >
            Más Productos
          </Link>
          <div className="hidden gap-1 sm:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label={`Desplazar ${title} a la izquierda`}
              className="grid h-8 w-8 place-items-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:border-cta hover:text-cta"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label={`Desplazar ${title} a la derecha`}
              className="grid h-8 w-8 place-items-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:border-cta hover:text-cta"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div ref={scroller} className="snap-row -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {products.map((p) => (
          <div key={p.id} className="snap-item w-[46%] shrink-0 sm:w-[31%] md:w-[23%] lg:w-[19%]">
            <ProductCard product={p} authenticated={authenticated} />
          </div>
        ))}
      </div>
    </section>
  );
}

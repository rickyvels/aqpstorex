import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/types';

/** Marcador para los productos del catálogo que no traen foto. */
function ImagePlaceholder({ label }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-50 text-gray-500">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      </svg>
      {label && (
        <span className="px-2 text-center text-[10px] leading-tight font-medium tracking-wide uppercase">
          {label}
        </span>
      )}
    </div>
  );
}

function StockBadge({ inStock }: { inStock: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
        inStock ? 'text-green-700' : 'text-gray-500'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-1.5 w-1.5 rounded-full ${inStock ? 'bg-green-600' : 'bg-gray-400'}`}
      />
      {inStock ? 'En stock' : 'Bajo pedido'}
    </span>
  );
}

/**
 * Bloque de precio.
 *
 * Sin sesión no se muestra el importe, pero sí la disponibilidad: es
 * información útil que no compromete la lista de precios y le da al invitado
 * una razón concreta para registrarse.
 */
export function PriceBlock({ product, authenticated }: { product: Product; authenticated: boolean }) {
  if (!authenticated) {
    return (
      <div className="mt-2">
        <StockBadge inStock={product.inStock} />
        <Link
          href="/acceder"
          className="mt-2 flex items-center justify-center gap-1.5 rounded-md bg-brand-light px-3 py-2 text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-white focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Ver precio mayorista
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-brand">{formatPrice(product.price)}</span>
        {product.onSale && product.regularPrice != null && product.regularPrice > (product.price ?? 0) && (
          <span className="text-xs text-gray-500 line-through">{formatPrice(product.regularPrice)}</span>
        )}
      </div>
      <div className="mt-1">
        <StockBadge inStock={product.inStock} />
      </div>
    </div>
  );
}

export function ProductCard({ product, authenticated }: { product: Product; authenticated: boolean }) {
  const image = product.images[0];
  const category = product.categories[0];

  return (
    <article className="group flex h-full flex-col rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-cta">
      <Link
        href={`/producto/${product.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-square overflow-hidden rounded"
      >
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder label={category?.name} />
        )}
        {product.onSale && (
          <span className="absolute top-1 left-1 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
            OFERTA
          </span>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        {category && (
          <Link
            href={`/categoria/${category.slug}`}
            className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase hover:text-cta focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none"
          >
            {category.name}
          </Link>
        )}

        <h3 className="mt-1">
          <Link
            href={`/producto/${product.slug}`}
            className="clamp-3 text-sm leading-snug font-medium text-gray-800 transition-colors hover:text-cta focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none"
            title={product.name}
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-gray-600">
          {product.brand && <span className="font-semibold text-gray-700">{product.brand}</span>}
          {product.sku && <span className="truncate">SKU: {product.sku}</span>}
        </div>

        <div className="mt-auto">
          <PriceBlock product={product} authenticated={authenticated} />
        </div>
      </div>
    </article>
  );
}

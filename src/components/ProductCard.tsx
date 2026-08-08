import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/types';

/** Marcador para los 100 productos del catálogo que no traen foto. */
function ImagePlaceholder() {
  return (
    <div className="grid h-full w-full place-items-center bg-gray-50 text-gray-300">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  );
}

/**
 * Bloque de precio. Sin sesión muestra la llamada al acceso, igual que el
 * comportamiento mayorista: los precios son solo para clientes registrados.
 */
export function PriceBlock({ product, authenticated }: { product: Product; authenticated: boolean }) {
  if (!authenticated) {
    return (
      <Link
        href="/acceder"
        className="mt-2 block rounded-md bg-brand-light px-3 py-2 text-center text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
      >
        Accede para ver Precios y Stock
      </Link>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-brand">{formatPrice(product.price)}</span>
        {product.onSale && product.regularPrice != null && product.regularPrice > (product.price ?? 0) && (
          <span className="text-xs text-gray-400 line-through">{formatPrice(product.regularPrice)}</span>
        )}
      </div>
      <span className="mt-1 inline-block text-xs font-medium">
        {product.inStock ? (
          <span className="text-green-600">● En stock</span>
        ) : (
          <span className="text-gray-400">● Sin stock</span>
        )}
      </span>
    </div>
  );
}

export function ProductCard({ product, authenticated }: { product: Product; authenticated: boolean }) {
  const image = product.images[0];
  const category = product.categories[0];

  return (
    <article className="group flex h-full flex-col rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md">
      <Link href={`/producto/${product.slug}`} className="relative block aspect-square overflow-hidden rounded">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder />
        )}
        {product.onSale && (
          <span className="absolute top-1 left-1 rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            OFERTA
          </span>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        {category && (
          <Link
            href={`/categoria/${category.slug}`}
            className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase hover:text-cta"
          >
            {category.name}
          </Link>
        )}

        <Link
          href={`/producto/${product.slug}`}
          className="clamp-3 mt-1 text-sm leading-snug font-medium text-gray-800 transition-colors hover:text-cta"
          title={product.name}
        >
          {product.name}
        </Link>

        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
          {product.brand && <span className="font-semibold text-gray-600">{product.brand}</span>}
          {product.sku && <span className="truncate">SKU: {product.sku}</span>}
        </div>

        <div className="mt-auto">
          <PriceBlock product={product} authenticated={authenticated} />
        </div>
      </div>
    </article>
  );
}

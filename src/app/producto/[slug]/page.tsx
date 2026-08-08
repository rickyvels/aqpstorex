import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, getProducts, getRelated, formatPrice } from '@/lib/catalog';
import { getSession } from '@/lib/session';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductRow } from '@/components/ProductRow';
import { site, advisors } from '~/site.config';

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: 'Producto no encontrado' };
  return {
    title: product.name,
    description: product.shortDescription || `${product.name} — disponible al por mayor en ${site.name}.`,
  };
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const session = await getSession();
  const authenticated = !!session;
  const category = product.categories[0];
  const related = getRelated(product, 12);
  const advisor = advisors[0];

  const quoteMessage = encodeURIComponent(
    `Hola ${site.name}, quisiera cotizar: ${product.name}${product.sku ? ` (SKU ${product.sku})` : ''}`,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs text-gray-500">
        <Link href="/" className="hover:text-cta">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/tienda" className="hover:text-cta">
          Tienda
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/categoria/${category.slug}`} className="hover:text-cta">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          {product.brand && (
            <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-bold tracking-wide text-gray-600 uppercase">
              {product.brand}
            </span>
          )}

          <h1 className="mt-3 text-xl leading-snug font-bold text-gray-900 sm:text-2xl">{product.name}</h1>

          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {product.sku && (
              <div className="flex gap-2">
                <dt className="text-gray-500">SKU:</dt>
                <dd className="font-medium text-gray-800">{product.sku}</dd>
              </div>
            )}
            {category && (
              <div className="flex gap-2">
                <dt className="text-gray-500">Categoría:</dt>
                <dd>
                  <Link href={`/categoria/${category.slug}`} className="font-medium text-cta hover:underline">
                    {category.name}
                  </Link>
                </dd>
              </div>
            )}
          </dl>

          {/* Precio: solo para clientes con sesión iniciada */}
          <div className="mt-6 rounded-lg border border-gray-200 p-5">
            {authenticated ? (
              <>
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-brand">{formatPrice(product.price)}</span>
                  {product.onSale &&
                    product.regularPrice != null &&
                    product.regularPrice > (product.price ?? 0) && (
                      <span className="text-base text-gray-400 line-through">
                        {formatPrice(product.regularPrice)}
                      </span>
                    )}
                  <span className="text-xs text-gray-500">precio mayorista + IGV</span>
                </div>

                <p className="mt-2 text-sm font-medium">
                  {product.inStock ? (
                    <span className="text-green-600">● Disponible en stock</span>
                  ) : (
                    <span className="text-gray-400">● Sin stock — consulta reposición</span>
                  )}
                </p>

                <a
                  href={`https://api.whatsapp.com/send?phone=${advisor.phone}&text=${quoteMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block rounded-md bg-cta px-6 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-cta-hover"
                >
                  Solicitar cotización por WhatsApp
                </a>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-800">Precio exclusivo para mayoristas</p>
                <p className="mt-1 text-sm text-gray-500">
                  Accede con tu cuenta de cliente para ver el precio y el stock disponible de este producto.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/acceder"
                    className="rounded-md bg-cta px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-cta-hover"
                  >
                    Accede para ver Precios y Stock
                  </Link>
                  <Link
                    href="/registro"
                    className="rounded-md border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-cta hover:text-cta"
                  >
                    Solicitar cuenta
                  </Link>
                </div>
              </>
            )}
          </div>

          {(product.shortDescription || product.description) && (
            <section className="mt-6">
              <h2 className="mb-2 text-sm font-bold tracking-wider text-gray-800 uppercase">Descripción</h2>
              <p className="text-sm leading-relaxed text-gray-600">
                {product.description || product.shortDescription}
              </p>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && category && (
        <div className="mt-6 border-t border-gray-200">
          <ProductRow
            title="Productos relacionados"
            href={`/categoria/${category.slug}`}
            products={related}
            authenticated={authenticated}
          />
        </div>
      )}
    </div>
  );
}

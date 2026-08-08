import type { Category, Product } from '@/lib/types';
import { site, advisors } from '~/site.config';

/**
 * Datos estructurados schema.org.
 *
 * Los precios NO se incluyen a propósito: son visibles solo tras iniciar sesión
 * y publicarlos en el JSON-LD los expondría a cualquiera, anulando el modelo
 * mayorista. Se declara la disponibilidad y `PriceSpecification` sin importe.
 */

function Script({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // El contenido es un objeto propio serializado, no entrada del usuario.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <Script
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${site.url}/#organization`,
        name: site.legalName,
        alternateName: site.name,
        url: site.url,
        logo: `${site.url}/icon`,
        description: site.description,
        taxID: site.ruc,
        address: {
          '@type': 'PostalAddress',
          streetAddress: site.address,
          addressCountry: 'PE',
        },
        contactPoint: advisors.map((a) => ({
          '@type': 'ContactPoint',
          contactType: 'sales',
          name: a.name,
          telephone: `+${a.phone}`,
          availableLanguage: ['es'],
          areaServed: 'PE',
        })),
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <Script
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: site.url,
        name: site.name,
        inLanguage: 'es-PE',
        publisher: { '@id': `${site.url}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${site.url}/tienda?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  return (
    <Script
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: `${site.url}${item.path}`,
        })),
      }}
    />
  );
}

export function ProductJsonLd({ product }: { product: Product }) {
  const category = product.categories[0];

  return (
    <Script
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        sku: product.sku ?? undefined,
        mpn: product.sku ?? undefined,
        description: product.description || product.shortDescription || product.name,
        category: category?.name,
        image: product.images.map((src) => `${site.url}${src}`),
        brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
        offers: {
          '@type': 'Offer',
          url: `${site.url}/producto/${product.slug}`,
          priceCurrency: site.currency.code,
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          // Precio mayorista bajo registro: se declara la condición, no el importe.
          eligibleCustomerType: 'https://schema.org/Business',
          seller: { '@id': `${site.url}/#organization` },
        },
      }}
    />
  );
}

export function CategoryJsonLd({ category, products }: { category: Category; products: Product[] }) {
  return (
    <Script
      data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: category.name,
        url: `${site.url}/categoria/${category.slug}`,
        isPartOf: { '@id': `${site.url}/#website` },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: category.count,
          itemListElement: products.slice(0, 24).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${site.url}/producto/${p.slug}`,
            name: p.name,
          })),
        },
      }}
    />
  );
}

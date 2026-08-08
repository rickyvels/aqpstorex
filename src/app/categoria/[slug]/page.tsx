import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopView, type ShopSearchParams } from '@/components/ShopView';
import { BreadcrumbJsonLd, CategoryJsonLd } from '@/components/JsonLd';
import { brandsFor, getCategories, getCategory, getProductsByCategory } from '@/lib/catalog';
import { site } from '~/site.config';

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: 'Categoría no encontrada' };

  const brands = brandsFor(category.slug).slice(0, 6);
  const description = `${category.name} al por mayor: ${category.count} productos${
    brands.length ? ` de ${brands.join(', ')}` : ''
  }. Precios mayoristas para revendedores, despacho a todo el Perú.`;

  return {
    title: `${category.name} al por mayor`,
    description: description.slice(0, 160),
    alternates: { canonical: `/categoria/${category.slug}` },
    openGraph: { title: `${category.name} | ${site.name}`, description: description.slice(0, 160) },
  };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ShopSearchParams>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  return (
    <>
      <CategoryJsonLd category={category} products={getProductsByCategory(category.slug)} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Inicio', path: '/' },
          { name: 'Tienda', path: '/tienda' },
          { name: category.name, path: `/categoria/${category.slug}` },
        ]}
      />
      <ShopView
        title={category.name}
        description={`${category.count} ${category.count === 1 ? 'producto' : 'productos'} en esta categoría.`}
        basePath={`/categoria/${category.slug}`}
        category={category.slug}
        searchParams={await searchParams}
      />
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopView, type ShopSearchParams } from '@/components/ShopView';
import { getCategories, getCategory } from '@/lib/catalog';

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
  return {
    title: category.name,
    description: `${category.name}: ${category.count} productos disponibles al por mayor.`,
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
    <ShopView
      title={category.name}
      description={`${category.count} ${category.count === 1 ? 'producto' : 'productos'} en esta categoría.`}
      basePath={`/categoria/${category.slug}`}
      category={category.slug}
      searchParams={await searchParams}
    />
  );
}

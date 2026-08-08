import type { Metadata } from 'next';
import { ShopView, type ShopSearchParams } from '@/components/ShopView';
import { getProducts } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Catálogo completo de cómputo y tecnología al por mayor.',
};

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const total = getProducts().length;

  return (
    <ShopView
      title="Tienda"
      description={`${total} productos disponibles para distribución mayorista.`}
      basePath="/tienda"
      searchParams={params}
    />
  );
}

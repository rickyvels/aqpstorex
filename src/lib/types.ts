/**
 * Tipos y helpers puros del catálogo.
 *
 * Vive aparte de `catalog.ts` a propósito: aquel lee del sistema de archivos y
 * solo puede ejecutarse en el servidor. Los componentes de cliente importan
 * desde aquí para no arrastrar `node:fs` al bundle del navegador.
 */

export type ProductCategory = { name: string; slug: string };

export type Product = {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  brand: string | null;
  categories: ProductCategory[];
  price: number | null;
  regularPrice: number | null;
  salePrice: number | null;
  onSale: boolean;
  inStock: boolean;
  description: string;
  shortDescription: string;
  images: string[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  count: number;
  image: string | null;
};

export type Catalog = { categories: Category[]; products: Product[]; brands: string[] };

export function formatPrice(value: number | null): string {
  if (value == null) return '—';
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

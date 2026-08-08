import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Catalog, Category, Product } from './types';

export type { Catalog, Category, Product, ProductCategory } from './types';
export { formatPrice } from './types';

// El catálogo se lee una sola vez por proceso.
let cache: Catalog | null = null;

function load(): Catalog {
  if (!cache) {
    const raw = readFileSync(join(process.cwd(), 'data', 'catalog.json'), 'utf8');
    cache = JSON.parse(raw) as Catalog;
  }
  return cache;
}

export const getCategories = (): Category[] => load().categories;
export const getProducts = (): Product[] => load().products;
export const getBrands = (): string[] => load().brands;

export const getCategory = (slug: string): Category | undefined =>
  getCategories().find((c) => c.slug === slug);

export const getProduct = (slug: string): Product | undefined =>
  getProducts().find((p) => p.slug === slug);

export const getProductsByCategory = (slug: string): Product[] =>
  getProducts().filter((p) => p.categories.some((c) => c.slug === slug));

/** Productos relacionados: misma categoría, excluyendo el actual. */
export function getRelated(product: Product, limit = 6): Product[] {
  const slug = product.categories[0]?.slug;
  if (!slug) return [];
  return getProductsByCategory(slug)
    .filter((p) => p.id !== product.id)
    .slice(0, limit);
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export type Filters = {
  q?: string;
  category?: string;
  brand?: string;
  sort?: 'nombre' | 'precio-asc' | 'precio-desc';
  page?: number;
  perPage?: number;
  /**
   * Filtro por precio. Solo debe aplicarse con sesión iniciada: para un
   * invitado, acotar por rango revelaría el precio que el acceso protege.
   */
  minPrice?: number;
  maxPrice?: number;
};

export function filterProducts(filters: Filters) {
  const { q, category, brand, sort = 'nombre', page = 1, perPage = 24, minPrice, maxPrice } = filters;
  let items = getProducts();

  if (category) items = items.filter((p) => p.categories.some((c) => c.slug === category));
  if (brand) items = items.filter((p) => p.brand === brand);
  if (minPrice != null) items = items.filter((p) => (p.price ?? 0) >= minPrice);
  if (maxPrice != null) items = items.filter((p) => (p.price ?? 0) <= maxPrice);

  if (q?.trim()) {
    // Cada término debe aparecer en el nombre, SKU o marca.
    const terms = normalize(q).split(/\s+/).filter(Boolean);
    items = items.filter((p) => {
      const haystack = normalize(`${p.name} ${p.sku ?? ''} ${p.brand ?? ''}`);
      return terms.every((t) => haystack.includes(t));
    });
  }

  items = [...items];
  if (sort === 'precio-asc') items.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  else if (sort === 'precio-desc') items.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  else items.sort((a, b) => a.name.localeCompare(b.name, 'es'));

  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pages);

  return {
    items: items.slice((current - 1) * perPage, current * perPage),
    total,
    pages,
    page: current,
  };
}

/** Marcas ordenadas por número de productos, para la franja de prueba social. */
export function getTopBrands(limit = 14): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of getProducts()) {
    if (p.brand) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Rango de precios del catálogo, para acotar el filtro de la tienda. */
export function getPriceRange(category?: string): { min: number; max: number } {
  const items = category ? getProductsByCategory(category) : getProducts();
  const prices = items.map((p) => p.price).filter((p): p is number => p != null && p > 0);
  if (prices.length === 0) return { min: 0, max: 0 };
  return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
}

/** Marcas presentes en un subconjunto, para poblar el filtro lateral. */
export function brandsFor(category?: string): string[] {
  const items = category ? getProductsByCategory(category) : getProducts();
  return [...new Set(items.map((p) => p.brand).filter((b): b is string => !!b))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  );
}


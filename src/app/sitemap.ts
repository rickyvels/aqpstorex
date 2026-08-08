import type { MetadataRoute } from 'next';
import { getCategories, getProducts } from '@/lib/catalog';
import { site } from '~/site.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string) => `${site.url}${path}`;

  const staticPages: MetadataRoute.Sitemap = [
    { url: url('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: url('/tienda'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: url('/registro'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/acceder'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: url('/contactanos'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/politica-de-privacidad'), changeFrequency: 'yearly', priority: 0.2 },
    { url: url('/terminos-y-condiciones'), changeFrequency: 'yearly', priority: 0.2 },
    { url: url('/libro-de-reclamaciones'), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const categories: MetadataRoute.Sitemap = getCategories().map((c) => ({
    url: url(`/categoria/${c.slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const products: MetadataRoute.Sitemap = getProducts().map((p) => ({
    url: url(`/producto/${p.slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...categories, ...products];
}

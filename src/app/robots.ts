import type { MetadataRoute } from 'next';
import { site } from '~/site.config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Área privada y endpoints: nada que indexar.
        disallow: ['/distribucion', '/mi-cuenta', '/api/'],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}

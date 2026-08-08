import type { Metadata } from 'next';
import './globals.css';
import { site } from '~/site.config';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { getCategories } from '@/lib/catalog';
import { getSession } from '@/lib/session';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: {
    default: `${site.name} — Mayorista de Cómputo y Tecnología`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  metadataBase: new URL(site.url),
  alternates: { canonical: '/' },
  openGraph: {
    title: `${site.name} — Mayorista de Cómputo y Tecnología`,
    description: site.description,
    siteName: site.name,
    locale: 'es_PE',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = getCategories();
  const session = await getSession();

  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Saltar al contenido
        </a>
        <Header categories={categories} session={session} />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer categories={categories.slice(0, 8)} />
        <WhatsAppFloat />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </body>
    </html>
  );
}

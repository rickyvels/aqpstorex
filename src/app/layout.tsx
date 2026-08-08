import type { Metadata } from 'next';
import './globals.css';
import { site } from '~/site.config';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { getCategories } from '@/lib/catalog';
import { getSession } from '@/lib/session';

export const metadata: Metadata = {
  title: {
    default: `${site.name} — Mayorista de Cómputo y Tecnología`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  metadataBase: new URL(site.url),
  openGraph: {
    title: `${site.name} — Mayorista de Cómputo y Tecnología`,
    description: site.description,
    siteName: site.name,
    locale: 'es_PE',
    type: 'website',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = getCategories();
  const session = await getSession();

  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <Header categories={categories} session={session} />
        <main className="flex-1">{children}</main>
        <Footer categories={categories.slice(0, 8)} />
        <WhatsAppFloat />
      </body>
    </html>
  );
}

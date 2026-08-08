import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/types';

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-5 border-b border-gray-200 pb-3">
        <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">Categorías</h2>
        <p className="mt-1 text-sm text-gray-500">
          Todo nuestro portafolio de cómputo y tecnología, listo para distribución.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/categoria/${c.slug}`}
            className="group flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:border-cta hover:shadow-md"
          >
            <span className="relative mb-3 block h-16 w-16">
              {c.image ? (
                <Image src={c.image} alt={c.name} fill sizes="64px" className="object-contain" />
              ) : (
                <span className="grid h-full w-full place-items-center rounded-full bg-brand-light text-lg font-bold text-brand">
                  {c.name.charAt(0)}
                </span>
              )}
            </span>
            <span className="text-xs leading-tight font-semibold text-gray-700 group-hover:text-cta">
              {c.name}
            </span>
            <span className="mt-1 text-[11px] text-gray-500">
              {c.count} {c.count === 1 ? 'producto' : 'productos'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

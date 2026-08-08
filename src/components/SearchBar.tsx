'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function SearchBar({ className = '' }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');

  return (
    <form
      role="search"
      className={`flex w-full items-stretch overflow-hidden rounded-md border border-gray-300 bg-white ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/tienda?q=${encodeURIComponent(term)}` : '/tienda');
      }}
    >
      <input
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar producto, marca o SKU…"
        aria-label="Buscar productos"
        className="min-w-0 flex-1 px-4 py-2.5 text-sm outline-none placeholder:text-gray-400"
      />
      <button
        type="submit"
        className="shrink-0 bg-cta px-5 text-sm font-semibold text-white transition-colors hover:bg-cta-hover"
      >
        Buscar
      </button>
    </form>
  );
}

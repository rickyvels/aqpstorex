import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 text-xl font-bold text-gray-900">No encontramos esta página</h1>
      <p className="mt-2 text-sm text-gray-600">
        Puede que el enlace haya cambiado o que el producto ya no esté disponible.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-cta px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-cta-hover"
        >
          Ir al inicio
        </Link>
        <Link
          href="/tienda"
          className="rounded-md border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-cta hover:text-cta"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';

/**
 * Logotipo tipográfico de aqpstorex. Es SVG puro para que escale sin assets.
 * Reemplazable por un archivo de imagen cuando exista el logo definitivo.
 */
export function Logo({ className = '', inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="aqpstorex — inicio">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg font-extrabold tracking-tight ${
          inverted ? 'bg-white text-brand' : 'bg-brand text-white'
        }`}
      >
        a
      </span>
      <span className="leading-none">
        <span
          className={`block text-xl font-extrabold tracking-tight ${
            inverted ? 'text-white' : 'text-brand'
          }`}
        >
          aqp<span className="text-accent">storex</span>
        </span>
        <span
          className={`block text-[10px] font-medium tracking-[0.18em] uppercase ${
            inverted ? 'text-white/70' : 'text-gray-500'
          }`}
        >
          Cómputo y Tecnología
        </span>
      </span>
    </Link>
  );
}

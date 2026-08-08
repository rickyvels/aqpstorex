export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8 border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
        <p className="mt-2 text-xs text-gray-500">Última actualización: {updated}</p>
      </header>

      <div className="space-y-6 text-sm leading-relaxed text-gray-700 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-900 [&_li]:mb-1.5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
        {children}
      </div>

      <p className="mt-10 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        <strong className="font-bold">Aviso:</strong> este texto es una plantilla base y debe ser
        revisado y adaptado por un asesor legal antes de la publicación del sitio.
      </p>
    </div>
  );
}

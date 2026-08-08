import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/catalog';
import { getSession } from '@/lib/session';

/** Escapa un campo para CSV: comillas dobladas y envoltura si hace falta. */
function csvField(value: unknown): string {
  const s = value == null ? '' : String(value);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const headers = ['SKU', 'Nombre', 'Marca', 'Categoria', 'Precio', 'Moneda', 'Stock'];
  const rows = getProducts().map((p) =>
    [
      p.sku ?? '',
      p.name,
      p.brand ?? '',
      p.categories[0]?.name ?? '',
      p.price?.toFixed(2) ?? '',
      'PEN',
      p.inStock ? 'DISPONIBLE' : 'SIN STOCK',
    ]
      .map(csvField)
      .join(';'),
  );

  // BOM para que Excel en español abra el archivo en UTF-8.
  const csv = `﻿${[headers.join(';'), ...rows].join('\r\n')}`;
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="aqpstorex-lista-precios-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}

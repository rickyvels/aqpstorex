import { ImageResponse } from 'next/og';
import { getProducts } from '@/lib/catalog';
import { site } from '~/site.config';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${site.name} — Mayorista de Cómputo y Tecnología`;

/** Imagen para compartir en redes y WhatsApp. */
export default function OpenGraphImage() {
  const total = getProducts().length;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 80px',
          background: 'linear-gradient(135deg, #1c3f8f 0%, #152f6b 100%)',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              color: '#1c3f8f',
              borderRadius: 18,
              fontSize: 48,
              fontWeight: 800,
            }}
          >
            a
          </div>
          <div style={{ display: 'flex', fontSize: 52, fontWeight: 800 }}>
            aqp<span style={{ color: '#00a8d6' }}>storex</span>
          </div>
        </div>

        <div style={{ display: 'flex', marginTop: 40, fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
          Tecnología al por mayor
        </div>

        <div style={{ display: 'flex', marginTop: 24, fontSize: 30, color: 'rgba(255,255,255,0.8)' }}>
          {total} productos · Despacho a todo el Perú
        </div>
      </div>
    ),
    size,
  );
}

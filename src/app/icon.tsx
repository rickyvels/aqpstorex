import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/** Favicon generado: la «a» de aqpstorex sobre el azul de marca. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1c3f8f',
          color: '#fff',
          fontSize: 46,
          fontWeight: 800,
          borderRadius: 12,
        }}
      >
        a
      </div>
    ),
    size,
  );
}

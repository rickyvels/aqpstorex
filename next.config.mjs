/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Las fotos de producto son PNG/JPG de 500x500 (algunas de 800 KB) que se
    // muestran a 64-220 px. Con la optimización activa Next sirve AVIF/WebP en
    // el tamaño real de uso, en vez del original a tamaño completo.
    formats: ['image/avif', 'image/webp'],
    // Anchos que realmente usa la interfaz: miniaturas, tarjetas y ficha.
    imageSizes: [48, 64, 96, 128, 220, 320],
    deviceSizes: [480, 640, 828, 1080, 1200],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  poweredByHeader: false,
};

export default nextConfig;

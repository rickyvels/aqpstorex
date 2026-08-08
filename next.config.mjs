/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Las imágenes viven en public/img, no hace falta optimización remota.
    unoptimized: true,
  },
};

export default nextConfig;

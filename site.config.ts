/**
 * Configuración central de marca de aqpstorex.
 * Todo lo editable del sitio (nombre, colores, contacto, asesores) vive aquí.
 * Los valores marcados como PLACEHOLDER deben reemplazarse por los datos reales.
 */

export const site = {
  name: 'aqpstorex',
  legalName: 'AQPSTOREX S.A.C.', // PLACEHOLDER
  tagline: 'Tecnología a tu servicio',
  description:
    'aqpstorex — Mayorista de cómputo y tecnología. Distribución al por mayor de laptops, impresoras, componentes, redes y accesorios para todo el Perú.',
  url: 'https://aqpstorex.pe', // PLACEHOLDER
  ruc: '20000000000', // PLACEHOLDER
  email: 'ventas@aqpstorex.pe', // PLACEHOLDER
  phone: '(054) 000 000', // PLACEHOLDER
  address: 'Av. Ejemplo 123, Cercado, Arequipa, Perú', // PLACEHOLDER
  hours: 'Lun a Vie 9:00 – 18:30 · Sáb 9:00 – 13:00',
  currency: { code: 'PEN', symbol: 'S/' },
} as const;

/** Asesores de ventas del widget flotante de WhatsApp. PLACEHOLDER: números reales. */
export const advisors = [
  { name: 'Ventas Corporativas', role: 'Cotizaciones y licitaciones', phone: '51900000001' },
  { name: 'Cómputo y Portátiles', role: 'Laptops, PCs y All in One', phone: '51900000002' },
  { name: 'Impresión y Suministros', role: 'Impresoras, tintas y tóner', phone: '51900000003' },
  { name: 'Redes y Seguridad', role: 'Switches, cámaras y racks', phone: '51900000004' },
  { name: 'Soporte Post Venta', role: 'Garantías y RMA', phone: '51900000005' },
] as const;

/** Paleta. Se inyecta como variables CSS en globals.css. */
export const theme = {
  primary: '#1c3f8f',
  primaryDark: '#152f6b',
  accent: '#00a8d6',
  cta: '#1c61e7',
  ctaHover: '#1550c4',
} as const;

/** Categorías destacadas del menú principal (slug del catálogo). */
export const featuredCategorySlugs = [
  'portatiles',
  'impresoras',
  'mainboard',
  'procesador',
  'disco-duro',
  'memorias',
] as const;

/** Secciones con carrusel en la portada, en orden. */
export const homeSections = [
  { slug: 'portatiles', title: 'Portátiles / Laptops' },
  { slug: 'impresoras', title: 'Impresoras' },
  { slug: 'disco-duro', title: 'Discos HDD / SSD' },
  { slug: 'mainboard', title: 'Mainboards' },
  { slug: 'monitores', title: 'Monitores' },
  { slug: 'redes', title: 'Redes' },
  { slug: 'camaras-de-seguridad', title: 'Cámaras de Seguridad' },
  { slug: 'teclados', title: 'Teclados' },
] as const;

export const nav = {
  main: [
    { label: 'Inicio', href: '/' },
    { label: 'Tienda', href: '/tienda' },
    { label: 'Distribución', href: '/distribucion' },
    { label: 'Contáctanos', href: '/contactanos' },
  ],
  legal: [
    { label: 'Política de Privacidad', href: '/politica-de-privacidad' },
    { label: 'Términos y Condiciones', href: '/terminos-y-condiciones' },
    { label: 'Libro de Reclamaciones', href: '/libro-de-reclamaciones' },
  ],
} as const;

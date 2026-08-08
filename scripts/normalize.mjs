// Normaliza el catálogo crudo (WooCommerce Store API) a un JSON limpio para aqpstorex.
// Uso: node scripts/normalize.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const RAW = 'data/raw';
const OUT = 'data';

const NAMED_ENTITIES = {
  nbsp: ' ',
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  rsquo: '’',
  lsquo: '‘',
  ldquo: '“',
  rdquo: '”',
  deg: '°',
  trade: '™',
  reg: '®',
  copy: '©',
  eacute: 'é',
  aacute: 'á',
  iacute: 'í',
  oacute: 'ó',
  uacute: 'ú',
  ntilde: 'ñ',
  Ntilde: 'Ñ',
};

const decodePass = (s) =>
  s
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name] ?? match);

// WooCommerce devuelve los títulos con entidades HTML, a veces doblemente
// codificadas (&amp;#8211;). Se itera hasta que el texto deja de cambiar.
const decodeEntities = (s = '') => {
  let out = s;
  for (let i = 0; i < 3; i++) {
    const next = decodePass(out);
    if (next === out) break;
    out = next;
  }
  return out;
};

const clean = (s = '') => decodeEntities(s).replace(/\s+/g, ' ').trim();

const stripTags = (html = '') => clean(html.replace(/<[^>]*>/g, ' '));

// Cualquier rastro de la marca original desaparece del contenido.
const debrand = (s = '') =>
  s
    .replace(/trading\s*store\s*(s\.?r\.?l\.?)?/gi, 'aqpstorex')
    .replace(/tradingstore\.pe/gi, 'aqpstorex.pe')
    .replace(/tradingstore/gi, 'aqpstorex');

// Nombre de archivo local estable para cada imagen remota.
const imgName = (url) => {
  const clean = url.split('?')[0];
  let name = basename(clean);
  const ext = extname(name).toLowerCase() || '.jpg';
  name = name
    .slice(0, name.length - extname(name).length)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 70);
  return `${name}${ext}`;
};

// ---------- categorías ----------
const rawCats = JSON.parse(readFileSync(join(RAW, 'categories.json'), 'utf8'));
const categories = rawCats
  .filter((c) => c.count > 0)
  .map((c) => ({
    id: c.id,
    name: debrand(clean(c.name)),
    slug: c.slug,
    count: c.count,
    image: c.image?.src ? `/img/cat/${imgName(c.image.src)}` : null,
    _remoteImage: c.image?.src || null,
  }))
  .sort((a, b) => b.count - a.count);

// ---------- productos ----------
const files = readdirSync(RAW).filter((f) => f.startsWith('products-'));
const rawProducts = files.flatMap((f) => JSON.parse(readFileSync(join(RAW, f), 'utf8')));

const seen = new Set();
const products = [];

for (const p of rawProducts) {
  if (seen.has(p.id)) continue;
  seen.add(p.id);

  const brandAttr = (p.attributes || []).find((a) => a.taxonomy === 'pa_brand');
  const brandRaw = brandAttr?.terms?.[0]?.name;
  const brand = brandRaw && brandRaw.trim() !== '_' ? brandRaw : null;

  const images = (p.images || [])
    .map((i) => i.src)
    .filter(Boolean)
    .map((src) => ({ local: `/img/p/${imgName(src)}`, remote: src }));

  // Store API entrega el precio en la unidad mínima (céntimos).
  const minor = p.prices?.currency_minor_unit ?? 2;
  const toSoles = (v) => (v == null || v === '' ? null : Number(v) / 10 ** minor);

  products.push({
    id: p.id,
    name: debrand(clean(p.name)),
    slug: p.slug,
    sku: p.sku ? clean(p.sku) : null,
    brand: brand ? clean(brand) : null,
    categories: (p.categories || []).map((c) => ({ name: debrand(clean(c.name)), slug: c.slug })),
    price: toSoles(p.prices?.price),
    regularPrice: toSoles(p.prices?.regular_price),
    salePrice: toSoles(p.prices?.sale_price),
    onSale: !!p.on_sale,
    inStock: !!p.is_in_stock,
    description: debrand(stripTags(p.description)),
    shortDescription: debrand(stripTags(p.short_description)),
    images: images.map((i) => i.local),
    _remoteImages: images.map((i) => i.remote),
  });
}

products.sort((a, b) => a.name.localeCompare(b.name, 'es'));

// ---------- marcas ----------
const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort((a, b) =>
  a.localeCompare(b, 'es'),
);

// ---------- manifiesto de imágenes a descargar ----------
const manifest = [];
for (const c of categories) if (c._remoteImage) manifest.push({ url: c._remoteImage, dest: `public/img/cat/${imgName(c._remoteImage)}` });
for (const p of products)
  for (const url of p._remoteImages) manifest.push({ url, dest: `public/img/p/${imgName(url)}` });
const uniqueManifest = [...new Map(manifest.map((m) => [m.dest, m])).values()];

// ---------- escritura ----------
mkdirSync(OUT, { recursive: true });
const stripPrivate = (o) =>
  JSON.parse(JSON.stringify(o, (k, v) => (k.startsWith('_') ? undefined : v)));

writeFileSync(
  join(OUT, 'catalog.json'),
  JSON.stringify(stripPrivate({ categories, products, brands }), null, 2),
);
writeFileSync(join(OUT, 'images.manifest.json'), JSON.stringify(uniqueManifest, null, 2));

const sinImagen = products.filter((p) => p.images.length === 0).length;
console.log(`categorías: ${categories.length}`);
console.log(`productos:  ${products.length} (sin imagen: ${sinImagen})`);
console.log(`marcas:     ${brands.length}`);
console.log(`imágenes a descargar: ${uniqueManifest.length}`);

// Normaliza el catálogo crudo a data/catalog.json.
//
//   node scripts/normalize.mjs
//
// Cruza dos fuentes: la Store API aporta precios, imágenes y stock; la taxonomía
// de WP REST aporta la clasificación real. Los contadores de categoría se
// derivan de los productos, nunca del campo `count` de la API (está obsoleto:
// declaraba 80 productos en MOCHILAS cuando en realidad tiene 0).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const RAW = 'data/raw';
const OUT = 'data';

const read = (name) => JSON.parse(readFileSync(join(RAW, name), 'utf8'));

// ---------------------------------------------------------------- texto ----

const NAMED_ENTITIES = {
  nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>',
  hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', deg: '°', trade: '™', reg: '®', copy: '©',
  eacute: 'é', aacute: 'á', iacute: 'í', oacute: 'ó', uacute: 'ú',
  ntilde: 'ñ', Ntilde: 'Ñ',
};

const decodePass = (s) =>
  s
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name] ?? match);

// A veces vienen doblemente codificadas (&amp;#8211;): se itera hasta estabilizar.
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

// Ningún rastro de la marca de origen llega al sitio publicado.
const debrand = (s = '') =>
  s
    .replace(/trading\s*store\s*(s\.?r\.?l\.?)?/gi, 'aqpstorex')
    .replace(/tradingstore\.pe/gi, 'aqpstorex.pe')
    .replace(/tradingstore/gi, 'aqpstorex');

const text = (s) => debrand(clean(s));

// -------------------------------------------------------------- imágenes ----

const imgName = (url) => {
  const clean = url.split('?')[0];
  const raw = basename(clean);
  const ext = extname(raw).toLowerCase() || '.jpg';
  const stem = raw
    .slice(0, raw.length - extname(raw).length)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 70);
  return `${stem}${ext}`;
};

// ------------------------------------------------------------ taxonomía ----

const terms = read('category-terms.json');
const storeCategories = read('store-categories.json');
const assignments = read('assignments.json');
const rawProducts = read('products.json');

// id de término -> datos de categoría. La imagen solo la tiene la Store API.
const imageBySlug = new Map(
  storeCategories.filter((c) => c.image?.src).map((c) => [c.slug, c.image.src]),
);

// Las dos APIs no exponen el mismo conjunto de términos: WP REST devuelve 36 y
// la Store API 44 (incluye web-cam y lector-de-codigos-de-barras, que WP omite).
// El registro se construye como unión para que ninguna categoría real se pierda.
const termBySlug = new Map();
for (const c of storeCategories) {
  termBySlug.set(c.slug, {
    id: c.id,
    name: text(c.name),
    slug: c.slug,
    remoteImage: c.image?.src ?? null,
  });
}
for (const t of terms) {
  const existing = termBySlug.get(t.slug);
  termBySlug.set(t.slug, {
    id: t.id,
    name: text(t.name),
    slug: t.slug,
    remoteImage: existing?.remoteImage ?? imageBySlug.get(t.slug) ?? null,
  });
}

// Solo los términos de WP REST tienen los ids que usan las asignaciones.
const termById = new Map(terms.map((t) => [t.id, termBySlug.get(t.slug)]).filter(([, v]) => v));

// id de producto -> ids de sus categorías
const catsByProduct = new Map(assignments.map((a) => [a.id, a.product_cat ?? []]));

// El origen deja unos pocos productos sin clasificar. Sin categoría quedarían
// inaccesibles desde la navegación, así que se reencaminan por nombre a un
// término que ya existe en la taxonomía. Revisar si el catálogo crece.
const FALLBACK_RULES = [
  { match: /c[áa]mara\s*(web|enkore)|web\s*cam/i, slug: 'web-cam' },
  { match: /lector de c[óo]digo/i, slug: 'lector-de-codigos-de-barras' },
];

function fallbackCategory(name) {
  for (const rule of FALLBACK_RULES) {
    if (rule.match.test(name)) {
      const term = termBySlug.get(rule.slug);
      if (term) return [{ name: term.name, slug: term.slug }];
    }
  }
  return [];
}

// -------------------------------------------------------------- productos ----

const seen = new Set();
const products = [];
const sinCategoria = [];

for (const p of rawProducts) {
  if (seen.has(p.id)) continue;
  seen.add(p.id);

  const brandAttr = (p.attributes ?? []).find((a) => a.taxonomy === 'pa_brand');
  const brandRaw = brandAttr?.terms?.[0]?.name;
  const brand = brandRaw && brandRaw.trim() !== '_' ? clean(brandRaw) : null;

  // La clasificación sale de WP REST; la de la Store API viene incompleta.
  let categories = (catsByProduct.get(p.id) ?? [])
    .map((id) => termById.get(id))
    .filter(Boolean)
    .map((t) => ({ name: t.name, slug: t.slug }));

  if (categories.length === 0) categories = fallbackCategory(p.name);
  if (categories.length === 0) sinCategoria.push(p.name);

  const images = (p.images ?? []).map((i) => i.src).filter(Boolean);

  // La Store API entrega el precio en la unidad mínima (céntimos).
  const minor = p.prices?.currency_minor_unit ?? 2;
  const toSoles = (v) => (v == null || v === '' ? null : Number(v) / 10 ** minor);

  products.push({
    id: p.id,
    name: text(p.name),
    slug: p.slug,
    sku: p.sku ? clean(p.sku) : null,
    brand,
    categories,
    price: toSoles(p.prices?.price),
    regularPrice: toSoles(p.prices?.regular_price),
    salePrice: toSoles(p.prices?.sale_price),
    onSale: !!p.on_sale,
    inStock: !!p.is_in_stock,
    description: text(stripTags(p.description)),
    shortDescription: text(stripTags(p.short_description)),
    images: images.map((src) => `/img/p/${imgName(src)}`),
    _remoteImages: images,
  });
}

products.sort((a, b) => a.name.localeCompare(b.name, 'es'));

// ------------------------------------------------------------ categorías ----

// Contadores reales, calculados sobre los productos que existen.
const counts = new Map();
for (const p of products) {
  for (const c of p.categories) counts.set(c.slug, (counts.get(c.slug) ?? 0) + 1);
}

const categories = [...termBySlug.values()]
  .filter((t) => (counts.get(t.slug) ?? 0) > 0) // fuera las categorías vacías
  .map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    count: counts.get(t.slug),
    image: t.remoteImage ? `/img/cat/${imgName(t.remoteImage)}` : null,
    _remoteImage: t.remoteImage,
  }))
  .sort((a, b) => b.count - a.count);

const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort((a, b) =>
  a.localeCompare(b, 'es'),
);

// ------------------------------------------------- manifiesto de imágenes ----

const manifest = new Map();
for (const c of categories) {
  if (c._remoteImage) manifest.set(`public/img/cat/${imgName(c._remoteImage)}`, c._remoteImage);
}
for (const p of products) {
  for (const url of p._remoteImages) manifest.set(`public/img/p/${imgName(url)}`, url);
}

// ---------------------------------------------------------------- salida ----

mkdirSync(OUT, { recursive: true });
const stripPrivate = (o) =>
  JSON.parse(JSON.stringify(o, (k, v) => (k.startsWith('_') ? undefined : v)));

writeFileSync(
  join(OUT, 'catalog.json'),
  JSON.stringify(stripPrivate({ categories, products, brands }), null, 2),
);
writeFileSync(
  join(OUT, 'images.manifest.json'),
  JSON.stringify(
    [...manifest].map(([dest, url]) => ({ url, dest })),
    null,
    2,
  ),
);

const vacias = [...termBySlug.values()].filter((t) => !(counts.get(t.slug) > 0));
const sinImagen = products.filter((p) => p.images.length === 0).length;

console.log(`productos:   ${products.length} (sin imagen: ${sinImagen})`);
console.log(`categorías:  ${categories.length} con productos, ${vacias.length} vacías descartadas`);
console.log(`marcas:      ${brands.length}`);
console.log(`imágenes:    ${manifest.size}`);

if (sinCategoria.length) {
  console.warn(`\n⚠ ${sinCategoria.length} producto(s) sin categoría:`);
  for (const name of sinCategoria.slice(0, 10)) console.warn(`   · ${clean(name).slice(0, 70)}`);
}

// Descarga el catálogo crudo desde la API del proveedor a data/raw/.
//
//   node scripts/fetch-catalog.mjs
//
// Se descargan dos fuentes porque se complementan:
//   · Store API  (/wc/store/v1)  → precios, imágenes, descripciones, stock
//   · WP REST    (/wp/v2)        → asignación real de categorías y marcas
//
// La Store API es la única con precios, pero sus contadores de categoría están
// obsoletos y omite la categoría de algunos productos. La taxonomía de WP REST
// es la fuente autoritativa para clasificar.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SOURCE = process.env.CATALOG_SOURCE ?? 'https://tradingstore.pe';
const RAW = join(process.cwd(), 'data', 'raw');

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json',
  'Accept-Language': 'es-PE,es;q=0.9',
  Referer: `${SOURCE}/tienda/`,
};

async function getJson(path) {
  const res = await fetch(`${SOURCE}${path}`, { headers, signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`${res.status} en ${path}`);
  return res.json();
}

/** Recorre un endpoint paginado hasta agotarlo. */
async function getAll(path, label) {
  const out = [];
  for (let page = 1; page <= 30; page++) {
    const sep = path.includes('?') ? '&' : '?';
    const batch = await getJson(`${path}${sep}per_page=100&page=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch);
    if (batch.length < 100) break;
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(`  ${label}: ${out.length}`);
  return out;
}

mkdirSync(RAW, { recursive: true });
console.log(`Origen: ${SOURCE}\n`);

console.log('Store API:');
const products = await getAll('/wp-json/wc/store/v1/products', 'productos');
const storeCategories = await getAll('/wp-json/wc/store/v1/products/categories', 'categorías');

console.log('\nWP REST (taxonomía):');
const terms = await getAll(
  '/wp-json/wp/v2/product_cat?_fields=id,slug,name,count,parent',
  'términos de categoría',
);

// El sitio tiene ~4.181 productos publicados pero solo ~495 visibles en tienda;
// el resto están descatalogados. Se piden las asignaciones por ID en lotes, en
// lugar de recorrer todo el post type, para no arrastrar los ocultos ni
// depender del orden de paginación.
const ids = products.map((p) => p.id);
const assignments = [];
for (let i = 0; i < ids.length; i += 100) {
  const chunk = ids.slice(i, i + 100);
  const batch = await getJson(
    `/wp-json/wp/v2/product?include=${chunk.join(',')}&per_page=100&_fields=id,slug,product_cat,product_brand`,
  );
  assignments.push(...batch);
  await new Promise((r) => setTimeout(r, 300));
}
console.log(`  asignaciones de producto: ${assignments.length} (de ${ids.length} pedidas)`);

const write = (name, data) => {
  writeFileSync(join(RAW, name), JSON.stringify(data, null, 2), 'utf8');
};

write('products.json', products);
write('store-categories.json', storeCategories);
write('category-terms.json', terms);
write('assignments.json', assignments);

console.log('\nGuardado en data/raw/. Siguiente paso: node scripts/normalize.mjs');

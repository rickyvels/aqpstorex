# Auditoría UX/UI y frontend — aqpstorex

Revisión de `aqpstorex.vercel.app` como tienda mayorista B2B.
Fecha: 8 de agosto de 2026.

Los hallazgos van clasificados por impacto. Los marcados **[HECHO]** ya están
implementados y verificados; los demás quedan como recomendación.

---

## Resumen

| Métrica | Antes | Después |
| --- | ---: | ---: |
| Categorías con contador falso | 15 | 0 |
| Productos inalcanzables por navegación | 35 | 0 |
| Sección «Portátiles» en la home | ausente | 30 productos |
| Imágenes con `srcset` | 0 / 97 | 93 / 93 |
| `sitemap.xml` · `robots.txt` · favicon · OG | 404 | OK |
| Tipos de datos estructurados | 0 | 5 |
| Comprobaciones automáticas | 16 | 30 |

---

## ALTO impacto

### 1. El catálogo estaba roto en su clasificación **[HECHO]**

El hallazgo más grave, y no era visual.

La Store API de WooCommerce declaraba contadores obsoletos: decía que `MOCHILAS`
tenía 80 productos y `REPUESTOS` 49 cuando ambas están vacías, y omitía la
categoría de 35 productos reales. Consecuencias en producción:

- **La sección «Portátiles» desaparecía de la home.** `ProductRow` devuelve
  `null` con cero productos, así que fallaba en silencio. La categoría de mayor
  ticket del catálogo no se mostraba en ningún sitio.
- 15 categorías eran callejones sin salida: el grid anunciaba «80 productos» y
  al entrar aparecía «No encontramos productos».
- 35 productos, entre ellos un HP OMEN de S/ 4.872, no se alcanzaban desde
  ninguna categoría.

La causa: los contadores de la Store API estaban sin recalcular. La taxonomía de
WP REST (`/wp/v2/product_cat` y el campo `product_cat` de cada producto) sí es
correcta. Ahora se cruzan ambas fuentes: precios e imágenes de la Store API,
clasificación de WP REST, y **los contadores se derivan de los productos reales**:

```js
// scripts/normalize.mjs
const counts = new Map();
for (const p of products) {
  for (const c of p.categories) counts.set(c.slug, (counts.get(c.slug) ?? 0) + 1);
}

const categories = [...termBySlug.values()]
  .filter((t) => (counts.get(t.slug) ?? 0) > 0) // fuera las categorías vacías
  .map((t) => ({ ...t, count: counts.get(t.slug) }));
```

Resultado: 495 productos, 32 categorías, suma exacta, cero huérfanos. El
normalizador ahora avisa por consola si vuelve a aparecer un producto sin
clasificar.

> Nota: WordPress tiene 4.181 productos publicados, pero solo 495 son visibles
> en tienda; el resto están descatalogados. Los 495 son el catálogo correcto.

### 2. Imágenes sin optimizar **[HECHO]**

`next.config.mjs` tenía `images.unoptimized: true`. Se servían PNG/JPG de
500×500 px —uno de 810 KB— para mostrarlos a 64 px, y **ninguna de las 97
imágenes tenía `srcset`**.

```js
// next.config.mjs
images: {
  formats: ['image/avif', 'image/webp'],
  imageSizes: [48, 64, 96, 128, 220, 320],   // anchos que usa la interfaz
  deviceSizes: [480, 640, 828, 1080, 1200],
  minimumCacheTTL: 60 * 60 * 24 * 30,
},
```

Ahora las 93 imágenes llevan `srcset` y se sirven en AVIF/WebP al tamaño real de
uso. Las dos primeras tarjetas del hero llevan `priority`; el resto es lazy.

### 3. SEO técnico inexistente **[HECHO]**

`sitemap.xml`, `robots.txt`, favicon y `og:image` devolvían **404**. No había
canonical ni un solo dato estructurado.

Añadido: `src/app/sitemap.ts` (527 URLs), `src/app/robots.ts` (bloquea
`/distribucion`, `/mi-cuenta` y `/api/`), favicon y OG generados con
`next/og`, canonical por página, y cinco tipos de schema.org —
`Organization`, `WebSite` con `SearchAction`, `BreadcrumbList`, `Product` y
`CollectionPage`.

**Decisión importante:** el `Product` JSON-LD **no incluye el precio**. Los
precios están tras el login; publicarlos en los datos estructurados los
expondría a cualquiera y anularía el modelo mayorista. Se declara la
disponibilidad y el tipo de cliente:

```tsx
offers: {
  '@type': 'Offer',
  priceCurrency: 'PEN',
  availability: product.inStock
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock',
  eligibleCustomerType: 'https://schema.org/Business',
}
```

Renuncias al *rich result* de precio, pero es la única opción coherente con
tener el catálogo cerrado.

### 4. La propuesta de valor mayorista no se comunicaba **[HECHO]**

El invitado veía «Accede para ver Precios y Stock» repetido 96 veces y ninguna
razón para registrarse.

- **Hero rejerarquizado**: titular a 3,4 rem con la segunda línea en color de
  acento, CTA primario `Crear cuenta mayorista` en blanco sólido frente a
  `Explorar catálogo` en contorno, microcopia de fricción («Gratis · Sin
  compromiso de compra · Activación en 24 h hábiles») y tres cifras de
  credibilidad (495 productos · 32 categorías · 43 marcas).
- **Bloque `WholesaleCta`** con cuatro beneficios concretos, **escala de
  descuento por volumen** y tiempos de entrega. Hace tangible el beneficio
  antes de pedir datos.
- **Accesos rápidos curados**. Antes salían las cuatro categorías con más
  unidades: Mochilas, Mouse, Teclados y Repuestos. Ahora se eligen a mano por
  valor comercial:

```ts
// site.config.ts
export const heroCategorySlugs = ['portatiles', 'impresoras', 'redes', 'monitores'];
```

### 5. La tarjeta bloqueada no daba ninguna información **[HECHO]**

Un invitado no sabía siquiera si el producto existía en stock. Ahora se muestra
la disponibilidad —dato útil que no compromete la lista de precios— y el CTA es
explícito sobre qué se desbloquea:

```tsx
if (!authenticated) {
  return (
    <div className="mt-2">
      <StockBadge inStock={product.inStock} />
      <Link href="/acceder" className="...">
        <LockIcon /> Ver precio mayorista
      </Link>
    </div>
  );
}
```

---

## MEDIO impacto

### 6. Navegación por categorías **[HECHO]**

El desplegable listaba 32 categorías sin filtro. Se añadió buscador incremental
con foco automático, cierre con `Escape` devolviendo el foco al disparador, y
enlace final a todo el catálogo. Escribir «impre» reduce de 32 a 1 resultado.

### 7. Filtro por rango de precio **[HECHO]**

No existía. Se añadió, **solo para clientes con sesión**, y esto último no es un
detalle: si un invitado pudiera filtrar por rango, deduciría por tanteo los
precios que el login oculta. El servidor ignora `min`/`max` sin sesión, aunque
vengan forzados en la URL:

```ts
const parsePrice = (value?: string) => {
  if (!authenticated || !value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};
```

Hay una prueba automática que verifica que `/tienda?min=100&max=200` devuelve
los 495 productos para un invitado y acota para un cliente.

### 8. Filtros en móvil **[HECHO]**

La barra lateral se apilaba sobre el grid: había que pasar 32 enlaces de
categoría antes de ver un producto. Ahora se pliega tras un botón por debajo de
`lg`, con contador de filtros activos. El primer producto pasó de ~1.500 px a
450 px de scroll.

### 9. Accesibilidad **[HECHO]**

- Ocho elementos con `text-gray-400` sobre blanco (contraste 2,6:1, por debajo
  del mínimo 4,5:1 de WCAG AA) subidos a `text-gray-500/600`.
- Enlace «Saltar al contenido» y `<main id="contenido">`.
- Anillos de foco visibles (`focus-visible:ring-2`) en toda la navegación,
  filtros, tarjetas y CTAs.
- Objetivos táctiles de los filtros a 44 px en móvil (`min-h-11`), relajados a
  partir de `lg`.
- `aria-expanded`, `aria-controls` y `aria-current` en menús y navegación;
  iconos decorativos con `aria-hidden`.
- Nombres de producto envueltos en `<h3>`: antes el grid no tenía jerarquía.

### 10. Prueba social **[HECHO parcialmente]**

Añadidos: franja de 14 marcas distribuidas enlazadas a su filtro, tiempos de
entrega por destino en el footer y en el bloque de conversión, e **indicador de
atención en vivo** que calcula abierto/cerrado sobre el horario comercial en
hora de Perú y se actualiza cada minuto.

**Falta:** testimonios de clientes. No los he inventado — un testimonio
fabricado en un sitio comercial es publicidad engañosa. Pásame dos o tres
reales, con nombre de empresa y autorización, y los monto.

---

## BAJO impacto

### 11. Imágenes de producto faltantes

100 de 495 productos no tienen foto en el origen. Ahora muestran un marcador con
icono y el nombre de la categoría, en vez de un icono genérico suelto. La
solución real es pedir las fichas al fabricante o al distribuidor; no es un
problema de código.

### 12. Dos categorías sin imagen

`WEB CAM` y `LECTOR DE CODIGOS DE BARRAS` no traen imagen de categoría en el
origen (existen solo en la Store API, no en la taxonomía de WP). Muestran un
marcador con la inicial.

### 13. Peso del HTML

La home pesa 558 KB sin comprimir y **87 KB con gzip** (menos con brotli en
Vercel). Los carruseles bajaron de 12 a 10 productos. Aceptable; si quieres
recortar más, el siguiente paso sería cargar bajo demanda los carruseles por
debajo del pliegue.

---

## Requiere tus datos o tu decisión

Estos no los puedo resolver yo:

1. **Datos de contacto reales.** El footer sigue con `Av. Ejemplo 123`, RUC
   `20000000000` y teléfono `(054) 000 000`, y los cinco asesores tienen
   números `51900000001`–`5`. Están todos en `site.config.ts` marcados
   `// PLACEHOLDER`. No puedo inventarlos: un RUC o una dirección falsos en un
   sitio comercial son un problema legal, no un detalle de maquetación.

2. **La escala de descuento por volumen.** Las cifras actuales (−4 %, −7 %,
   −11 % desde S/ 3.000 / 10.000 / 25.000 al mes) son de ejemplo. Son una
   promesa contractual frente al cliente: confírmalas con tu área comercial o
   quita el bloque.

3. **Los tiempos de entrega.** Igual: «Mismo día en Arequipa», «24–48 h Lima»
   son plausibles pero inventados. Ajústalos a tu operador real.

4. **Los precios.** Siguen siendo los del proveedor, sin tu margen. Ya lo
   comenté: publicarlos así significa vender a costo y exponer la lista
   confidencial de tu mayorista.

5. **Testimonios**, según el punto 10.

### Sobre el copyright «© 2026»

Lo revisé y **no era un fallo**. El footer ya usaba `new Date().getFullYear()`,
o sea que es dinámico, y 2026 es el año en curso. Se renderiza como
`© <!-- -->2026` porque React separa los nodos de texto, que es probablemente lo
que te hizo pensar que estaba fijo. No he cambiado nada ahí.

---

## Verificación

```bash
npm run dev
npm run smoke
```

30 comprobaciones automáticas: rutas protegidas con y sin sesión, que ningún
precio de producto aparezca en el HTML del invitado, que el filtro de precio no
sea explotable, el CSV de distribución, los bloques de conversión y la
verificación de contraseñas.

Responsividad comprobada a 375 px, 768 px y 1280 px: sin desbordamiento
horizontal, grid de 2 → 4 columnas, nav de escritorio oculta en móvil y filtros
plegados.

Build de producción: 545 páginas estáticas, sin errores de tipos.

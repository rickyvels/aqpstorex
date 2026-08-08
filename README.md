# aqpstorex

Tienda mayorista de cómputo y tecnología, construida con Next.js 15 (App Router),
React 19, TypeScript y Tailwind CSS 4.

Replica la estructura y el funcionamiento de un portal de distribución B2B: catálogo
público, y **precios y stock visibles solo para clientes registrados**.

---

## Puesta en marcha

```bash
npm install
npm run dev
```

El sitio queda en <http://localhost:3000>.

Para producción:

```bash
npm run build
npm start
```

### Variables de entorno

Copia `.env.example` a `.env.local`:

| Variable         | Obligatoria      | Descripción                                     |
| ---------------- | ---------------- | ----------------------------------------------- |
| `SESSION_SECRET` | Sí en producción | Clave HS256 para firmar la cookie de sesión.     |

Sin `SESSION_SECRET`, el arranque en producción falla a propósito. En desarrollo se
usa una clave fija insegura.

---

## Estructura

```
site.config.ts           Configuración de marca: nombre, colores, contacto, asesores
data/catalog.json        Catálogo normalizado (495 productos, 44 categorías, 43 marcas)
data/users.json          Clientes mayoristas (generado al arrancar; no se versiona)
public/img/p/            Imágenes de producto
public/img/cat/          Imágenes de categoría
scripts/                 Importación del catálogo y pruebas de humo
src/app/                 Rutas (App Router)
src/components/          Componentes de UI
src/lib/                 Catálogo, sesión, usuarios y acciones de servidor
src/middleware.ts        Protección de /distribucion y /mi-cuenta
```

### Separación cliente / servidor

`src/lib/catalog.ts` lee del sistema de archivos y **solo corre en el servidor**.
Los componentes de cliente importan tipos y helpers desde `src/lib/types.ts`, que no
tiene dependencias de Node. Mantener esa separación evita que `node:fs` acabe en el
bundle del navegador.

---

## Personalizar la marca

Casi todo lo editable vive en [`site.config.ts`](site.config.ts):

- Nombre, razón social, RUC, dirección, correo, teléfono y horario
- Los cinco asesores del widget flotante de WhatsApp
- Categorías destacadas del menú y secciones con carrusel de la portada

Los valores marcados con `// PLACEHOLDER` son de relleno y **hay que reemplazarlos por
los datos reales antes de publicar**.

La paleta se define como variables CSS en [`src/app/globals.css`](src/app/globals.css)
(`--color-brand`, `--color-accent`, `--color-cta`). El logotipo es SVG tipográfico en
[`src/components/Logo.tsx`](src/components/Logo.tsx).

---

## Acceso B2B

| Elemento           | Detalle                                                          |
| ------------------ | ---------------------------------------------------------------- |
| Identificador      | RUC de 11 dígitos                                                 |
| Sesión             | JWT HS256 en cookie `aqpx_session`, httpOnly, 8 horas             |
| Contraseñas        | `scrypt` con sal aleatoria por usuario                            |
| Registro           | Queda `approved: false` hasta validación manual                   |
| Rutas protegidas   | `/distribucion`, `/mi-cuenta` (ver `src/middleware.ts`)           |

**Cuenta de prueba:** RUC `20123456789`, contraseña `demo1234`.
Elimínala de `data/users.json` antes de publicar.

Verificación del gate de precios:

```bash
npm run dev
node scripts/smoke-auth.mjs
```

---

## Importar el catálogo

```bash
node scripts/normalize.mjs     # data/raw/*.json  ->  data/catalog.json
node scripts/fetch-images.mjs  # descarga las imágenes a public/img/
```

`scripts/normalize.mjs` decodifica entidades HTML, normaliza precios a soles, deriva
la lista de marcas y genera el manifiesto de imágenes. `scripts/fetch-images.mjs` es
reanudable: omite lo ya descargado.

Los archivos en `data/raw/` son la respuesta cruda de la API de origen y no se
versionan.

---

## Pendientes antes de publicar

1. **Datos de marca reales** — reemplazar los `// PLACEHOLDER` de `site.config.ts`
   (RUC, dirección, correo, teléfono y los cinco números de WhatsApp).
2. **Precios propios** — los del catálogo provienen del proveedor. Aplicar el margen
   comercial antes de mostrarlos públicamente.
3. **Base de datos real** — `data/users.json` no soporta escrituras concurrentes.
   Migrar a Postgres, Supabase o similar.
4. **Envío de correo** — los formularios de contacto y del libro de reclamaciones solo
   escriben en `data/submissions.jsonl`. Conectar un proveedor real en la función
   `deliver()` de `src/lib/forms.ts` o los mensajes no llegarán a nadie.
5. **Revisión legal** — los textos de privacidad y términos son plantillas base y deben
   ser revisados por un asesor legal.
6. **`SESSION_SECRET`** — generar una clave nueva para el entorno de producción.

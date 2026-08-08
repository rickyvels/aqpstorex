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

Copia `.env.example` a `.env.local`. En Vercel van en **Settings → Environment
Variables**.

| Variable            | Local | Producción  | Descripción                                                  |
| ------------------- | ----- | ----------- | ------------------------------------------------------------ |
| `SESSION_SECRET`    | —     | Obligatoria | Clave HS256 para firmar la cookie de sesión.                   |
| `AQPX_USERS`        | —     | Obligatoria | Clientes mayoristas como array JSON. Ver abajo.                |
| `FORMS_WEBHOOK_URL` | —     | Recomendada | Destino de contacto y libro de reclamaciones.                  |

En desarrollo no hace falta ninguna: se usa una clave fija insegura y
`data/users.json`.

## Despliegue en serverless (Vercel)

Una función serverless tiene el **sistema de archivos en solo lectura**, así que
`data/users.json` no existe ni se puede crear. Por eso en producción los
clientes se leen de `AQPX_USERS` y los formularios se entregan por webhook.

Para dar de alta un cliente:

```bash
npm run users:new
```

Pide los datos por consola y escribe **`vercel-env.txt`** con los dos valores
listos para pegar en Vercel: `SESSION_SECRET` (generado al vuelo) y
`AQPX_USERS`. La contraseña se convierte en hash y nunca se guarda en claro.

Para añadir un cliente a una lista existente, pega el valor actual de
`AQPX_USERS` cuando el script lo pida y lo devuelve ampliado.

`vercel-env.txt` está en `.gitignore` porque contiene un secreto de producción;
bórralo cuando termines de copiarlo.

Las variables nuevas **solo se aplican tras un redespliegue**: guardarlas en el
panel no basta.

Comprobar que el despliegue funcionará antes de subirlo:

```bash
npm run build
npm run smoke:prod
```

Levanta el sitio con `VERCEL=1` y sin `data/users.json` —las condiciones exactas
de producción— y verifica que las páginas renderizan, que el área privada sigue
protegida, que el acceso funciona con `AQPX_USERS` y que no aparece ningún
`EROFS` en los logs.

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
Elimínala antes de publicar con `npm run users -- delete 20123456789`.

### Dar de alta a un cliente

La base de usuarios de aqpstorex es propia e independiente de cualquier otro
portal: un RUC solo entra si está registrado aquí.

1. El cliente se registra en `/registro` y elige su propia contraseña.
2. Queda en estado pendiente hasta que lo apruebes:

```bash
npm run users -- list
npm run users -- approve 20603580045
```

Otros comandos: `revoke <ruc>` suspende el acceso y `delete <ruc>` elimina la cuenta.
El script nunca lee ni modifica contraseñas.

### Verificación

Con el servidor levantado:

```bash
npm run smoke
```

Comprueba las rutas protegidas sin y con sesión, que los precios no aparezcan en el
HTML anónimo, la descarga del CSV y la verificación de contraseñas.

---

## Importar el catálogo

```bash
node scripts/fetch-catalog.mjs # descarga las fuentes a data/raw/
node scripts/normalize.mjs     # data/raw/*.json  ->  data/catalog.json
node scripts/fetch-images.mjs  # descarga las imágenes a public/img/
```

`fetch-catalog.mjs` cruza dos APIs a propósito: la Store API tiene los precios y
las imágenes, pero sus contadores de categoría están obsoletos y omite la
categoría de algunos productos; la taxonomía de WP REST es la fuente correcta
para clasificar. Ver el detalle en [AUDITORIA.md](AUDITORIA.md).

`scripts/normalize.mjs` decodifica entidades HTML, normaliza precios a soles, deriva
la lista de marcas y genera el manifiesto de imágenes. `scripts/fetch-images.mjs` es
reanudable: omite lo ya descargado.

Los archivos en `data/raw/` son la respuesta cruda de la API de origen y no se
versionan.

---

## Pendientes antes de publicar

Ver [AUDITORIA.md](AUDITORIA.md) para el detalle priorizado.

1. **Datos de marca reales** — reemplazar los `// PLACEHOLDER` de `site.config.ts`
   (RUC, dirección, correo, teléfono, los cinco números de WhatsApp, la escala de
   descuento por volumen y los tiempos de entrega).
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

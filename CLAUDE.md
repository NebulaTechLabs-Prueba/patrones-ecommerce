# PATRONES — Ecommerce · Contexto del proyecto

> Este archivo se carga automáticamente en cada sesión de Claude Code rooteada en
> esta carpeta. Es la migración de las reglas del **Prompt Maestro v9** a un lugar
> versionado. El prompt completo (fuente de verdad, con la justificación de cada
> regla) vive en `.claude-context/prompt-maestro.local.md` (fuera de git).

## Qué es

Ecommerce de **PATRONES** — Puerto Ordaz, Venezuela (c.c. Costa Granada).
Casa de **uniformes profesionales multi-rubro**: salud, gastronomía, corporativo
y los que vengan. Línea propia + reventa de marcas de terceros. Nació en uniformes
médicos, **ya no es solo eso**: el sitio también debe **ampliar la percepción** de
qué es PATRONES.

Dos objetivos del producto: **vender** y **ampliar percepción**. El segundo se logra
con fotografía, copy y navegación — **nunca con color** (el teal lee "clínico").

## Fases

| | Fase 1 — DEMO VISUAL (actual) | Fase 2 — BACKEND REAL |
|---|---|---|
| Datos | Mock (`lib/data/mock`) | Supabase (`lib/data/supabase`) |
| Hosting | GitHub Pages (export estático) | Runtime propio (Hetzner + Caddy + PM2) |
| Objetivo | Que el cliente vea y valide | Que venda |

**Regla que decide si la Fase 2 es enchufar o reescribir:** la demo **no tiene datos
hardcodeados en los componentes, nunca**. Frontera de datos en `lib/data/`: los
componentes consumen las interfaces de `repositories.ts`, jamás los datos crudos.
Los tipos del dominio (`lib/data/types.ts`) ya tienen la forma exacta de la fila de
Postgres. Cambiar de fase = cambiar una implementación.

## Reglas duras (lo que NO se hace)

- **No** hardcodear datos en componentes. **No** asumir ni hardcodear el rubro "médico".
- **No** agregar impuestos (no hay IVA/IGTF). El precio cargado es el **precio final**.
  No se emiten facturas fiscales: se emite una **nota de entrega** (documento comercial).
  Si aparece la tentación de un campo `tax`/`iva`/`igtf`, **se pregunta primero**.
- **No** mostrar nada sin existencia (§visibilidad). `disponible = stock − reservado`,
  nunca stock crudo. Agotado desaparece de catálogo/filtros/featured/colecciones/
  sugerencias/sitemap; URL directa → 404.
- **No** mostrarle la escasez al cliente ("quedan 2"). El bajo stock es alerta **de admin**.
- **No** generar SKUs: el SKU es **por variante**, lo crea y revisa PATRONES; se recibe,
  valida (unicidad/formato) y respeta tal cual. Es la clave de conciliación con el
  sistema administrativo, que es **el dueño del inventario** (el ecommerce no lo es).
- **No** dejar que la caída de la API de inventario detenga la venta: proyección + `stale` + alerta.
- **No** descomponer un conjunto cerrado en stock de componentes. **No** pedir talla por pieza.
- **No** auto-agregar nada al carrito (un conjunto se sugiere, jamás se auto-agrega).
- **No** aplicar promociones sin orden determinístico (apilables, con `priority`,
  server-side, con piso de precio).
- **No** usar un hex fuera de `styles/tokens.css`. **No** `--ptr-mint`/`--ptr-primary-soft`
  para texto pequeño. **No** el verde de marca como estado de "éxito" (para eso, semánticos).
- **No** mezclar `order.status` (cumplimiento) con `payment_status` (cobro): dos máquinas separadas.
- **No** bloquear la navegación con login: la sesión se pide al **iniciar el checkout**.
- **No** copiar la arquitectura de Figs (es mono-rubro; encerraría la marca). Sí su foto/ritmo.
- **No** presentar una persona IA como cliente/testimonio real.
- **No** responder con código si la pregunta era de arquitectura. Plan corto primero.

## Modelo de dominio (claves)

- **Producto** = la prenda como la percibe el cliente. **Talla, color y atributos como
  la manga son VARIANTES**, no productos. La variante es la unidad real de existencia y
  lleva el SKU y el stock.
- **Rubro** (`Vertical`, nombre público **"Rubros"**): dimensión de primer nivel, N:N con
  producto, CRUD del admin. Rubros iniciales de la demo: **salud, gastronomía, corporativo**.
- **Conjunto CERRADO** (`type: 'set'`): SKU e inventario propios, una talla, `set_pieces`
  descriptivo. **Conjunto SUGERIDO** (`bundles`): relación entre productos sueltos.
- Dinero: **USD en centavos (integer)**, única fuente de verdad. Bs es presentación (tasa
  BCV vía dolarapi, sin margen; la orden snapshotea la tasa).
- Cuenta obligatoria para comprar (no guest checkout). Cédula/RIF con validación venezolana.

## Tono y marca

- **Tono de voz: siempre elegante y profesional.** El diseño es amigable; el copy no es
  coloquial. Sin diminutivos, sin "¡ÚLTIMAS UNIDADES!". Se trata al visitante como profesional.
- Paleta y tipografía: brandbook 2023, no se negocia. Única familia web: **Nunito Sans**.
  Header con isologo. Tokens en `styles/tokens.css`.

## Stack y arquitectura

Next.js 15 (App Router) · TypeScript `strict` · CSS con tokens `ptr-*` · Vitest.
Fase 2: Supabase + Stripe + Resend.

- `lib/data/types.ts` = la verdad del modelo. `repositories.ts` = el contrato.
- `lib/domains/*` = **puro, sin I/O**, único lugar con tests unitarios (ahí vive lo que
  cuesta plata: pricing, currency, availability, cart, promociones).
- `lib/domains/availability` = **único lugar** que decide visibilidad y bajo stock.
- Archivo > ~500 líneas o > 2 responsabilidades → se divide. Todo `'use client'` se justifica.

## Deploy y ramas

- Ramas: **`dev`** (trabajo) y **`main`** (deploy). `dev` → `main` dispara Pages.
- `.github/workflows/deploy.yml`: solo en `main`; corre tests (gate) → build export → Pages.
- `basePath` se inyecta por env (`NEXT_PUBLIC_BASE_PATH`) desde el workflow.
- Commits en español, imperativo, con el porqué. Trunk-based, sin force-push a `main`.

## Estado actual

Fase 1 arrancada. Hecho: scaffold + tokens + `types.ts` + `repositories.ts` +
`lib/domains/availability` (con tests) + workflow de deploy + página de sostén provisional.
**Siguiente:** implementación mock (`seed.ts` con los 3 rubros, datos que se ven reales:
stock que se agota, bajo stock, reservas, conjuntos, promos apiladas) + Home real navegable.

## Cómo trabajar acá

1. Ante tarea no trivial: **plan corto primero** (archivos, qué modela, qué rompe), esperar OK.
2. Ante ambigüedad: **preguntar** (lista de opciones cerradas con default), no asumir.
3. Si hay que asumir, declararlo bajo `Asumí que:`.
4. Dos intentos fallidos en un bug ⇒ parar y avisar.
5. Guardar entregables como archivos. Reportar con honestidad (si un test falla, decirlo).

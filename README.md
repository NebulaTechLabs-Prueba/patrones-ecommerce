# PATRONES — Ecommerce

Uniformes profesionales multi-rubro (salud, gastronomía, corporativo y más).
Línea propia PATRONES + marcas seleccionadas. Puerto Ordaz, Venezuela.

## Fases

| | Fase 1 — DEMO VISUAL | Fase 2 — BACKEND REAL |
|---|---|---|
| Datos | Mock (`lib/data/mock`) | Supabase (`lib/data/supabase`) |
| Hosting | GitHub Pages (export estático) | Runtime propio (Hetzner + Caddy + PM2) |
| Objetivo | Que el cliente vea y valide | Que venda |

La **frontera de datos** en `src/lib/data/` (interfaces en `repositories.ts`,
tipos en `types.ts`) permite que el salto de fase sea cambiar una implementación,
no reescribir el storefront. Los componentes consumen las interfaces, nunca los
datos crudos.

## Stack

Next.js 15 (App Router) · TypeScript `strict` · CSS con tokens `ptr-*` · Vitest.

## Scripts

```bash
npm install      # dependencias
npm run dev      # desarrollo local (raíz, sin basePath)
npm test         # tests de lib/domains (la lógica que cuesta plata)
npm run build    # export estático -> ./out
```

## Deploy

`dev` es la rama de trabajo. Un push/merge a `main` dispara el workflow
`.github/workflows/deploy.yml`, que corre los tests, hace el build estático y
publica en GitHub Pages. El `basePath` se inyecta por env desde el workflow: si
el repo no se llama `patrones-ecommerce`, ajustar `NEXT_PUBLIC_BASE_PATH` ahí.

## Reglas de arquitectura (resumen)

- `lib/data/types.ts` es la verdad del modelo. El mock tiene la forma exacta de
  la fila de Postgres.
- `lib/domains/*` es puro, sin I/O, y es el único lugar con tests unitarios.
- `lib/domains/availability` es el único lugar que decide visibilidad y bajo stock.
- Ningún hex fuera de `styles/tokens.css`. Nada de catálogo hardcodeado en componentes.
- El precio cargado es el precio final: sin impuestos, sin facturas fiscales.

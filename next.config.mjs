/**
 * Configuracion para la demo (Fase 1).
 *
 * GitHub Pages solo sirve archivos estaticos => export estatico.
 * El basePath se inyecta por env desde el workflow de deploy (un solo lugar).
 * En local queda vacio para que `next dev` sirva en la raiz.
 *
 * Fase 2 (backend real: Supabase, Stripe, API de inventario, server actions)
 * NO corre en Pages: migra al target con runtime (Hetzner + Caddy + PM2).
 * La frontera de datos en lib/data/ es lo que hace ese salto no-reescritura.
 */

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: {
    // Export estatico no tiene optimizador de imagenes en runtime.
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;

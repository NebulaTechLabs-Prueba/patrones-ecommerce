/**
 * Configuracion de la app (Next.js sobre Vercel).
 *
 * Vercel corre Next con runtime real (SSR/ISR disponibles): ya no se usa export
 * estatico ni basePath. Se mantiene trailingSlash para conservar las URLs con
 * barra final que ya usan los enlaces internos.
 *
 * NEXT_PUBLIC_BASE_PATH queda sin efecto (base vacia); lib/asset.ts y not-found.tsx
 * lo leen con `?? ''`, asi que siguen funcionando y quedan listos para Fase 2
 * (Supabase, Stripe, API de inventario, server actions), que corre nativa aca.
 * La frontera de datos en lib/data/ hace ese salto sin reescritura.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    // Placeholders locales por ahora; con fotos reales se habilita el optimizador.
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;

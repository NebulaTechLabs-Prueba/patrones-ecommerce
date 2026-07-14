import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Los modulos de lib/domains son puros (sin I/O), asi que corren en node.
// Aca vive la logica que cuesta plata: precio, tasa, promociones, disponibilidad.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});

import type { Config } from 'tailwindcss';

/**
 * Tailwind SOLO como capa de utilidades para integrar componentes de 21st.dev.
 * `preflight: false` → NO resetea estilos; convive con los CSS Modules + tokens
 * existentes sin romperlos. Los colores se mapean a los tokens de marca.
 */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: 'var(--ptr-primary)',
        ink: 'var(--ptr-ink)',
        cream: 'var(--ptr-cream)',
        mint: 'var(--ptr-mint)',
      },
      fontFamily: {
        sans: 'var(--ptr-font-sans)',
      },
    },
  },
} satisfies Config;

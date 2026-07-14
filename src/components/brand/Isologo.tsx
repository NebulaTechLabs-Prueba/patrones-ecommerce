/**
 * Isologo de PATRONES para el header (§5.3).
 *
 * Placeholder tipografico vectorial hasta que llegue el activo oficial (§5.3: los
 * activos reales son PNG; produccion exige vectorizar). No distorsiona, no rota, no
 * recolorea el logo real: es una representacion sobria de arranque, no el logo.
 * Se reemplaza por el SVG oficial sin tocar el layout.
 */

interface IsologoProps {
  /** Alto en px; el ancho se ajusta. */
  height?: number;
}

export function Isologo({ height = 28 }: IsologoProps) {
  return (
    <span
      aria-label="PATRONES"
      role="img"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        height,
        color: 'var(--ptr-primary)',
      }}
    >
      <svg
        width={height}
        height={height}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="1" y="1" width="30" height="30" rx="7" stroke="currentColor" strokeWidth="2" />
        <path
          d="M11 9h6.2c2.9 0 4.8 1.7 4.8 4.4 0 2.7-1.9 4.4-4.8 4.4H14V23h-3V9Zm3 6.4h3c1.2 0 2-.7 2-2s-.8-2-2-2h-3v4Z"
          fill="currentColor"
        />
      </svg>
      <span
        aria-hidden="true"
        style={{
          fontSize: '1.15rem',
          fontWeight: 'var(--ptr-weight-bold)',
          letterSpacing: 'var(--ptr-tracking-wider)',
          textTransform: 'uppercase',
        }}
      >
        Patrones
      </span>
    </span>
  );
}

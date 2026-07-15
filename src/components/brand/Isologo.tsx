/**
 * Isologo de PATRONES para el header (§5.3).
 *
 * Isotipo = "triángulo con un semicírculo" que forma la P (así lo describe el
 * brandbook). Reconstruccion vectorial fiel para la demo; produccion exige el
 * SVG oficial (§5.3). El isotipo hace de P, y el wordmark completa "ATRONES"
 * -> se lee PATRONES (variante ISOLOGO del brandbook). No se distorsiona, no se
 * rota, no se recolorea: hereda currentColor (color de marca en el header).
 */

interface IsologoProps {
  /** Alto del isotipo en px; el resto escala con el. */
  height?: number;
  /** Mostrar el wordmark "ATRONES" (isologo). Si false, solo el isotipo (icono). */
  withWordmark?: boolean;
}

export function Isologo({ height = 28, withWordmark = true }: IsologoProps) {
  const markWidth = Math.round(height * (100 / 128));
  return (
    <span
      aria-label="PATRONES"
      role="img"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--ptr-primary)',
      }}
    >
      <svg
        width={markWidth}
        height={height}
        viewBox="0 0 100 128"
        aria-hidden="true"
        focusable="false"
      >
        {/* Contorno: top -> semicirculo (bowl) -> diagonal -> stem vertical. */}
        <path
          d="M30 12 L62 12 A32 32 0 0 1 62 76 L30 116 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth={4.5}
          strokeLinejoin="miter"
        />
      </svg>
      {withWordmark ? (
        <span
          aria-hidden="true"
          style={{
            fontSize: `${Math.round(height * 0.5)}px`,
            fontWeight: 'var(--ptr-weight-regular)',
            letterSpacing: 'var(--ptr-tracking-wider)',
            textTransform: 'uppercase',
          }}
        >
          atrones
        </span>
      ) : null}
    </span>
  );
}

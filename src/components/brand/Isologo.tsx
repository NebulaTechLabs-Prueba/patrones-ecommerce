/**
 * Isologo de PATRONES (§5.3). Isotipo = monograma de la "doble P" del brandbook,
 * provisto como SVG oficial (public/brand/logo.svg) e incrustado acá con el viewBox
 * recortado al trazo y `currentColor` (hereda el color de marca). El isotipo hace de
 * P y el wordmark completa "ATRONES" -> se lee PATRONES. No se distorsiona, no se
 * rota ni se recolorea fuera de la marca.
 */

// viewBox recortado al trazo real del logo oficial (ratio ancho/alto ~0.741).
const MARK_VIEWBOX = '1281.3 994.3 1614.5 2177.2';
const MARK_RATIO = 1614.5 / 2177.2;
const MARK_PATH =
  'M13270 21568 l1 -9703 132 137 c73 76 456 468 852 873 l720 736 5 -1600 5 -1599 3949 4037 3948 4038 127 7 c2263 124 4231 1561 5030 3673 382 1012 462 2143 225 3205 -319 1432 -1184 2682 -2424 3501 -91 60 -209 134 -263 164 -91 52 -106 65 -199 176 -265 315 -519 563 -828 810 -853 682 -1889 1104 -2985 1217 -272 28 -581 30 -4372 30 l-3923 0 0 -9702z m8062 9192 c1013 -68 1988 -429 2782 -1031 173 -131 187 -142 161 -135 -426 116 -782 177 -1205 206 -93 6 -1570 10 -4117 10 l-3973 0 0 -7742 -1 -7743 -602 -617 c-331 -339 -605 -616 -609 -617 -10 -1 -11 16814 -1 17317 l6 362 3703 0 c2430 0 3755 -4 3856 -10z m1968 -1478 c618 -81 1090 -216 1617 -460 235 -109 220 -96 386 -338 176 -256 377 -630 501 -929 500 -1213 511 -2598 29 -3825 -80 -206 -254 -560 -365 -745 -818 -1363 -2178 -2269 -3743 -2494 -185 -27 -339 -40 -573 -49 l-193 -8 -180 -180 c-98 -98 -1330 -1356 -2737 -2795 l-2557 -2615 -3 7220 c-1 3972 0 7227 3 7234 4 10 750 12 3827 9 l3823 -3 165 -22z m3147 -1556 c758 -781 1248 -1777 1402 -2846 39 -270 46 -379 46 -735 0 -384 -12 -533 -66 -855 -352 -2103 -2003 -3791 -4116 -4209 -267 -53 -550 -85 -863 -97 l-175 -6 -79 -77 c-43 -42 -1662 -1695 -3597 -3674 l-3519 -3597 0 1248 0 1248 2845 2910 2845 2909 137 7 c1567 79 3058 828 4073 2048 687 826 1128 1838 1259 2890 34 270 43 420 43 715 0 295 -9 445 -43 715 -66 529 -222 1088 -438 1569 -28 63 -51 117 -51 119 0 10 171 -152 297 -282z';

interface IsologoProps {
  /** Alto del isotipo en px; el resto escala con él. */
  height?: number;
  /** Mostrar el wordmark "ATRONES" (isologo). Si false, solo el isotipo (icono). */
  withWordmark?: boolean;
}

export function Isologo({ height = 28, withWordmark = true }: IsologoProps) {
  const markWidth = Math.round(height * MARK_RATIO);
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
      <svg width={markWidth} height={height} viewBox={MARK_VIEWBOX} aria-hidden="true" focusable="false">
        <g transform="translate(0,4167) scale(0.1,-0.1)" fill="currentColor">
          <path d={MARK_PATH} />
        </g>
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

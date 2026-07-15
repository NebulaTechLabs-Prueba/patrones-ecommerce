/**
 * Seed mock - Tablas de medidas (§15).
 *
 * PATRONES revende algunas prendas FIGS; estas son las tablas publicadas por FIGS
 * para sus tops (mujer y hombre), en pulgadas. Se usan para el producto FIGS de la
 * demo. Las tablas de la Linea PATRONES quedan pendientes hasta que entreguen las
 * medidas reales (§15). Se referencian por `size_chart_id` del producto.
 */

import type { SizeChart } from '../../types';

const MEASURE = {
  chest: 'Rodeá la parte más ancha del busto.',
  waist: 'Rodeá la parte más angosta de la cintura.',
  hip: 'Rodeá la parte más ancha de la cadera.',
};

export const sizeCharts: SizeChart[] = [
  {
    id: 'sc-figs-womens-tops',
    name: 'FIGS — Tops de mujer',
    unit: 'in',
    measure: MEASURE,
    source: 'FIGS (medidas del fabricante)',
    rows: [
      { size: 'XXS', chest: '29.5–31.5', waist: '23–25', hip: '32.5–34.5' },
      { size: 'XS', chest: '31.5–33.5', waist: '25–27', hip: '34.5–36.5' },
      { size: 'S', chest: '33.5–35.5', waist: '27–29', hip: '36.5–38.5' },
      { size: 'M', chest: '35.5–37.5', waist: '29–31', hip: '38.5–40.5' },
      { size: 'L', chest: '37.5–40', waist: '31–33.5', hip: '40.5–43' },
      { size: 'XL', chest: '40–42.5', waist: '33.5–36', hip: '43–45.5' },
      { size: '2XL', chest: '42.5–45.5', waist: '36–39', hip: '45.5–48.5' },
      { size: '3XL', chest: '45.5–49', waist: '39–44', hip: '48.5–52' },
    ],
  },
  {
    id: 'sc-figs-mens-tops',
    name: 'FIGS — Tops de hombre',
    unit: 'in',
    measure: MEASURE,
    source: 'FIGS (medidas del fabricante)',
    rows: [
      { size: 'XS', chest: '34–36', waist: '28.5–30.5', hip: '33.5–35.5' },
      { size: 'S', chest: '36–38', waist: '30.5–32.5', hip: '35.5–37.5' },
      { size: 'M', chest: '38–40', waist: '32.5–34.5', hip: '37.5–39.5' },
      { size: 'L', chest: '40–42.5', waist: '34.5–37', hip: '39.5–42' },
      { size: 'XL', chest: '42.5–45', waist: '37–39.5', hip: '42–44.5' },
      { size: '2XL', chest: '45–48.5', waist: '39.5–43', hip: '44.5–48' },
      { size: '3XL', chest: '48.5–52', waist: '43–47', hip: '48–52.5' },
    ],
  },
];

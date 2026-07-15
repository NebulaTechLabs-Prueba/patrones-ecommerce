/**
 * Seed mock - Tablas de medidas (§15). POR PRENDA.
 *
 * PATRONES revende algunas prendas FIGS; estas son las tablas publicadas por FIGS,
 * en pulgadas. Los tops usan busto/pecho, cintura y cadera; los pantalones usan
 * cintura y cadera. Las tablas de la Linea PATRONES quedan pendientes hasta que
 * entreguen las medidas reales. Un producto referencia la suya por size_chart_id.
 */

import type { SizeChart } from '../../types';

const MEASURE_TOP = [
  { label: 'Busto/Pecho', text: 'Rodeá la parte más ancha del busto o pecho.' },
  { label: 'Cintura', text: 'Rodeá la parte más angosta de la cintura.' },
  { label: 'Cadera', text: 'Rodeá la parte más ancha de la cadera.' },
];

const MEASURE_PANTS = [
  { label: 'Cintura', text: 'Rodeá la parte más angosta de la cintura.' },
  { label: 'Cadera', text: 'Rodeá la parte más ancha de la cadera.' },
];

export const sizeCharts: SizeChart[] = [
  {
    id: 'sc-figs-womens-tops',
    name: 'FIGS — Tops de mujer',
    garment: 'Tops',
    unit: 'in',
    source: 'FIGS (medidas del fabricante)',
    headers: ['Talla', 'Busto', 'Cintura', 'Cadera'],
    rows: [
      ['XXS', '29.5–31.5', '23–25', '32.5–34.5'],
      ['XS', '31.5–33.5', '25–27', '34.5–36.5'],
      ['S', '33.5–35.5', '27–29', '36.5–38.5'],
      ['M', '35.5–37.5', '29–31', '38.5–40.5'],
      ['L', '37.5–40', '31–33.5', '40.5–43'],
      ['XL', '40–42.5', '33.5–36', '43–45.5'],
      ['2XL', '42.5–45.5', '36–39', '45.5–48.5'],
      ['3XL', '45.5–49', '39–44', '48.5–52'],
    ],
    measure: MEASURE_TOP,
  },
  {
    id: 'sc-figs-mens-tops',
    name: 'FIGS — Tops de hombre',
    garment: 'Tops',
    unit: 'in',
    source: 'FIGS (medidas del fabricante)',
    headers: ['Talla', 'Pecho', 'Cintura', 'Cadera'],
    rows: [
      ['XS', '34–36', '28.5–30.5', '33.5–35.5'],
      ['S', '36–38', '30.5–32.5', '35.5–37.5'],
      ['M', '38–40', '32.5–34.5', '37.5–39.5'],
      ['L', '40–42.5', '34.5–37', '39.5–42'],
      ['XL', '42.5–45', '37–39.5', '42–44.5'],
      ['2XL', '45–48.5', '39.5–43', '44.5–48'],
      ['3XL', '48.5–52', '43–47', '48–52.5'],
    ],
    measure: MEASURE_TOP,
  },
  {
    id: 'sc-figs-womens-pants',
    name: 'FIGS — Pantalones de mujer',
    garment: 'Pantalones',
    unit: 'in',
    source: 'FIGS (medidas del fabricante)',
    headers: ['Talla', 'Cintura', 'Cadera'],
    rows: [
      ['XXS', '23–25', '32.5–34.5'],
      ['XS', '25–27', '34.5–36.5'],
      ['S', '27–29', '36.5–38.5'],
      ['M', '29–31', '38.5–40.5'],
      ['L', '31–33.5', '40.5–43'],
      ['XL', '33.5–36', '43–45.5'],
      ['2XL', '36–39', '45.5–48.5'],
      ['3XL', '39–44', '48.5–52'],
    ],
    measure: MEASURE_PANTS,
  },
];

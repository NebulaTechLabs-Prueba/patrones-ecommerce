/**
 * Seed mock - Taxonomia (§4).
 *
 * Rubros iniciales de la demo: salud, gastronomia, corporativo. Nombre publico
 * "Rubros". Marcas: Linea PATRONES (is_own_line) + terceros. Origen independiente
 * de la marca. Categorias y modelos derivan la nav y las grillas (nada hardcodeado
 * en componentes).
 *
 * Toda imagen es placeholder en Fase 1 (is_placeholder: true, §6). El componente
 * PlaceholderImage dibuja el tile; la url queda lista para cambiarla por foto real
 * o de stock sin tocar la UI.
 */

import type { Brand, Category, Model, ProductImage, Vertical } from '../../types';

/** Fabrica de imagen placeholder: siempre existe, siempre marcada. */
function placeholder(url: string, alt: string, sort_order = 0): ProductImage {
  return { url, alt, is_placeholder: true, sort_order };
}

export const verticals: Vertical[] = [
  {
    id: 'v-salud',
    slug: 'salud',
    name: 'Salud',
    tagline: 'Uniformes que acompañan cada guardia.',
    description:
      'Scrubs, casacas y calzado profesional para el personal de salud. Telas que resisten la jornada y sostienen la compostura.',
    hero_image: placeholder('/img/rubros/salud.jpg', 'Profesional de salud con uniforme PATRONES'),
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'v-gastronomia',
    slug: 'gastronomia',
    name: 'Gastronomía',
    tagline: 'La cocina también es una cuestión de figura.',
    description:
      'Filipinas, delantales y pantalones para chefs y salón. Prendas pensadas para el calor de la cocina y la exigencia del servicio.',
    hero_image: placeholder('/img/rubros/gastronomia.jpg', 'Chef con filipina PATRONES'),
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'v-corporativo',
    slug: 'corporativo',
    name: 'Corporativo',
    tagline: 'La primera impresión, uniformada.',
    description:
      'Camisas, chaquetas y prendas de imagen para equipos de atención, recepción y oficina. Presencia consistente para toda la organización.',
    hero_image: placeholder('/img/rubros/corporativo.jpg', 'Equipo corporativo con uniforme PATRONES'),
    sort_order: 3,
    is_active: true,
  },
];

export const brands: Brand[] = [
  {
    id: 'b-linea-patrones',
    slug: 'linea-patrones',
    name: 'Línea PATRONES',
    is_own_line: true,
    logo_image: null,
  },
  {
    id: 'b-mediwear',
    slug: 'mediwear',
    name: 'MediWear',
    is_own_line: false,
    logo_image: null,
  },
  {
    id: 'b-chefline',
    slug: 'chefline',
    name: 'ChefLine',
    is_own_line: false,
    logo_image: null,
  },
  {
    id: 'b-figs',
    slug: 'figs',
    name: 'FIGS',
    is_own_line: false,
    logo_image: null,
  },
];

export const categories: Category[] = [
  { id: 'cat-scrubs', slug: 'scrubs', name: 'Scrubs', parent_id: null, sort_order: 1 },
  { id: 'cat-filipinas', slug: 'filipinas', name: 'Filipinas', parent_id: null, sort_order: 2 },
  { id: 'cat-camisas', slug: 'camisas', name: 'Camisas', parent_id: null, sort_order: 3 },
  { id: 'cat-pantalones', slug: 'pantalones', name: 'Pantalones', parent_id: null, sort_order: 4 },
  { id: 'cat-chaquetas', slug: 'chaquetas', name: 'Chaquetas', parent_id: null, sort_order: 5 },
  { id: 'cat-calzado', slug: 'calzado', name: 'Calzado', parent_id: null, sort_order: 6 },
  { id: 'cat-accesorios', slug: 'accesorios', name: 'Accesorios', parent_id: null, sort_order: 7 },
];

/** Modelo = el diseño; agrupa productos dentro de un rubro. */
export const models: Model[] = [
  { id: 'm-aura', slug: 'aura', name: 'Aura', vertical_id: 'v-salud' },
  { id: 'm-quirurgico', slug: 'quirurgico', name: 'Quirúrgico', vertical_id: 'v-salud' },
  { id: 'm-bordeaux', slug: 'bordeaux', name: 'Bordeaux', vertical_id: 'v-gastronomia' },
  { id: 'm-bistro', slug: 'bistro', name: 'Bistró', vertical_id: 'v-gastronomia' },
  { id: 'm-oxford', slug: 'oxford', name: 'Oxford', vertical_id: 'v-corporativo' },
  { id: 'm-ejecutiva', slug: 'ejecutiva', name: 'Ejecutiva', vertical_id: 'v-corporativo' },
  { id: 'm-terra', slug: 'terra', name: 'Terra', vertical_id: 'v-salud' },
  { id: 'm-figs-casma', slug: 'casma', name: 'Casma', vertical_id: 'v-salud' },
];

export { placeholder };

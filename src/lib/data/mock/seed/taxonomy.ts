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

/** Foto de stock real (Unsplash) para los rubros, hasta tener fotografía propia. */
function stock(id: string, alt: string, sort_order = 0): ProductImage {
  return { url: `https://images.unsplash.com/photo-${id}?q=80&w=1200&h=800&fit=crop`, alt, is_placeholder: false, sort_order };
}

export const verticals: Vertical[] = [
  {
    id: 'v-salud',
    slug: 'salud',
    name: 'Salud',
    tagline: 'Uniformes que acompañan cada guardia.',
    description:
      'Scrubs, casacas y calzado profesional para el personal de salud. Telas que resisten la jornada y sostienen la compostura.',
    hero_image: stock('1576091160399-112ba8d25d1d', 'Profesional de salud con uniforme PATRONES'),
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
    hero_image: stock('1577219491135-ce391730fb2c', 'Chef con filipina PATRONES'),
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
    hero_image: stock('1559839734-2b71ea197ec2', 'Equipo corporativo con uniforme PATRONES'),
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'v-calzado',
    slug: 'calzado',
    name: 'Calzado',
    tagline: 'De la guardia a la calle, sin cambiar de paso.',
    description:
      'Zuecos profesionales, Crocs y calzado deportivo de alta comodidad. Suelas que aguantan turnos largos y también los kilómetros de después.',
    hero_image: stock('1542291026-7eec264c27ff', 'Calzado deportivo y profesional PATRONES'),
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'v-perfumeria',
    slug: 'perfumeria',
    name: 'Perfumería',
    tagline: 'La firma que se queda cuando termina la jornada.',
    description:
      'Fragancias seleccionadas para acompañar tu presencia. El detalle final de una imagen profesional, cuidada de pies a cabeza.',
    hero_image: stock('1541643600914-78b084683601', 'Fragancias de la perfumería PATRONES'),
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'v-complementos',
    slug: 'complementos',
    name: 'Complementos',
    tagline: 'El detalle que completa el conjunto.',
    description:
      'Carteras, bisutería y cosmética para redondear tu estilo. Piezas que acompañan del trabajo a lo cotidiano sin perder la elegancia.',
    hero_image: stock('1584917865442-de89df76afd3', 'Carteras y complementos PATRONES'),
    sort_order: 6,
    is_active: true,
  },
  {
    id: 'v-deportivo',
    slug: 'deportivo',
    name: 'Deportivo',
    tagline: 'Alto rendimiento dentro y fuera del trabajo.',
    description:
      'Ropa y accesorios deportivos de alto rendimiento. Comodidad y libertad de movimiento para seguir tu propio ritmo.',
    hero_image: stock('1517836357463-d25dfeac3438', 'Ropa y accesorios deportivos PATRONES'),
    sort_order: 7,
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
  {
    id: 'b-nike',
    slug: 'nike',
    name: 'Nike',
    is_own_line: false,
    logo_image: null,
  },
  {
    id: 'b-crocs',
    slug: 'crocs',
    name: 'Crocs',
    is_own_line: false,
    logo_image: null,
  },
  {
    id: 'b-essenza',
    slug: 'essenza',
    name: 'Essenza',
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
  { id: 'cat-batas', slug: 'batas', name: 'Batas médicas', parent_id: null, sort_order: 8 },
  { id: 'cat-pijamas', slug: 'pijamas', name: 'Pijamas', parent_id: null, sort_order: 9 },
  { id: 'cat-perfumeria', slug: 'perfumeria', name: 'Perfumería', parent_id: null, sort_order: 10 },
  { id: 'cat-carteras', slug: 'carteras', name: 'Carteras', parent_id: null, sort_order: 11 },
  { id: 'cat-bisuteria', slug: 'bisuteria', name: 'Bisutería', parent_id: null, sort_order: 12 },
  { id: 'cat-cosmetica', slug: 'cosmetica', name: 'Cosmética', parent_id: null, sort_order: 13 },
  { id: 'cat-deportiva', slug: 'ropa-deportiva', name: 'Ropa deportiva', parent_id: null, sort_order: 14 },
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
  { id: 'm-figs-livingston', slug: 'livingston', name: 'Livingston', vertical_id: 'v-salud' },
  { id: 'm-crocs-classic', slug: 'crocs-classic', name: 'Classic', vertical_id: 'v-calzado' },
  { id: 'm-nike-run', slug: 'nike-run', name: 'Revolution', vertical_id: 'v-calzado' },
  { id: 'm-essenza', slug: 'essenza', name: 'Essenza', vertical_id: 'v-perfumeria' },
  { id: 'm-atelier', slug: 'atelier', name: 'Atelier', vertical_id: 'v-complementos' },
  { id: 'm-active', slug: 'active', name: 'Active', vertical_id: 'v-deportivo' },
];

export { placeholder };

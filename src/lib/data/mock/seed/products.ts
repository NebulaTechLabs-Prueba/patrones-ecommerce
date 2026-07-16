/**
 * Seed mock - Productos (§9).
 *
 * El producto es la prenda como la percibe el cliente; talla, color y atributos
 * como la manga son VARIANTES (viven en variants.ts). El precio vive aca (final,
 * USD centavos). Un producto puede pertenecer a mas de un rubro (vertical_ids, N:N).
 *
 * Imagenes: fotografia de stock (Unsplash) asignada por prenda, por orden del PM,
 * hasta contar con fotografia propia de PATRONES. Se marcan is_placeholder=false
 * para mostrarse como imagen del producto; al llegar la foto real, se sustituye la url.
 */

import type { CustomizationConfig, Product, ProductImage } from '../../types';

/** Personalizacion contemplada desde el dia 1 pero apagada en el MVP (§9.6). */
const customizationOff: CustomizationConfig = {
  enabled: false,
  type: null,
  extra_price_cents: 0,
  extra_days: 0,
};

/** Foto de stock real (Unsplash), retrato ~4/5. Placeholder de contenido, no de UI. */
function stock(id: string, alt: string, sort = 0): ProductImage {
  return {
    url: `https://images.unsplash.com/photo-${id}?q=80&w=900&h=1100&fit=crop`,
    alt,
    is_placeholder: false,
    sort_order: sort,
  };
}

export const products: Product[] = [
  {
    id: 'p-scrub-aura',
    slug: 'scrub-top-aura',
    name: 'Scrub Top Aura',
    description:
      'Casaca de cuello en V en tela antifluidos de tacto suave. Corte moderno con pinzas y dos bolsillos de parche. La base de la línea Aura.',
    type: 'simple',
    model_id: 'm-aura',
    brand_id: 'b-linea-patrones',
    origin: 'nacional',
    vertical_ids: ['v-salud'],
    category_ids: ['cat-scrubs'],
    price: 2800,
    featured: true,
    low_stock_threshold: null,
    customization: customizationOff,
    images: [
      stock('1576091160399-112ba8d25d1d', 'Profesional de salud con casaca Aura, vista frontal', 0),
      stock('1559839734-2b71ea197ec2', 'Casaca Aura, detalle del cuello en V', 1),
    ],
    set_pieces: [],
    created_at: '2026-05-02T10:00:00-04:00',
  },
  {
    id: 'p-jogger-aura',
    slug: 'pantalon-jogger-aura',
    name: 'Pantalón Jogger Aura',
    description:
      'Pantalón de vestir clínico con cintura elástica y puño jogger. Misma tela antifluidos de la casaca Aura, pensado para acompañarla.',
    type: 'simple',
    model_id: 'm-aura',
    brand_id: 'b-linea-patrones',
    origin: 'nacional',
    vertical_ids: ['v-salud'],
    category_ids: ['cat-pantalones'],
    price: 2600,
    featured: false,
    low_stock_threshold: null,
    customization: customizationOff,
    images: [
      stock('1594824476967-48c8b964273f', 'Pantalón Jogger Aura, vista frontal', 0),
    ],
    set_pieces: [],
    created_at: '2026-05-02T10:00:00-04:00',
  },
  {
    id: 'p-conjunto-quirurgico',
    slug: 'conjunto-quirurgico-esteril',
    name: 'Conjunto Quirúrgico Estéril',
    description:
      'Conjunto cerrado de pijama quirúrgica: casaca y pantalón en una sola referencia y una sola talla. Viene completo del proveedor.',
    type: 'set',
    model_id: 'm-quirurgico',
    brand_id: 'b-mediwear',
    origin: 'importado',
    vertical_ids: ['v-salud'],
    category_ids: ['cat-scrubs'],
    price: 4900,
    featured: true,
    low_stock_threshold: 3,
    customization: customizationOff,
    images: [
      stock('1612349317150-e413f6a5b16d', 'Conjunto quirúrgico completo, set casaca y pantalón', 0),
    ],
    // set_pieces es DESCRIPTIVO: ficha, busqueda, nota de entrega. Nunca inventario (§9.3).
    set_pieces: [
      { name: 'Casaca quirúrgica', description: 'Cuello en V, manga corta, un bolsillo de pecho.' },
      { name: 'Pantalón quirúrgico', description: 'Cintura con cordón, dos bolsillos laterales.' },
    ],
    created_at: '2026-04-18T10:00:00-04:00',
  },
  {
    id: 'p-filipina-bordeaux',
    slug: 'filipina-chef-bordeaux',
    name: 'Filipina Chef Bordeaux',
    description:
      'Chaqueta de chef en sarga de algodón con doble botonadura. Disponible en manga corta y manga larga: la misma filipina, dos variantes.',
    type: 'simple',
    model_id: 'm-bordeaux',
    brand_id: 'b-linea-patrones',
    origin: 'nacional',
    vertical_ids: ['v-gastronomia'],
    category_ids: ['cat-filipinas'],
    price: 3400,
    featured: true,
    low_stock_threshold: null,
    customization: customizationOff,
    images: [
      stock('1577219491135-ce391730fb2c', 'Chef con filipina de doble botonadura, vista frontal', 0),
    ],
    set_pieces: [],
    created_at: '2026-05-20T10:00:00-04:00',
  },
  {
    id: 'p-delantal-bistro',
    slug: 'delantal-bistro',
    name: 'Delantal Bistró',
    description:
      'Delantal de peto en lona encerada con tiras de cuero vegetal. Ajuste cruzado a la espalda y bolsillo doble frontal.',
    type: 'simple',
    model_id: 'm-bistro',
    brand_id: 'b-chefline',
    origin: 'importado',
    vertical_ids: ['v-gastronomia'],
    category_ids: ['cat-accesorios'],
    price: 2200,
    featured: false,
    low_stock_threshold: null,
    customization: customizationOff,
    images: [
      stock('1607083206968-13611e3d76db', 'Delantal de peto en lona, vista frontal', 0),
    ],
    set_pieces: [],
    created_at: '2026-03-10T10:00:00-04:00',
  },
  {
    id: 'p-camisa-oxford',
    slug: 'camisa-corporativa-oxford',
    name: 'Camisa Corporativa Oxford',
    description:
      'Camisa de vestir en tejido oxford non-iron, corte regular. Cuello italiano y puño ajustable. Base del uniforme de imagen corporativa.',
    type: 'simple',
    model_id: 'm-oxford',
    brand_id: 'b-mediwear',
    origin: 'importado',
    vertical_ids: ['v-corporativo'],
    category_ids: ['cat-camisas'],
    price: 3100,
    featured: true,
    low_stock_threshold: null,
    customization: customizationOff,
    images: [
      stock('1602810318383-e386cc2a3ccf', 'Camisa corporativa oxford, vista frontal', 0),
    ],
    set_pieces: [],
    created_at: '2026-06-01T10:00:00-04:00',
  },
  {
    id: 'p-chaqueta-ejecutiva',
    slug: 'chaqueta-corporativa-ejecutiva',
    name: 'Chaqueta Corporativa Ejecutiva',
    description:
      'Blazer estructurado en poliviscosa con forro interior. Corte recto unisex, ideal para recepción y atención al público.',
    type: 'simple',
    model_id: 'm-ejecutiva',
    brand_id: 'b-linea-patrones',
    origin: 'nacional',
    vertical_ids: ['v-corporativo'],
    category_ids: ['cat-chaquetas'],
    price: 5600,
    featured: false,
    low_stock_threshold: null,
    customization: customizationOff,
    images: [
      stock('1594938298603-c8148c4dae35', 'Blazer corporativo estructurado, vista frontal', 0),
    ],
    set_pieces: [],
    created_at: '2026-06-12T10:00:00-04:00',
  },
  {
    id: 'p-figs-casma',
    slug: 'scrub-top-figs-casma',
    name: 'Scrub Top FIGS Casma',
    description:
      'Casaca de cuello en V de FIGS en tejido técnico FIONx, antiarrugas y de secado rápido. Marca de terceros: trae su propia tabla de medidas.',
    type: 'simple',
    model_id: 'm-figs-casma',
    brand_id: 'b-figs',
    origin: 'importado',
    vertical_ids: ['v-salud'],
    category_ids: ['cat-scrubs'],
    price: 3800,
    featured: false,
    low_stock_threshold: null,
    customization: customizationOff,
    images: [
      stock('1584515933487-779824d29309', 'Casaca FIGS Casma en tejido técnico, vista frontal', 0),
    ],
    set_pieces: [],
    size_chart_id: 'sc-figs-womens-tops',
    created_at: '2026-06-20T10:00:00-04:00',
  },
  {
    id: 'p-figs-livingston',
    slug: 'pantalon-figs-livingston',
    name: 'Pantalón FIGS Livingston',
    description:
      'Pantalón jogger de FIGS en tejido técnico FIONx, con cintura elástica y puños. Marca de terceros: trae su propia tabla de medidas de pantalón.',
    type: 'simple',
    model_id: 'm-figs-livingston',
    brand_id: 'b-figs',
    origin: 'importado',
    vertical_ids: ['v-salud'],
    category_ids: ['cat-pantalones'],
    price: 3600,
    featured: false,
    low_stock_threshold: null,
    customization: customizationOff,
    images: [
      stock('1631217868264-e5b90bb7e133', 'Pantalón FIGS Livingston, vista frontal', 0),
    ],
    set_pieces: [],
    size_chart_id: 'sc-figs-womens-pants',
    created_at: '2026-06-22T10:00:00-04:00',
  },
  {
    id: 'p-zueco-terra',
    slug: 'zueco-profesional-terra',
    name: 'Zueco Profesional Terra',
    description:
      'Zueco antideslizante de EVA moldeado, lavable y liviano. Suela certificada para pisos de clínica y de cocina.',
    type: 'simple',
    model_id: 'm-terra',
    brand_id: 'b-chefline',
    origin: 'importado',
    // N:N: el mismo zueco sirve a salud y a gastronomia.
    vertical_ids: ['v-salud', 'v-gastronomia'],
    category_ids: ['cat-calzado'],
    price: 1900,
    featured: false,
    low_stock_threshold: null,
    customization: customizationOff,
    images: [
      stock('1600185365483-26d7a4cc7519', 'Zueco profesional antideslizante, vista lateral', 0),
    ],
    set_pieces: [],
    created_at: '2026-02-25T10:00:00-04:00',
  },
];

/**
 * Seed mock - Variantes (§9.2, §7).
 *
 * La variante es la unidad REAL de existencia: lleva el SKU (lo provee PATRONES,
 * nosotros no lo generamos) y el stock. disponible = stock_qty - reserved_qty.
 *
 * Estados sembrados a proposito para que la demo NO mienta:
 *  - Disponible normal.
 *  - BAJO STOCK (disponible <= 5): alerta de admin, invisible al publico (§9.2).
 *  - COLOR ENTERO en 0: el color desaparece del selector y del filtro (§7b).
 *  - RESERVA que baja disponibilidad: stock crudo > 0 pero reservado lo agota (§7a).
 *  - PRODUCTO ENTERO en 0 (p-delantal-bistro): desaparece de todo el publico (§7b).
 */

import type { ProductVariant, VariantColor } from '../../types';

const verdeQuirofano: VariantColor = { name: 'Verde quirófano', hex: '#3f7d6e' };
const azulMarino: VariantColor = { name: 'Azul marino', hex: '#26344d' };
const vino: VariantColor = { name: 'Vino', hex: '#5e2733' };
const blanco: VariantColor = { name: 'Blanco', hex: '#f4f4f1' };
const negro: VariantColor = { name: 'Negro', hex: '#1d1d1b' };
const celeste: VariantColor = { name: 'Celeste', hex: '#cfe0ec' };
const marron: VariantColor = { name: 'Marrón', hex: '#5b4636' };
const gris: VariantColor = { name: 'Gris grafito', hex: '#4a4d52' };

interface VariantSpec {
  sku: string;
  size: string;
  color: VariantColor;
  stock: number;
  reserved?: number;
  attributes?: Record<string, string>;
  price_override?: number | null;
}

/** Reduce el ruido: expande specs a ProductVariant completas. */
function variantsFor(productId: string, specs: VariantSpec[]): ProductVariant[] {
  return specs.map((s, i) => ({
    id: `${productId}-v${i + 1}`,
    product_id: productId,
    sku: s.sku,
    size: s.size,
    color: s.color,
    attributes: s.attributes ?? {},
    stock_qty: s.stock,
    reserved_qty: s.reserved ?? 0,
    price_override: s.price_override ?? null,
  }));
}

export const variants: ProductVariant[] = [
  // --- Scrub Top Aura: el caso rico. Tres colores en distinto estado. -------
  ...variantsFor('p-scrub-aura', [
    // Verde quirofano: casi todo OK, XL en bajo stock.
    { sku: 'PTR-AURA-SCB-VQ-S', size: 'S', color: verdeQuirofano, stock: 14 },
    { sku: 'PTR-AURA-SCB-VQ-M', size: 'M', color: verdeQuirofano, stock: 8, reserved: 3 }, // disp 5 -> bajo (borde)
    { sku: 'PTR-AURA-SCB-VQ-L', size: 'L', color: verdeQuirofano, stock: 20 },
    { sku: 'PTR-AURA-SCB-VQ-XL', size: 'XL', color: verdeQuirofano, stock: 4 }, // disp 4 -> bajo
    // Azul marino: S agotada (se oculta), el resto visible.
    { sku: 'PTR-AURA-SCB-AM-S', size: 'S', color: azulMarino, stock: 0 }, // disp 0 -> se oculta la variante
    { sku: 'PTR-AURA-SCB-AM-M', size: 'M', color: azulMarino, stock: 15, reserved: 2 },
    { sku: 'PTR-AURA-SCB-AM-L', size: 'L', color: azulMarino, stock: 2 }, // disp 2 -> bajo
    { sku: 'PTR-AURA-SCB-AM-XL', size: 'XL', color: azulMarino, stock: 9 },
    // Vino: COLOR ENTERO en 0 -> el color desaparece del selector y del filtro.
    { sku: 'PTR-AURA-SCB-VN-S', size: 'S', color: vino, stock: 0 },
    { sku: 'PTR-AURA-SCB-VN-M', size: 'M', color: vino, stock: 0 },
    { sku: 'PTR-AURA-SCB-VN-L', size: 'L', color: vino, stock: 0 },
    { sku: 'PTR-AURA-SCB-VN-XL', size: 'XL', color: vino, stock: 0 },
  ]),

  // --- Pantalon Jogger Aura: compañero del scrub (bundle sugerido). ---------
  ...variantsFor('p-jogger-aura', [
    { sku: 'PTR-AURA-JOG-AM-S', size: 'S', color: azulMarino, stock: 10 },
    { sku: 'PTR-AURA-JOG-AM-M', size: 'M', color: azulMarino, stock: 3 }, // bajo
    { sku: 'PTR-AURA-JOG-AM-L', size: 'L', color: azulMarino, stock: 12 },
    { sku: 'PTR-AURA-JOG-AM-XL', size: 'XL', color: azulMarino, stock: 7 },
    { sku: 'PTR-AURA-JOG-VQ-M', size: 'M', color: verdeQuirofano, stock: 6 },
    { sku: 'PTR-AURA-JOG-VQ-L', size: 'L', color: verdeQuirofano, stock: 5 }, // bajo
  ]),

  // --- Conjunto Quirurgico (SET cerrado): una sola talla por referencia. ----
  // Umbral override del producto = 3. La talla M queda en bajo por reserva.
  ...variantsFor('p-conjunto-quirurgico', [
    { sku: 'MDW-QX-SET-VQ-S', size: 'S', color: verdeQuirofano, stock: 6 },
    { sku: 'MDW-QX-SET-VQ-M', size: 'M', color: verdeQuirofano, stock: 5, reserved: 3 }, // disp 2 <= 3 -> bajo
    { sku: 'MDW-QX-SET-VQ-L', size: 'L', color: verdeQuirofano, stock: 8 },
    { sku: 'MDW-QX-SET-AM-M', size: 'M', color: azulMarino, stock: 4 },
  ]),

  // --- Filipina Bordeaux: atributo MANGA (corta/larga) como variante. -------
  ...variantsFor('p-filipina-bordeaux', [
    { sku: 'PTR-BRD-FIL-BL-M-C', size: 'M', color: blanco, stock: 9, attributes: { manga: 'corta' } },
    { sku: 'PTR-BRD-FIL-BL-L-C', size: 'L', color: blanco, stock: 11, attributes: { manga: 'corta' } },
    { sku: 'PTR-BRD-FIL-BL-M-L', size: 'M', color: blanco, stock: 4, attributes: { manga: 'larga' } }, // bajo
    { sku: 'PTR-BRD-FIL-BL-L-L', size: 'L', color: blanco, stock: 10, attributes: { manga: 'larga' } },
    { sku: 'PTR-BRD-FIL-NG-M-L', size: 'M', color: negro, stock: 7, attributes: { manga: 'larga' } },
    { sku: 'PTR-BRD-FIL-NG-L-L', size: 'L', color: negro, stock: 2, attributes: { manga: 'larga' } }, // bajo
  ]),

  // --- Delantal Bistro: PRODUCTO ENTERO en 0 -> desaparece del publico (§7). -
  ...variantsFor('p-delantal-bistro', [
    { sku: 'CHL-BST-DEL-MR-U', size: 'Única', color: marron, stock: 0 },
    { sku: 'CHL-BST-DEL-NG-U', size: 'Única', color: negro, stock: 6, reserved: 6 }, // disp 0 por reserva
  ]),

  // --- Camisa Oxford: normal, con una talla en bajo por reserva. ------------
  ...variantsFor('p-camisa-oxford', [
    { sku: 'MDW-OXF-CAM-CL-S', size: 'S', color: celeste, stock: 12 },
    { sku: 'MDW-OXF-CAM-CL-M', size: 'M', color: celeste, stock: 18 },
    { sku: 'MDW-OXF-CAM-CL-L', size: 'L', color: celeste, stock: 7, reserved: 3 }, // disp 4 -> bajo
    { sku: 'MDW-OXF-CAM-BL-M', size: 'M', color: blanco, stock: 14 },
    { sku: 'MDW-OXF-CAM-BL-L', size: 'L', color: blanco, stock: 9 },
  ]),

  // --- Chaqueta Ejecutiva: baja rotacion, stock corto. ---------------------
  ...variantsFor('p-chaqueta-ejecutiva', [
    { sku: 'PTR-EJE-CHQ-GR-S', size: 'S', color: gris, stock: 5 }, // bajo (umbral global 5)
    { sku: 'PTR-EJE-CHQ-GR-M', size: 'M', color: gris, stock: 6 },
    { sku: 'PTR-EJE-CHQ-GR-L', size: 'L', color: gris, stock: 3 }, // bajo
    { sku: 'PTR-EJE-CHQ-NG-M', size: 'M', color: negro, stock: 8 },
  ]),

  // --- Scrub Top FIGS Casma: marca de terceros, tallas con su tabla propia. --
  ...variantsFor('p-figs-casma', [
    { sku: 'FIGS-CAS-TOP-AM-XS', size: 'XS', color: azulMarino, stock: 8 },
    { sku: 'FIGS-CAS-TOP-AM-S', size: 'S', color: azulMarino, stock: 12 },
    { sku: 'FIGS-CAS-TOP-AM-M', size: 'M', color: azulMarino, stock: 4 }, // bajo
    { sku: 'FIGS-CAS-TOP-AM-L', size: 'L', color: azulMarino, stock: 9 },
    { sku: 'FIGS-CAS-TOP-VN-S', size: 'S', color: vino, stock: 6 },
    { sku: 'FIGS-CAS-TOP-VN-M', size: 'M', color: vino, stock: 7 },
  ]),

  // --- Zueco Terra: calzado por numeracion, N:N salud+gastronomia. ----------
  ...variantsFor('p-zueco-terra', [
    { sku: 'CHL-TRR-ZUE-BL-38', size: '38', color: blanco, stock: 10 },
    { sku: 'CHL-TRR-ZUE-BL-39', size: '39', color: blanco, stock: 4 }, // bajo
    { sku: 'CHL-TRR-ZUE-BL-40', size: '40', color: blanco, stock: 15 },
    { sku: 'CHL-TRR-ZUE-BL-41', size: '41', color: blanco, stock: 12 },
    { sku: 'CHL-TRR-ZUE-NG-40', size: '40', color: negro, stock: 8 },
    { sku: 'CHL-TRR-ZUE-NG-41', size: '41', color: negro, stock: 0 }, // variante oculta
  ]),
];

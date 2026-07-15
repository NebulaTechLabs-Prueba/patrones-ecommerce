/**
 * Capa de composicion del storefront (server-only).
 *
 * Combina la frontera de datos (lib/data) con la regla de visibilidad
 * (lib/domains/availability). Hace I/O, por eso NO vive en lib/domains (que es puro).
 *
 * Aca se materializa la regla dura §7: lo agotado no llega a la UI. Las paginas
 * publicas consumen ESTAS funciones, no el repo crudo, para no reimplementar la
 * cascada de disponibilidad en cada vista.
 */

import { productRepo } from '@/lib/data';
import type { Brand, Collection, Model, Product, ProductVariant, Vertical } from '@/lib/data/types';
import { getAvailableColors, isProductAvailable } from '@/lib/domains/availability';
import { resolveSuggestedProductIds } from '@/lib/domains/bundles/bundles';

/** Un producto visible para el publico, con sus variantes disponibles ya resueltas. */
export interface VisibleProduct {
  product: Product;
  /** Todas las variantes del producto (crudas); la UI filtra con availability. */
  variants: ProductVariant[];
  /** Colores con al menos una variante disponible (para swatches en la card). */
  availableColors: ReturnType<typeof getAvailableColors>;
}

/** Carga productos con sus variantes y descarta los que no tienen existencia (§7b). */
async function loadVisibleProducts(): Promise<VisibleProduct[]> {
  const products = await productRepo.listProducts();
  const visible: VisibleProduct[] = [];
  for (const product of products) {
    const variants = await productRepo.listVariants(product.id);
    if (!isProductAvailable(variants)) continue; // producto entero en 0 -> no existe
    visible.push({
      product,
      variants,
      availableColors: getAvailableColors(variants),
    });
  }
  return visible;
}

/** Indice de marcas por id, util para resolver nombre/linea propia en las grillas. */
export async function getBrandsById(): Promise<Map<string, Brand>> {
  const brands = await productRepo.listBrands();
  return new Map(brands.map((b) => [b.id, b]));
}

/** Rubro con la cuenta de productos VISIBLES que contiene (puerta de la home). */
export interface VerticalDoor {
  vertical: Vertical;
  visibleProductCount: number;
}

export async function getVerticalDoors(): Promise<VerticalDoor[]> {
  const verticals = await productRepo.listVerticals();
  const visible = await loadVisibleProducts();
  return verticals
    .filter((v) => v.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((vertical) => ({
      vertical,
      visibleProductCount: visible.filter((p) => p.product.vertical_ids.includes(vertical.id)).length,
    }));
}

/**
 * Featured de la home: solo productos disponibles y marcados featured.
 * §9.4 pide que no se concentren en un rubro; devolvemos tambien cuantos rubros
 * abarca para que la home pueda advertir/decidir.
 */
export interface FeaturedResult {
  products: VisibleProduct[];
  verticalsCovered: number;
}

export async function getFeatured(limit = 8): Promise<FeaturedResult> {
  const visible = await loadVisibleProducts();
  const featured = visible.filter((p) => p.product.featured).slice(0, limit);
  const verticalsCovered = new Set(featured.flatMap((p) => p.product.vertical_ids)).size;
  return { products: featured, verticalsCovered };
}

// ---------------------------------------------------------------------------
// PLP (listado por rubro) y Linea PATRONES
// ---------------------------------------------------------------------------

/** Slugs de rubros activos, para generateStaticParams del export estatico. */
export async function getVerticalSlugs(): Promise<string[]> {
  const verticals = await productRepo.listVerticals();
  return verticals.filter((v) => v.is_active).map((v) => v.slug);
}

export interface VerticalCatalog {
  vertical: Vertical;
  products: VisibleProduct[];
}

/** Catalogo visible de un rubro. null si el rubro no existe o esta inactivo. */
export async function getVerticalCatalog(slug: string): Promise<VerticalCatalog | null> {
  const vertical = await productRepo.getVerticalBySlug(slug);
  if (!vertical || !vertical.is_active) return null;
  const visible = await loadVisibleProducts();
  const products = visible.filter((p) => p.product.vertical_ids.includes(vertical.id));
  return { vertical, products };
}

// ---------------------------------------------------------------------------
// Colecciones
// ---------------------------------------------------------------------------

export async function getCollectionSlugs(): Promise<string[]> {
  const collections = await productRepo.listCollections();
  return collections.map((c) => c.slug);
}

export interface CollectionCatalog {
  collection: Collection;
  products: VisibleProduct[];
}

/** Catalogo visible de una coleccion, respetando el orden de la coleccion. */
export async function getCollectionCatalog(slug: string): Promise<CollectionCatalog | null> {
  const collection = await productRepo.getCollectionBySlug(slug);
  if (!collection) return null;
  const visible = await loadVisibleProducts();
  const byId = new Map(visible.map((p) => [p.product.id, p]));
  const products = collection.product_ids
    .map((id) => byId.get(id))
    .filter((p): p is VisibleProduct => p !== undefined);
  return { collection, products };
}

/** Coleccion destacada para la home (la primera disponible). */
export async function getFeaturedCollection(): Promise<Collection | null> {
  const collections = await productRepo.listCollections();
  return collections[0] ?? null;
}

/** Productos visibles de la Linea propia PATRONES (§9.5). */
export async function getOwnLineProducts(): Promise<VisibleProduct[]> {
  const [visible, brands] = await Promise.all([loadVisibleProducts(), productRepo.listBrands()]);
  const ownLineIds = new Set(brands.filter((b) => b.is_own_line).map((b) => b.id));
  return visible.filter((p) => ownLineIds.has(p.product.brand_id));
}

// ---------------------------------------------------------------------------
// PDP (ficha de producto)
// ---------------------------------------------------------------------------

/** Slugs de productos VISIBLES. Los agotados no se generan -> URL directa da 404 (§7f). */
export async function getVisibleProductSlugs(): Promise<string[]> {
  const visible = await loadVisibleProducts();
  return visible.map((p) => p.product.slug);
}

export interface ProductDetail {
  product: Product;
  variants: ProductVariant[];
  availableColors: ReturnType<typeof getAvailableColors>;
  brand: Brand | null;
  model: Model | null;
  verticals: Vertical[];
  /** Conjunto SUGERIDO: otros productos visibles del mismo bundle (§9.3). */
  suggested: VisibleProduct[];
}

/**
 * Ficha completa de un producto. null si no existe o esta agotado (§7f): con export
 * estatico, no generar el slug ya produce 404; esto lo cubre tambien en runtime.
 */
export async function getProductDetail(slug: string): Promise<ProductDetail | null> {
  const product = await productRepo.getProductBySlug(slug);
  if (!product) return null;
  const variants = await productRepo.listVariants(product.id);
  if (!isProductAvailable(variants)) return null;

  const [brands, models, allVerticals, bundles, visible] = await Promise.all([
    productRepo.listBrands(),
    productRepo.listModels(),
    productRepo.listVerticals(),
    productRepo.listBundles(),
    loadVisibleProducts(),
  ]);

  const brand = brands.find((b) => b.id === product.brand_id) ?? null;
  const model = models.find((m) => m.id === product.model_id) ?? null;
  const verticals = allVerticals.filter((v) => product.vertical_ids.includes(v.id));

  // Conjunto sugerido: solo lo disponible (§9.3). Prioridad manual por sort_order.
  // La logica pura vive en lib/domains/bundles; aca solo se resuelven los productos.
  const visibleById = new Map(visible.map((p) => [p.product.id, p]));
  const suggested = resolveSuggestedProductIds(product.id, bundles, (id) => visibleById.has(id))
    .map((id) => visibleById.get(id))
    .filter((p): p is VisibleProduct => p !== undefined);

  return {
    product,
    variants,
    availableColors: getAvailableColors(variants),
    brand,
    model,
    verticals,
    suggested,
  };
}

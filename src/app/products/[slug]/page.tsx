/**
 * PDP - ficha de producto (§9, §13.5, §16.2).
 *
 * Export estatico: generateStaticParams enumera SOLO productos visibles; un
 * agotado no se genera y su URL directa da 404 (§7f). El selector de variantes es
 * el unico 'use client' de la pagina (interaccion justificada).
 *
 * Reglas visibles aca:
 *  - Precio siempre presente (en el selector).
 *  - Conjunto CERRADO: muestra sus piezas (set_pieces, descriptivo) y el aviso de
 *    no-devolucion (§13.5). No se pide talla por pieza.
 *  - Conjunto SUGERIDO: inline y discreto, nunca modal (§9.3).
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProductGallery } from '@/components/storefront/ProductGallery';
import { SizeChartSection } from '@/components/storefront/SizeChartSection';
import { SuggestedSet, type SuggestedProductData } from '@/components/storefront/SuggestedSet';
import { VariantSelector, type SelectableVariant } from '@/components/storefront/VariantSelector';
import { productRepo, settingsRepo } from '@/lib/data';
import { filterAvailableVariants, getAvailableStock } from '@/lib/domains/availability';
import { getBrandsById, getProductDetail, getVisibleProductSlugs } from '@/lib/storefront/catalog';
import { SelectedVariantProvider } from '@/lib/store/selected-variant-context';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getVisibleProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getProductDetail(slug);
  if (!detail) return { title: 'Producto no encontrado — PATRONES' };
  return {
    title: `${detail.product.name} — PATRONES`,
    description: detail.product.description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const [detail, settings, brandsById] = await Promise.all([
    getProductDetail(slug),
    settingsRepo.getSettings(),
    getBrandsById(),
  ]);

  if (!detail) notFound();

  const { product, variants, brand, model, verticals, suggested } = detail;

  const sizeChart = product.size_chart_id
    ? await productRepo.getSizeChartById(product.size_chart_id)
    : null;

  // Datos de la sugerencia coordinada (§9.3): variantes disponibles del producto
  // sugerido, para que el cliente pueda coordinar talla/color con su seleccion.
  const suggestedData: SuggestedProductData[] = suggested.map((s) => ({
    productId: s.product.id,
    name: s.product.name,
    slug: s.product.slug,
    imageUrl: s.product.images[0]?.url ?? null,
    basePriceCents: s.product.price,
    isOwnLine: brandsById.get(s.product.brand_id)?.is_own_line ?? false,
    verticalIds: s.product.vertical_ids,
    categoryIds: s.product.category_ids,
    variants: filterAvailableVariants(s.variants).map((v) => ({
      sku: v.sku,
      size: v.size,
      colorName: v.color.name,
      colorHex: v.color.hex,
      priceCents: v.price_override ?? s.product.price,
      availableQty: getAvailableStock(v),
    })),
  }));

  // Solo variantes disponibles hacia el selector (§7). Precio resuelto por variante.
  const selectable: SelectableVariant[] = filterAvailableVariants(variants).map((v) => ({
    sku: v.sku,
    size: v.size,
    colorName: v.color.name,
    colorHex: v.color.hex,
    attributes: v.attributes,
    priceCents: v.price_override ?? product.price,
    availableQty: getAvailableStock(v),
  }));

  const classification = {
    productId: product.id,
    productSlug: product.slug,
    verticalIds: product.vertical_ids,
    categoryIds: product.category_ids,
    collectionIds: [],
    isOwnLine: brand?.is_own_line ?? false,
    imageUrl: product.images[0]?.url ?? null,
  };

  const isSet = product.type === 'set';

  return (
    <main className={styles.main}>
      <nav className={styles.breadcrumb} aria-label="Ruta">
        <Link href="/">Inicio</Link>
        {verticals[0] ? (
          <>
            <span aria-hidden="true"> / </span>
            <Link href={`/uniformes/${verticals[0].slug}/`}>{verticals[0].name}</Link>
          </>
        ) : null}
        <span aria-hidden="true"> / </span>
        <span className={styles.current}>{product.name}</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.galleryCol}>
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        <SelectedVariantProvider>
        <div className={styles.infoCol}>
          <div className={styles.headings}>
            {brand ? (
              <p className={styles.brand}>
                {brand.name}
                {brand.is_own_line ? <span className={styles.ownLine}>Línea PATRONES</span> : null}
              </p>
            ) : null}
            <h1 className={styles.title}>{product.name}</h1>
            {model ? <p className={styles.model}>Modelo {model.name}</p> : null}
          </div>

          <VariantSelector
            productName={product.name}
            basePriceCents={product.price}
            variants={selectable}
            whatsappNumber={settings.whatsapp_number}
            classification={classification}
          />

          <p className={styles.description}>{product.description}</p>

          {isSet ? (
            <section className={styles.set}>
              <h2 className={styles.setTitle}>Este conjunto incluye</h2>
              <ul className={styles.setPieces}>
                {product.set_pieces.map((piece) => (
                  <li key={piece.name}>
                    <span className={styles.pieceName}>{piece.name}</span>
                    {piece.description ? (
                      <span className={styles.pieceDesc}> — {piece.description}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <p className={styles.setNote}>
                Es un conjunto cerrado: se entrega completo, con una sola talla. No se
                venden ni se cambian piezas por separado.
              </p>
            </section>
          ) : null}

          {sizeChart ? <SizeChartSection chart={sizeChart} /> : null}

          <SuggestedSet items={suggestedData} />
        </div>
        </SelectedVariantProvider>
      </div>
    </main>
  );
}

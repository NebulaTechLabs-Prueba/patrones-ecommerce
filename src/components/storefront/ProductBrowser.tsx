'use client';

/**
 * ProductBrowser (client) — búsqueda + filtros FACETADOS y compactos.
 *
 * Diseño (feedback PM/cliente):
 *  - Nada de "muro de pills": cada faceta (Género, Categoría, Marca, Color) es un
 *    desplegable compacto; lo elegido se ve como chips removibles.
 *  - Reactivo: al elegir en una faceta, las opciones de las demás se recalculan a lo
 *    que realmente existe con esa selección → se evita en lo posible "Sin resultados".
 *  - Color por FAMILIAS (Negro, Azul, Verde, Rojo…): agrupa tonos casi idénticos que
 *    a simple vista no se distinguían.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';
import type { Gender, Product, VariantColor } from '@/lib/data/types';
import styles from './ProductBrowser.module.css';

export interface BrowserItem {
  product: Product;
  availableColors: VariantColor[];
  brandName: string;
  isOwnLine: boolean;
}

interface Facet {
  id: string;
  name: string;
}

export interface BrowserInitial {
  search?: string;
  genders?: string[];
  brands?: string[];
  categories?: string[];
}

interface ProductBrowserProps {
  items: BrowserItem[];
  categories: Facet[];
  brands: Facet[];
  colors?: VariantColor[];
  genders?: Gender[];
  heading?: string;
  subheading?: string;
  searchPlaceholder?: string;
  initial?: BrowserInitial;
}

const GENDER_LABEL: Record<string, string> = { hombre: 'Hombre', mujer: 'Mujer', unisex: 'Unisex' };

// Familias de color: agrupan tonos parecidos en grupos distinguibles.
const FAMILIES: Array<{ key: string; name: string; hex: string }> = [
  { key: 'negro', name: 'Negro', hex: '#1d1d1b' },
  { key: 'gris', name: 'Gris', hex: '#9aa0a6' },
  { key: 'blanco', name: 'Blanco', hex: '#f2f2ef' },
  { key: 'azul', name: 'Azul', hex: '#26344d' },
  { key: 'verde', name: 'Verde', hex: '#3f7d6e' },
  { key: 'rojo', name: 'Rojo', hex: '#8f2d2d' },
  { key: 'rosa', name: 'Rosa', hex: '#e8a5bf' },
  { key: 'morado', name: 'Morado', hex: '#6a4a8f' },
  { key: 'amarillo', name: 'Amarillo', hex: '#e3c04a' },
  { key: 'naranja', name: 'Naranja', hex: '#d98a3d' },
  { key: 'marron', name: 'Marrón', hex: '#5b4636' },
  { key: 'beige', name: 'Beige', hex: '#d8c3a5' },
];
const FAMILY_NAME = new Map(FAMILIES.map((f) => [f.key, f.name]));
const FAMILY_HEX = new Map(FAMILIES.map((f) => [f.key, f.hex]));

function hexToFamily(hex?: string | null): string {
  if (!hex) return 'gris';
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length < 6) return 'gris';
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let hue = 0;
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  if (l < 0.13) return 'negro';
  if (s < 0.12) return l > 0.8 ? 'blanco' : l < 0.3 ? 'negro' : 'gris';
  if (hue < 20 || hue >= 340) return 'rojo';
  if (hue < 45) return l < 0.45 && s < 0.65 ? 'marron' : l > 0.62 ? 'beige' : 'naranja';
  if (hue < 68) return 'amarillo';
  if (hue < 175) return 'verde';
  if (hue < 255) return 'azul';
  if (hue < 300) return 'morado';
  return 'rosa';
}

function toggle(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

type FacetKey = 'g' | 'c' | 'b' | 'f';

export function ProductBrowser({
  items,
  categories,
  brands,
  genders = [],
  heading,
  subheading,
  searchPlaceholder = 'Buscar producto…',
  initial,
}: ProductBrowserProps) {
  const [search, setSearch] = useState(initial?.search ?? '');
  const [gSel, setGSel] = useState<Set<string>>(new Set(initial?.genders ?? []));
  const [cSel, setCSel] = useState<Set<string>>(new Set(initial?.categories ?? []));
  const [bSel, setBSel] = useState<Set<string>>(new Set(initial?.brands ?? []));
  const [fSel, setFSel] = useState<Set<string>>(new Set());
  const [openFacet, setOpenFacet] = useState<FacetKey | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const brandName = useMemo(() => new Map(brands.map((b) => [b.id, b.name])), [brands]);

  // Enriquece cada item con sus valores de faceta (una sola vez).
  const enriched = useMemo(
    () =>
      items.map((it) => ({
        it,
        gender: it.product.gender ?? 'unisex',
        cats: it.product.category_ids,
        brand: it.product.brand_id,
        fams: [...new Set(it.availableColors.map((c) => hexToFamily(c.hex)))],
        nameLc: it.product.name.toLowerCase(),
      })),
    [items],
  );

  // Pasa los filtros activos, opcionalmente ignorando una faceta (para calcular sus
  // opciones disponibles de forma reactiva).
  function pass(e: (typeof enriched)[number], skip?: FacetKey): boolean {
    const q = search.trim().toLowerCase();
    if (q && !e.nameLc.includes(q)) return false;
    if (skip !== 'g' && gSel.size > 0 && !gSel.has(e.gender)) return false;
    if (skip !== 'c' && cSel.size > 0 && !e.cats.some((c) => cSel.has(c))) return false;
    if (skip !== 'b' && bSel.size > 0 && !bSel.has(e.brand)) return false;
    if (skip !== 'f' && fSel.size > 0 && !e.fams.some((f) => fSel.has(f))) return false;
    return true;
  }

  const results = useMemo(() => enriched.filter((e) => pass(e)), [enriched, search, gSel, cSel, bSel, fSel]);

  // Opciones disponibles por faceta (reactivas: según las OTRAS facetas activas).
  const availG = useMemo(() => new Set(enriched.filter((e) => pass(e, 'g')).map((e) => e.gender)), [enriched, search, cSel, bSel, fSel]);
  const availC = useMemo(() => new Set(enriched.filter((e) => pass(e, 'c')).flatMap((e) => e.cats)), [enriched, search, gSel, bSel, fSel]);
  const availB = useMemo(() => new Set(enriched.filter((e) => pass(e, 'b')).map((e) => e.brand)), [enriched, search, gSel, cSel, fSel]);
  const availF = useMemo(() => new Set(enriched.filter((e) => pass(e, 'f')).flatMap((e) => e.fams)), [enriched, search, gSel, cSel, bSel]);

  // Cierra el desplegable al hacer clic afuera.
  useEffect(() => {
    function onDoc(ev: MouseEvent) {
      if (barRef.current && !barRef.current.contains(ev.target as Node)) setOpenFacet(null);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const genderOpts = (genders.length ? genders : (['mujer', 'hombre', 'unisex'] as Gender[])).filter(
    (g) => availG.has(g) || gSel.has(g),
  );
  const catOpts = categories.filter((c) => availC.has(c.id) || cSel.has(c.id));
  const brandOpts = brands.filter((b) => availB.has(b.id) || bSel.has(b.id));
  const famOpts = FAMILIES.filter((f) => availF.has(f.key) || fSel.has(f.key));

  const activeCount = gSel.size + cSel.size + bSel.size + fSel.size;
  const hasFilters = activeCount > 0 || search.trim() !== '';

  function clearAll() {
    setSearch('');
    setGSel(new Set());
    setCSel(new Set());
    setBSel(new Set());
    setFSel(new Set());
  }

  const chips: Array<{ label: string; onRemove: () => void }> = [
    ...[...gSel].map((g) => ({ label: GENDER_LABEL[g] ?? g, onRemove: () => setGSel((s) => toggle(s, g)) })),
    ...[...cSel].map((c) => ({ label: catName.get(c) ?? c, onRemove: () => setCSel((s) => toggle(s, c)) })),
    ...[...bSel].map((b) => ({ label: brandName.get(b) ?? b, onRemove: () => setBSel((s) => toggle(s, b)) })),
    ...[...fSel].map((f) => ({ label: FAMILY_NAME.get(f) ?? f, onRemove: () => setFSel((s) => toggle(s, f)) })),
  ];

  return (
    <div>
      {heading ? (
        <div className={styles.head}>
          <p className={styles.eyebrow}>La selección</p>
          <h2 className={styles.heading}>{heading}</h2>
          {subheading ? <p className={styles.sub}>{subheading}</p> : null}
        </div>
      ) : null}

      <div className={styles.bar} ref={barRef}>
        <input
          type="search"
          className={styles.search}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar productos"
        />

        <div className={styles.facets}>
          {genderOpts.length > 0 ? (
            <Facet
              label="Género"
              count={gSel.size}
              open={openFacet === 'g'}
              onToggle={() => setOpenFacet((o) => (o === 'g' ? null : 'g'))}
            >
              {genderOpts.map((g) => (
                <Opt key={g} checked={gSel.has(g)} disabled={!availG.has(g) && !gSel.has(g)} onClick={() => setGSel((s) => toggle(s, g))}>
                  {GENDER_LABEL[g] ?? g}
                </Opt>
              ))}
            </Facet>
          ) : null}

          {catOpts.length > 0 ? (
            <Facet label="Categoría" count={cSel.size} open={openFacet === 'c'} onToggle={() => setOpenFacet((o) => (o === 'c' ? null : 'c'))}>
              {catOpts.map((c) => (
                <Opt key={c.id} checked={cSel.has(c.id)} disabled={!availC.has(c.id) && !cSel.has(c.id)} onClick={() => setCSel((s) => toggle(s, c.id))}>
                  {c.name}
                </Opt>
              ))}
            </Facet>
          ) : null}

          {brandOpts.length > 1 ? (
            <Facet label="Marca" count={bSel.size} open={openFacet === 'b'} onToggle={() => setOpenFacet((o) => (o === 'b' ? null : 'b'))} wide>
              {brandOpts.map((b) => (
                <Opt key={b.id} checked={bSel.has(b.id)} disabled={!availB.has(b.id) && !bSel.has(b.id)} onClick={() => setBSel((s) => toggle(s, b.id))}>
                  {b.name}
                </Opt>
              ))}
            </Facet>
          ) : null}

          {famOpts.length > 1 ? (
            <Facet label="Color" count={fSel.size} open={openFacet === 'f'} onToggle={() => setOpenFacet((o) => (o === 'f' ? null : 'f'))}>
              <div className={styles.swatchGrid}>
                {famOpts.map((f) => {
                  const off = !availF.has(f.key) && !fSel.has(f.key);
                  return (
                    <button
                      key={f.key}
                      type="button"
                      className={`${styles.swatchOpt} ${fSel.has(f.key) ? styles.swatchOptOn : ''}`}
                      onClick={() => setFSel((s) => toggle(s, f.key))}
                      aria-pressed={fSel.has(f.key)}
                      disabled={off}
                      style={{ opacity: off ? 0.3 : 1 }}
                      title={f.name}
                    >
                      <span className={styles.swatchDot} style={{ background: FAMILY_HEX.get(f.key) }} />
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </Facet>
          ) : null}

          {hasFilters ? (
            <button type="button" className={styles.clearBtn} onClick={clearAll}>
              Limpiar
            </button>
          ) : null}
        </div>
      </div>

      {chips.length > 0 ? (
        <div className={styles.chips}>
          {chips.map((c, i) => (
            <button key={i} type="button" className={styles.chipRemove} onClick={c.onRemove}>
              {c.label} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.meta}>
        <span aria-live="polite">
          {results.length} {results.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {results.length > 0 ? (
        <ul className={styles.grid}>
          {results.map((e) => (
            <li key={e.it.product.id} className={styles.item}>
              <ProductCard product={e.it.product} availableColors={e.it.availableColors} brandName={e.it.brandName} isOwnLine={e.it.isOwnLine} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Sin resultados" description="Prueba con otros filtros o ajusta la búsqueda." />
      )}
    </div>
  );
}

function Facet({
  label,
  count,
  open,
  onToggle,
  wide,
  children,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.facetWrap}>
      <button type="button" className={`${styles.facetBtn} ${count > 0 ? styles.facetBtnOn : ''}`} aria-expanded={open} onClick={onToggle}>
        {label}
        {count > 0 ? <span className={styles.facetCount}>{count}</span> : null}
        <span className={styles.caret} aria-hidden="true">▾</span>
      </button>
      {open ? <div className={`${styles.popover} ${wide ? styles.popoverWide : ''}`} role="menu">{children}</div> : null}
    </div>
  );
}

function Opt({ checked, disabled, onClick, children }: { checked: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={`${styles.opt} ${checked ? styles.optOn : ''}`} onClick={onClick} disabled={disabled} aria-pressed={checked}>
      <span className={styles.optCheck} aria-hidden="true">{checked ? '✓' : ''}</span>
      {children}
    </button>
  );
}

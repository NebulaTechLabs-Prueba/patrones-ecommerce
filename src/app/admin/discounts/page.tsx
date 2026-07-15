/**
 * Admin - Descuentos (§13.2). Promociones acumulables: tipo, alcance, valor,
 * stackable + priority (orden determinista) y vigencia. El motor de cálculo
 * (lib/domains/pricing) ya está implementado y testeado.
 */

import { productRepo } from '@/lib/data';
import type { Promotion, PromotionType } from '@/lib/data/types';
import { formatUsd } from '@/lib/format';
import ui from '@/components/admin/adminUI.module.css';

const TYPE_LABELS: Record<PromotionType, string> = {
  percentage: 'Porcentaje',
  fixed_amount: 'Monto fijo',
  variant_special_price: 'Precio especial',
  quantity: 'Mayoreo',
};

function formatValue(p: Promotion): string {
  switch (p.type) {
    case 'percentage':
      return `${p.value}%`;
    case 'fixed_amount':
    case 'variant_special_price':
      return formatUsd(p.value);
    case 'quantity':
      return `${p.value}% · ≥${p.min_quantity ?? '?'} u.`;
    default:
      return String(p.value);
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export default async function AdminDiscountsPage() {
  const [promotions, products, verticals, categories, collections] = await Promise.all([
    productRepo.listPromotions(),
    productRepo.listProducts(),
    productRepo.listVerticals(),
    productRepo.listCategories(),
    productRepo.listCollections(),
  ]);

  const names = new Map<string, string>([
    ...products.map((p) => [p.id, p.name] as const),
    ...verticals.map((v) => [v.id, v.name] as const),
    ...categories.map((c) => [c.id, c.name] as const),
    ...collections.map((c) => [c.id, c.name] as const),
  ]);

  function target(p: Promotion): string {
    if (p.scope === 'own_line') return 'Línea PATRONES';
    if (p.scope === 'cart') return 'Todo el carrito';
    return p.target_id ? (names.get(p.target_id) ?? p.target_id) : '—';
  }

  const sorted = [...promotions].sort((a, b) => a.priority - b.priority);

  return (
    <div>
      <h1 className={ui.pageTitle}>Descuentos</h1>
      <p className={ui.pageSubtitle}>
        Las promociones se acumulan según lo que marques como apilable, en orden de prioridad.
      </p>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Promoción</th>
              <th>Tipo</th>
              <th>Alcance</th>
              <th>Aplica a</th>
              <th>Valor</th>
              <th>Apilable</th>
              <th>Prioridad</th>
              <th>Vigencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{TYPE_LABELS[p.type]}</td>
                <td className={ui.mono}>{p.scope}</td>
                <td>{target(p)}</td>
                <td>{formatValue(p)}</td>
                <td>{p.stackable ? 'Sí' : 'No'}</td>
                <td>{p.priority}</td>
                <td>
                  {formatDate(p.starts_at)} – {formatDate(p.ends_at)}
                </td>
                <td>
                  <span className={`${ui.badge} ${p.is_active ? ui.success : ui.neutral}`}>
                    {p.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

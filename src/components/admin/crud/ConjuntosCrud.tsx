'use client';

/**
 * CRUD de conjuntos SUGERIDOS (§9.3): relaciona productos sueltos que se
 * recomiendan juntos ("piezas relacionadas"). NO es el conjunto cerrado
 * (type: 'set', que es un producto con su propio SKU): esto solo vincula
 * productos existentes para sugerirlos en la ficha. Nunca auto-agrega nada.
 *
 * Lee del store compartido; en Fase 1 persiste en el navegador (localStorage).
 */

import { useState } from 'react';
import { AdminModal } from '../AdminModal';
import { TokenPicker } from '../TokenPicker';
import { useCatalog } from '@/lib/store/catalog-context';
import type { Bundle } from '@/lib/data/types';
import ui from '../adminUI.module.css';

interface Draft {
  id: string | null;
  name: string;
  productIds: string[];
  sortOrder: number;
}

export function ConjuntosCrud() {
  const { bundles, products, setBundles } = useCatalog();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');

  const ordered = [...bundles].sort((a, b) => a.sort_order - b.sort_order);
  const nameById = new Map(products.map((p) => [p.id, p.name]));

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) return setError('Pon un nombre.');
    if (draft.productIds.length < 2) return setError('Un conjunto relaciona al menos dos productos.');
    const rec: Bundle = {
      id: draft.id ?? `bnd-${Date.now()}`,
      name: draft.name.trim(),
      product_ids: draft.productIds,
      sort_order: draft.sortOrder,
    };
    setBundles(draft.id ? bundles.map((b) => (b.id === draft.id ? rec : b)) : [...bundles, rec]);
    setDraft(null);
    setError('');
  }

  return (
    <div>
      <div className={ui.pageHead}>
        <div>
          <h2 className={ui.pageTitle}>Conjuntos ({bundles.length})</h2>
          <p className={ui.pageSubtitle}>
            Piezas relacionadas que se sugieren juntas en la ficha. No se auto-agregan.
          </p>
        </div>
        <button
          type="button"
          className={ui.newBtn}
          onClick={() => {
            setError('');
            setDraft({ id: null, name: '', productIds: [], sortOrder: bundles.length + 1 });
          }}
        >
          Nuevo conjunto
        </button>
      </div>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Conjunto</th>
              <th>Piezas</th>
              <th>Orden</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((b) => (
              <tr key={b.id}>
                <td data-label="Conjunto">
                  <div>{b.name}</div>
                  <div className={ui.pageSubtitle}>
                    {b.product_ids.map((id) => nameById.get(id) ?? '—').join(' · ')}
                  </div>
                </td>
                <td data-label="Piezas">{b.product_ids.length}</td>
                <td data-label="Orden">{b.sort_order}</td>
                <td data-label="Acciones">
                  <div className={ui.actions}>
                    <button
                      type="button"
                      className={ui.actionBtn}
                      onClick={() => {
                        setError('');
                        setDraft({ id: b.id, name: b.name, productIds: [...b.product_ids], sortOrder: b.sort_order });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={`${ui.actionBtn} ${ui.actionDanger}`}
                      onClick={() => setBundles(bundles.filter((x) => x.id !== b.id))}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {bundles.length === 0 ? (
              <tr>
                <td colSpan={4} className={ui.pageSubtitle}>Aún no hay conjuntos. Creá el primero.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {draft ? (
        <AdminModal title={draft.id ? 'Editar conjunto' : 'Nuevo conjunto'} onClose={() => setDraft(null)}>
          <div className={ui.form}>
            <label className={ui.field}>
              <span>Nombre</span>
              <input
                className={ui.input}
                value={draft.name}
                placeholder="p. ej. Combina tu guardia"
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label className={ui.field}>
              <span>Orden</span>
              <input
                className={ui.input}
                type="number"
                min="1"
                value={draft.sortOrder}
                onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
              />
            </label>

            <div className={ui.field}>
              <span>Piezas relacionadas ({draft.productIds.length})</span>
              <TokenPicker
                options={products.map((p) => ({ id: p.id, name: p.name }))}
                selected={draft.productIds}
                onChange={(ids) => setDraft({ ...draft, productIds: ids })}
                placeholder="Buscar y agregar producto…"
              />
            </div>

            {error ? <p className={ui.formError}>{error}</p> : null}
            <div className={ui.formActions}>
              <button type="button" className={ui.cancelBtn} onClick={() => setDraft(null)}>Cancelar</button>
              <button type="button" className={ui.saveBtn} onClick={save}>Guardar</button>
            </div>
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}

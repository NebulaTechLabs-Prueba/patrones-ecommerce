'use client';

/**
 * CRUD de colecciones (§15). Lee del store compartido, así crear/editar una
 * colección se refleja en el lado público. Cada colección puede llevar vigencia
 * (fechas de inicio/fin); fuera del rango no se publica. El slug se deriva del
 * nombre y no se muestra.
 */

import { useState } from 'react';
import { AdminModal } from '../AdminModal';
import { useCatalog } from '@/lib/store/catalog-context';
import type { Collection } from '@/lib/data/types';
import { slugify } from '@/lib/slug';
import ui from '../adminUI.module.css';
import styles from '@/app/admin/content/content.module.css';

interface Draft {
  id: string | null;
  name: string;
  description: string;
  productIds: string[];
  startsAt: string;
  endsAt: string;
}

function vigencia(c: Collection): string {
  if (!c.starts_at && !c.ends_at) return 'Siempre';
  const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
  if (c.starts_at && c.ends_at) return `${fmt(c.starts_at)} — ${fmt(c.ends_at)}`;
  if (c.starts_at) return `Desde ${fmt(c.starts_at)}`;
  return `Hasta ${fmt(c.ends_at as string)}`;
}

export function CollectionsCrud() {
  const { collections, products, setCollections } = useCatalog();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) return setError('Poné un nombre.');
    if (draft.startsAt && draft.endsAt && draft.endsAt < draft.startsAt) {
      return setError('La fecha de fin no puede ser anterior a la de inicio.');
    }
    const existing = draft.id ? collections.find((c) => c.id === draft.id) : null;
    const rec: Collection = {
      id: draft.id ?? `col-${Date.now()}`,
      slug: existing ? existing.slug : slugify(draft.name),
      name: draft.name.trim(),
      description: draft.description.trim(),
      product_ids: draft.productIds,
      hero_image: existing?.hero_image ?? null,
      starts_at: draft.startsAt || null,
      ends_at: draft.endsAt || null,
    };
    setCollections(draft.id ? collections.map((c) => (c.id === draft.id ? rec : c)) : [...collections, rec]);
    setDraft(null);
    setError('');
  }

  function toggleProduct(id: string) {
    if (!draft) return;
    setDraft({
      ...draft,
      productIds: draft.productIds.includes(id)
        ? draft.productIds.filter((x) => x !== id)
        : [...draft.productIds, id],
    });
  }

  return (
    <section className={styles.section}>
      <div className={ui.pageHead}>
        <h2 className={styles.title}>Colecciones ({collections.length})</h2>
        <button
          type="button"
          className={ui.newBtn}
          onClick={() => {
            setError('');
            setDraft({ id: null, name: '', description: '', productIds: [], startsAt: '', endsAt: '' });
          }}
        >
          Nueva colección
        </button>
      </div>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Colección</th>
              <th>Productos</th>
              <th>Vigencia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.product_ids.length}</td>
                <td>{vigencia(c)}</td>
                <td>
                  <div className={ui.actions}>
                    <button
                      type="button"
                      className={ui.actionBtn}
                      onClick={() =>
                        setDraft({
                          id: c.id,
                          name: c.name,
                          description: c.description,
                          productIds: [...c.product_ids],
                          startsAt: c.starts_at ?? '',
                          endsAt: c.ends_at ?? '',
                        })
                      }
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={`${ui.actionBtn} ${ui.actionDanger}`}
                      onClick={() => setCollections(collections.filter((x) => x.id !== c.id))}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {draft ? (
        <AdminModal title={draft.id ? 'Editar colección' : 'Nueva colección'} onClose={() => setDraft(null)}>
          <div className={ui.form}>
            <label className={ui.field}>
              <span>Nombre</span>
              <input className={ui.input} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label className={ui.field}>
              <span>Descripción</span>
              <textarea
                className={ui.input}
                rows={2}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </label>

            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span>Vigente desde</span>
                <input
                  type="date"
                  className={ui.input}
                  value={draft.startsAt}
                  onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })}
                />
              </label>
              <label className={ui.field}>
                <span>Vigente hasta</span>
                <input
                  type="date"
                  className={ui.input}
                  value={draft.endsAt}
                  onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })}
                />
              </label>
            </div>

            <div className={ui.field}>
              <span>Productos ({draft.productIds.length})</span>
              <div className={styles.checkList}>
                {products.map((p) => (
                  <label key={p.id} className={ui.check}>
                    <input type="checkbox" checked={draft.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                    <span>{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {error ? <p className={ui.formError}>{error}</p> : null}
            <div className={ui.formActions}>
              <button type="button" className={ui.cancelBtn} onClick={() => setDraft(null)}>Cancelar</button>
              <button type="button" className={ui.saveBtn} onClick={save}>Guardar</button>
            </div>
          </div>
        </AdminModal>
      ) : null}
    </section>
  );
}

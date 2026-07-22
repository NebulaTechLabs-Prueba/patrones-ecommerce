'use client';

/**
 * CRUD de tablas de medidas (§ guía de tallas). En memoria: el editor permite
 * ajustar datos, columnas y filas de cada tabla. En Fase 2 esto persiste en la
 * base. El editor de grilla mantiene filas y encabezados alineados.
 */

import { useState } from 'react';
import { AdminModal } from '../AdminModal';
import type { SizeChart } from '@/lib/data/types';
import ui from '../adminUI.module.css';
import styles from '@/app/admin/content/content.module.css';

type Draft = SizeChart;

function emptyChart(): SizeChart {
  return {
    id: `sc-${Date.now()}`,
    name: '',
    garment: '',
    unit: 'cm',
    source: '',
    headers: ['Talla', 'Medida'],
    rows: [['', '']],
    measure: [],
  };
}

export function SizeChartsCrud({ initial }: { initial: SizeChart[] }) {
  const [charts, setCharts] = useState<SizeChart[]>(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) return setError('Pon un nombre.');
    if (!draft.garment.trim()) return setError('Indica la prenda.');
    const clean: SizeChart = {
      ...draft,
      name: draft.name.trim(),
      garment: draft.garment.trim(),
      unit: draft.unit.trim() || 'cm',
      source: draft.source.trim(),
      headers: draft.headers.map((h) => h.trim()),
      measure: draft.measure.filter((m) => m.label.trim() || m.text.trim()),
    };
    setCharts(charts.some((c) => c.id === clean.id) ? charts.map((c) => (c.id === clean.id ? clean : c)) : [...charts, clean]);
    setDraft(null);
    setError('');
  }

  // --- edición de grilla (mantiene columnas alineadas) ---
  function setHeader(i: number, v: string) {
    if (!draft) return;
    setDraft({ ...draft, headers: draft.headers.map((h, idx) => (idx === i ? v : h)) });
  }
  function setCell(r: number, c: number, v: string) {
    if (!draft) return;
    setDraft({ ...draft, rows: draft.rows.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? v : cell)) : row)) });
  }
  function addColumn() {
    if (!draft) return;
    setDraft({ ...draft, headers: [...draft.headers, ''], rows: draft.rows.map((row) => [...row, '']) });
  }
  function removeColumn(i: number) {
    if (!draft || draft.headers.length <= 1) return;
    setDraft({ ...draft, headers: draft.headers.filter((_, idx) => idx !== i), rows: draft.rows.map((row) => row.filter((_, idx) => idx !== i)) });
  }
  function addRow() {
    if (!draft) return;
    setDraft({ ...draft, rows: [...draft.rows, draft.headers.map(() => '')] });
  }
  function removeRow(r: number) {
    if (!draft) return;
    setDraft({ ...draft, rows: draft.rows.filter((_, idx) => idx !== r) });
  }
  function setMeasure(i: number, key: 'label' | 'text', v: string) {
    if (!draft) return;
    setDraft({ ...draft, measure: draft.measure.map((m, idx) => (idx === i ? { ...m, [key]: v } : m)) });
  }
  function addMeasure() {
    if (!draft) return;
    setDraft({ ...draft, measure: [...draft.measure, { label: '', text: '' }] });
  }
  function removeMeasure(i: number) {
    if (!draft) return;
    setDraft({ ...draft, measure: draft.measure.filter((_, idx) => idx !== i) });
  }

  return (
    <section className={styles.section}>
      <div className={ui.pageHead}>
        <h2 className={styles.title}>Tablas de medidas ({charts.length})</h2>
        <button type="button" className={ui.newBtn} onClick={() => { setError(''); setDraft(emptyChart()); }}>
          Nueva tabla
        </button>
      </div>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Tabla</th>
              <th>Prenda</th>
              <th>Tallas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {charts.map((sc) => (
              <tr key={sc.id}>
                <td>{sc.name}</td>
                <td>{sc.garment}</td>
                <td>{sc.rows.length}</td>
                <td>
                  <div className={ui.actions}>
                    <button type="button" className={ui.actionBtn} onClick={() => { setError(''); setDraft({ ...sc, headers: [...sc.headers], rows: sc.rows.map((r) => [...r]), measure: sc.measure.map((m) => ({ ...m })) }); }}>
                      Editar
                    </button>
                    <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} onClick={() => setCharts(charts.filter((x) => x.id !== sc.id))}>
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
        <AdminModal title={charts.some((c) => c.id === draft.id) ? 'Editar tabla de medidas' : 'Nueva tabla de medidas'} onClose={() => setDraft(null)}>
          <div className={ui.form}>
            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span>Nombre</span>
                <input className={ui.input} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </label>
              <label className={ui.field}>
                <span>Prenda</span>
                <input className={ui.input} value={draft.garment} onChange={(e) => setDraft({ ...draft, garment: e.target.value })} />
              </label>
            </div>
            <div className={ui.fieldRow}>
              <label className={ui.field}>
                <span>Unidad</span>
                <input className={ui.input} value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} placeholder="cm / in" />
              </label>
              <label className={ui.field}>
                <span>Origen</span>
                <input className={ui.input} value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} />
              </label>
            </div>

            <div className={ui.field}>
              <span>Medidas</span>
              <div className={ui.tableWrap}>
                <table className={ui.table}>
                  <thead>
                    <tr>
                      {draft.headers.map((h, i) => (
                        <th key={i}>
                          <input className={ui.input} value={h} onChange={(e) => setHeader(i, e.target.value)} />
                          {draft.headers.length > 1 ? (
                            <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} onClick={() => removeColumn(i)} aria-label="Quitar columna">×</button>
                          ) : null}
                        </th>
                      ))}
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {draft.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci}>
                            <input className={ui.input} value={cell} onChange={(e) => setCell(ri, ci, e.target.value)} />
                          </td>
                        ))}
                        <td>
                          <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} onClick={() => removeRow(ri)} aria-label="Quitar fila">×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={ui.actions}>
                <button type="button" className={ui.actionBtn} onClick={addRow}>+ Fila</button>
                <button type="button" className={ui.actionBtn} onClick={addColumn}>+ Columna</button>
              </div>
            </div>

            <div className={ui.field}>
              <span>Cómo medir</span>
              {draft.measure.map((m, i) => (
                <div key={i} className={ui.fieldRow}>
                  <input className={ui.input} value={m.label} placeholder="Zona (p.ej. Busto)" onChange={(e) => setMeasure(i, 'label', e.target.value)} />
                  <div style={{ display: 'flex', gap: 'var(--ptr-space-2)' }}>
                    <input className={ui.input} value={m.text} placeholder="Cómo tomar la medida" onChange={(e) => setMeasure(i, 'text', e.target.value)} />
                    <button type="button" className={`${ui.actionBtn} ${ui.actionDanger}`} onClick={() => removeMeasure(i)} aria-label="Quitar">×</button>
                  </div>
                </div>
              ))}
              <div className={ui.actions}>
                <button type="button" className={ui.actionBtn} onClick={addMeasure}>+ Indicación</button>
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

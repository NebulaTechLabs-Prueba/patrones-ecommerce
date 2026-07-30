'use client';

/**
 * Direcciones de encomienda del cliente (opcional): su casillero o la oficina de
 * Zoom/MRW más cercana, con los datos para retirar. Fase 1: se guarda en
 * localStorage por usuario (email). En Fase 2 esto es Customer.shipping_locations.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store/auth-context';
import type { SavedShippingLocation, ShippingCarrier } from '@/lib/data/types';
import styles from './ShippingLocations.module.css';

const KEY = 'ptr-shipping-locations';
type Store = Record<string, SavedShippingLocation[]>;

const CARRIERS: Array<{ value: ShippingCarrier; label: string }> = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'mrw', label: 'MRW' },
];
const CARRIER_LABEL: Record<ShippingCarrier, string> = { zoom: 'Zoom', mrw: 'MRW' };

function emptyDraft(): SavedShippingLocation {
  return { id: '', label: '', carrier: 'zoom', state: '', city: '', office: '', recipient: '', doc: '', notes: '' };
}

function readStore(): Store {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Store;
  } catch {
    return {};
  }
}

export function ShippingLocations() {
  const { user } = useAuth();
  const email = user?.email ?? '';
  const [list, setList] = useState<SavedShippingLocation[]>([]);
  const [draft, setDraft] = useState<SavedShippingLocation | null>(null);
  const [error, setError] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!email) {
      setHydrated(true);
      return;
    }
    setList(readStore()[email] ?? []);
    setHydrated(true);
  }, [email]);

  function persist(next: SavedShippingLocation[]) {
    setList(next);
    if (!email) return;
    try {
      const store = readStore();
      store[email] = next;
      window.localStorage.setItem(KEY, JSON.stringify(store));
    } catch {
      // sin almacenamiento
    }
  }

  function save() {
    if (!draft) return;
    if (!draft.label.trim()) return setError('Ponle un nombre (por ejemplo, Casa o Trabajo).');
    if (!draft.city.trim() || !draft.office.trim()) return setError('Indica al menos la ciudad y la oficina o casillero.');
    const rec: SavedShippingLocation = {
      id: draft.id || `loc-${Date.now()}`,
      label: draft.label.trim(),
      carrier: draft.carrier,
      state: draft.state.trim(),
      city: draft.city.trim(),
      office: draft.office.trim(),
      recipient: draft.recipient.trim(),
      doc: draft.doc.trim(),
      notes: draft.notes.trim(),
    };
    persist(draft.id ? list.map((l) => (l.id === draft.id ? rec : l)) : [...list, rec]);
    setDraft(null);
    setError('');
  }

  if (!hydrated) return null;

  return (
    <section className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>Mis direcciones de encomienda</h2>
          <p className={styles.hint}>
            Opcional. Guarda tu casillero o la oficina de Zoom/MRW más cercana para elegirla rápido al
            comprar. El flete se paga en destino al retirar.
          </p>
        </div>
        {!draft ? (
          <button type="button" className={styles.addBtn} onClick={() => { setDraft(emptyDraft()); setError(''); }}>
            Agregar dirección
          </button>
        ) : null}
      </div>

      {draft ? (
        <div className={styles.form}>
          <div className={styles.row}>
            <label className={styles.field}>
              <span>Nombre (alias)</span>
              <input className={styles.input} value={draft.label} placeholder="Casa, Trabajo…" onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
            </label>
            <label className={styles.field}>
              <span>Empresa</span>
              <select className={styles.select} value={draft.carrier} onChange={(e) => setDraft({ ...draft, carrier: e.target.value as ShippingCarrier })}>
                {CARRIERS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Estado</span>
              <input className={styles.input} value={draft.state} placeholder="Bolívar" onChange={(e) => setDraft({ ...draft, state: e.target.value })} />
            </label>
            <label className={styles.field}>
              <span>Ciudad</span>
              <input className={styles.input} value={draft.city} placeholder="Puerto Ordaz" onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
            </label>
          </div>

          <label className={styles.field}>
            <span>Oficina o casillero</span>
            <input className={styles.input} value={draft.office} placeholder="Oficina Alta Vista / Casillero N.º 000" onChange={(e) => setDraft({ ...draft, office: e.target.value })} />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Destinatario (quién retira)</span>
              <input className={styles.input} value={draft.recipient} placeholder="Nombre y apellido" onChange={(e) => setDraft({ ...draft, recipient: e.target.value })} />
            </label>
            <label className={styles.field}>
              <span>Cédula/RIF del destinatario</span>
              <input className={styles.input} value={draft.doc} placeholder="V-12345678" onChange={(e) => setDraft({ ...draft, doc: e.target.value })} />
            </label>
          </div>

          <label className={styles.field}>
            <span>Notas (opcional)</span>
            <input className={styles.input} value={draft.notes} placeholder="Referencias, horario de la oficina…" onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => { setDraft(null); setError(''); }}>Cancelar</button>
            <button type="button" className={styles.saveBtn} onClick={save}>Guardar dirección</button>
          </div>
        </div>
      ) : list.length === 0 ? (
        <p className={styles.empty}>Aún no guardaste ninguna dirección de encomienda.</p>
      ) : (
        <div className={styles.grid}>
          {list.map((l) => (
            <article key={l.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.cardLabel}>{l.label}</span>
                <span className={styles.carrier}>{CARRIER_LABEL[l.carrier]}</span>
              </div>
              <p className={styles.cardLine}>{l.office}</p>
              <p className={styles.cardLine}>{[l.city, l.state].filter(Boolean).join(', ')}</p>
              {l.recipient ? <p className={styles.cardLine}>Retira: {l.recipient}{l.doc ? ` · ${l.doc}` : ''}</p> : null}
              {l.notes ? <p className={styles.cardLine}>{l.notes}</p> : null}
              <div className={styles.cardActions}>
                <button type="button" className={styles.link} onClick={() => { setDraft(l); setError(''); }}>Editar</button>
                <button type="button" className={`${styles.link} ${styles.linkDanger}`} onClick={() => persist(list.filter((x) => x.id !== l.id))}>Eliminar</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

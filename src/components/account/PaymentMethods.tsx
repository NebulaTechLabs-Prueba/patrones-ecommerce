'use client';

/**
 * Métodos de pago guardados por el CLIENTE (opcional), para reusarlos al pagar.
 * Son SUS datos (Pago Móvil, transferencia, Zelle, USDT…). Nunca se guardan datos
 * de tarjeta (número/CVV): la tarjeta va por pasarela, por eso 'stripe' no está en
 * la lista. Fase 1: localStorage por usuario; en Fase 2 es Customer.payment_methods.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store/auth-context';
import type { PaymentMethodKind, SavedPaymentMethod } from '@/lib/data/types';
import { PAYMENT_METHOD_LABELS } from '@/lib/labels';
import styles from './ShippingLocations.module.css';

const KEY = 'ptr-payment-methods';
type Store = Record<string, SavedPaymentMethod[]>;

// Solo métodos con comprobante (offline). La tarjeta no se guarda acá.
const KINDS: PaymentMethodKind[] = ['pago_movil', 'transferencia', 'zelle', 'usdt', 'banesco_panama', 'divisa'];

function emptyDraft(): SavedPaymentMethod {
  return { id: '', label: '', kind: 'pago_movil', holder: '', doc: '', bank: '', phone: '', account: '', notes: '' };
}

function accountLabel(kind: PaymentMethodKind): string {
  if (kind === 'zelle') return 'Correo Zelle';
  if (kind === 'usdt') return 'Wallet (indica la red)';
  if (kind === 'transferencia' || kind === 'banesco_panama') return 'Número de cuenta';
  return 'Detalle';
}
function shows(kind: PaymentMethodKind) {
  return {
    bank: kind === 'pago_movil' || kind === 'transferencia' || kind === 'banesco_panama',
    phone: kind === 'pago_movil',
    account: kind !== 'pago_movil' && kind !== 'divisa',
    doc: kind === 'pago_movil' || kind === 'transferencia' || kind === 'banesco_panama',
  };
}

function readStore(): Store {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Store;
  } catch {
    return {};
  }
}

export function PaymentMethods() {
  const { user } = useAuth();
  const email = user?.email ?? '';
  const [list, setList] = useState<SavedPaymentMethod[]>([]);
  const [draft, setDraft] = useState<SavedPaymentMethod | null>(null);
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

  function persist(next: SavedPaymentMethod[]) {
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
    if (!draft.label.trim()) return setError('Ponle un nombre (por ejemplo, "Mi Pago Móvil").');
    if (!draft.holder.trim()) return setError('Indica el titular de la cuenta.');
    const rec: SavedPaymentMethod = {
      id: draft.id || `pm-${Date.now()}`,
      label: draft.label.trim(),
      kind: draft.kind,
      holder: draft.holder.trim(),
      doc: draft.doc.trim(),
      bank: draft.bank.trim(),
      phone: draft.phone.trim(),
      account: draft.account.trim(),
      notes: draft.notes.trim(),
    };
    persist(draft.id ? list.map((p) => (p.id === draft.id ? rec : p)) : [...list, rec]);
    setDraft(null);
    setError('');
  }

  if (!hydrated) return null;

  const f = draft ? shows(draft.kind) : shows('pago_movil');

  return (
    <section className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>Mis métodos de pago</h2>
          <p className={styles.hint}>
            Opcional. Guarda tus datos de pago (Pago Móvil, transferencia, Zelle…) para no escribirlos
            cada vez. No guardamos datos de tarjeta: esa se procesa por pasarela al pagar.
          </p>
        </div>
        {!draft ? (
          <button type="button" className={styles.addBtn} onClick={() => { setDraft(emptyDraft()); setError(''); }}>
            Agregar método
          </button>
        ) : null}
      </div>

      {draft ? (
        <div className={styles.form}>
          <div className={styles.row}>
            <label className={styles.field}>
              <span>Nombre (alias)</span>
              <input className={styles.input} value={draft.label} placeholder="Mi Pago Móvil" onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
            </label>
            <label className={styles.field}>
              <span>Método</span>
              <select className={styles.select} value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as PaymentMethodKind })}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>{PAYMENT_METHOD_LABELS[k]}</option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Titular</span>
              <input className={styles.input} value={draft.holder} placeholder="Nombre y apellido" onChange={(e) => setDraft({ ...draft, holder: e.target.value })} />
            </label>
            {f.doc ? (
              <label className={styles.field}>
                <span>Cédula/RIF del titular</span>
                <input className={styles.input} value={draft.doc} placeholder="V-12345678" onChange={(e) => setDraft({ ...draft, doc: e.target.value })} />
              </label>
            ) : null}
          </div>

          {f.bank || f.phone ? (
            <div className={styles.row}>
              {f.bank ? (
                <label className={styles.field}>
                  <span>Banco</span>
                  <input className={styles.input} value={draft.bank} placeholder="Banco" onChange={(e) => setDraft({ ...draft, bank: e.target.value })} />
                </label>
              ) : null}
              {f.phone ? (
                <label className={styles.field}>
                  <span>Teléfono</span>
                  <input className={styles.input} value={draft.phone} placeholder="0424 000 0000" onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                </label>
              ) : null}
            </div>
          ) : null}

          {f.account ? (
            <label className={styles.field}>
              <span>{accountLabel(draft.kind)}</span>
              <input className={styles.input} value={draft.account} onChange={(e) => setDraft({ ...draft, account: e.target.value })} />
            </label>
          ) : null}

          <label className={styles.field}>
            <span>Notas (opcional)</span>
            <input className={styles.input} value={draft.notes} placeholder="Referencias o aclaraciones" onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => { setDraft(null); setError(''); }}>Cancelar</button>
            <button type="button" className={styles.saveBtn} onClick={save}>Guardar método</button>
          </div>
        </div>
      ) : list.length === 0 ? (
        <p className={styles.empty}>Aún no guardaste ningún método de pago.</p>
      ) : (
        <div className={styles.grid}>
          {list.map((p) => (
            <article key={p.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.cardLabel}>{p.label}</span>
                <span className={styles.carrier}>{PAYMENT_METHOD_LABELS[p.kind]}</span>
              </div>
              <p className={styles.cardLine}>{p.holder}{p.doc ? ` · ${p.doc}` : ''}</p>
              {p.bank ? <p className={styles.cardLine}>{p.bank}</p> : null}
              {p.phone ? <p className={styles.cardLine}>{p.phone}</p> : null}
              {p.account ? <p className={styles.cardLine}>{accountLabel(p.kind)}: {p.account}</p> : null}
              {p.notes ? <p className={styles.cardLine}>{p.notes}</p> : null}
              <div className={styles.cardActions}>
                <button type="button" className={styles.link} onClick={() => { setDraft(p); setError(''); }}>Editar</button>
                <button type="button" className={`${styles.link} ${styles.linkDanger}`} onClick={() => persist(list.filter((x) => x.id !== p.id))}>Eliminar</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

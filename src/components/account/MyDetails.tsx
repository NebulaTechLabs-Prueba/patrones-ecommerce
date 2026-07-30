'use client';

/**
 * "Mis datos": el propio cliente ve y EDITA su información (el admin solo la ve).
 * Fase 1: la fuente es el perfil editado (localStorage), la cuenta creada, o —para
 * la cuenta demo— el cliente sembrado que llega como fallback del server. Guarda con
 * validación de cédula/RIF. En Fase 2 esto escribe el Customer real.
 */

import { useEffect, useState } from 'react';
import { useAuth, readStoredProfile, type StoredAccount } from '@/lib/store/auth-context';
import { isInstitutionDoc } from '@/lib/domains/identity/identity';
import type { IdentityDocKind } from '@/lib/data/types';
import styles from './MyDetails.module.css';

export interface DetailsData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  docKind: IdentityDocKind;
  /** Solo dígitos. */
  docNumber: string;
}

const DOC_KINDS: Array<{ value: IdentityDocKind; label: string }> = [
  { value: 'V', label: 'V — Cédula' },
  { value: 'E', label: 'E — Cédula (extranjero)' },
  { value: 'J', label: 'J — RIF (empresa)' },
  { value: 'G', label: 'G — RIF (gobierno)' },
  { value: 'P', label: 'P — RIF (pasaporte)' },
];

export function MyDetails({ fallback }: { fallback: DetailsData }) {
  const { user, updateProfile } = useAuth();
  const email = user?.email ?? fallback.email;

  const [data, setData] = useState<DetailsData>(fallback);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  // Borrador del formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [docKind, setDocKind] = useState<IdentityDocKind>('V');
  const [docNumber, setDocNumber] = useState('');

  useEffect(() => {
    const prof = email ? readStoredProfile(email) : null;
    if (prof) {
      setData({ firstName: prof.firstName, lastName: prof.lastName, email, phone: prof.phone, docKind: prof.docKind, docNumber: prof.docNumber });
      return;
    }
    try {
      const accounts = JSON.parse(window.localStorage.getItem('ptr-accounts') ?? '[]') as StoredAccount[];
      const acc = accounts.find((a) => a.email === email);
      if (acc) {
        setData({ firstName: acc.firstName, lastName: acc.lastName, email, phone: acc.phone, docKind: acc.docKind, docNumber: acc.docNumber.replace(/\D/g, '') });
        return;
      }
    } catch {
      // sin almacenamiento
    }
    setData(fallback);
  }, [email, fallback]);

  function startEdit() {
    setFirstName(data.firstName);
    setLastName(data.lastName);
    setPhone(data.phone);
    setDocKind(data.docKind);
    setDocNumber(data.docNumber);
    setError('');
    setEditing(true);
  }

  function save() {
    const res = updateProfile({ firstName, lastName, phone, docKind, docNumber });
    if (!res.ok) {
      setError(res.error ?? 'No se pudieron guardar los datos.');
      return;
    }
    setData({ firstName: firstName.trim(), lastName: lastName.trim(), email, phone: phone.trim(), docKind, docNumber: docNumber.replace(/\D/g, '') });
    setEditing(false);
    setError('');
  }

  const rows: Array<{ label: string; value: string }> = [
    { label: 'Nombre', value: `${data.firstName} ${data.lastName}`.trim() || '—' },
    { label: 'Correo', value: data.email },
    { label: 'Teléfono', value: data.phone || '—' },
    { label: 'Documento', value: data.docNumber ? `${data.docKind}-${data.docNumber}` : '—' },
    { label: 'Tipo', value: isInstitutionDoc(data.docKind) ? 'Institución' : 'Individual' },
  ];

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.title}>Mis datos</h2>
        {!editing ? (
          <button type="button" className={styles.editBtn} onClick={startEdit}>Editar</button>
        ) : null}
      </div>

      {editing ? (
        <div className={styles.form}>
          <div className={styles.formRow}>
            <label className={styles.field}>
              <span>Nombre</span>
              <input className={styles.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
            </label>
            <label className={styles.field}>
              <span>Apellido</span>
              <input className={styles.input} value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
            </label>
          </div>

          <label className={styles.field}>
            <span>Correo (no editable)</span>
            <input className={styles.input} value={email} disabled />
          </label>

          <label className={styles.field}>
            <span>Teléfono</span>
            <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="0424 000 0000" />
          </label>

          <div className={styles.formRow}>
            <label className={styles.field} style={{ flex: '0 0 auto', minWidth: 150 }}>
              <span>Documento</span>
              <select className={styles.select} value={docKind} onChange={(e) => setDocKind(e.target.value as IdentityDocKind)}>
                {DOC_KINDS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Número</span>
              <input className={styles.input} value={docNumber} onChange={(e) => setDocNumber(e.target.value)} inputMode="numeric" placeholder="Solo dígitos" />
            </label>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => { setEditing(false); setError(''); }}>Cancelar</button>
            <button type="button" className={styles.saveBtn} onClick={save}>Guardar cambios</button>
          </div>
        </div>
      ) : (
        <>
          <dl className={styles.list}>
            {rows.map((r) => (
              <div key={r.label} className={styles.row}>
                <dt className={styles.label}>{r.label}</dt>
                <dd className={styles.value}>{r.value}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.note}>Puedes actualizar tus datos cuando quieras. El correo no cambia.</p>
        </>
      )}
    </section>
  );
}

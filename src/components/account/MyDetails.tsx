'use client';

/**
 * "Mis datos" del cliente. Fase 1: muestra los datos de la cuenta creada por el
 * visitante (localStorage ptr-accounts) o, para la cuenta demo, los del cliente
 * sembrado que llega como fallback desde el server. En Fase 2 sale del Customer real.
 */

import { useEffect, useState } from 'react';
import { useAuth, type StoredAccount } from '@/lib/store/auth-context';
import { isInstitutionDoc } from '@/lib/domains/identity/identity';
import styles from './MyDetails.module.css';

export interface DetailsData {
  name: string;
  email: string;
  phone: string;
  doc: string;
  institution: boolean;
}

export function MyDetails({ fallback }: { fallback: DetailsData }) {
  const { user } = useAuth();
  const [data, setData] = useState<DetailsData | null>(null);

  useEffect(() => {
    const email = user?.email ?? '';
    try {
      const accounts = JSON.parse(window.localStorage.getItem('ptr-accounts') ?? '[]') as StoredAccount[];
      const acc = accounts.find((a) => a.email === email);
      if (acc) {
        setData({
          name: acc.name,
          email: acc.email,
          phone: acc.phone,
          doc: acc.docNumber,
          institution: isInstitutionDoc(acc.docKind),
        });
        return;
      }
    } catch {
      // sin almacenamiento
    }
    setData(fallback);
  }, [user, fallback]);

  const d = data ?? fallback;
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Nombre', value: d.name },
    { label: 'Correo', value: d.email },
    { label: 'Teléfono', value: d.phone || '—' },
    { label: 'Documento', value: d.doc || '—' },
    { label: 'Tipo', value: d.institution ? 'Institución' : 'Individual' },
  ];

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Mis datos</h2>
      <dl className={styles.list}>
        {rows.map((r) => (
          <div key={r.label} className={styles.row}>
            <dt className={styles.label}>{r.label}</dt>
            <dd className={styles.value}>{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.note}>
        Estos datos se usan para procesar tus pedidos y emitir la nota de entrega. Para cambiarlos,
        escríbenos por WhatsApp.
      </p>
    </section>
  );
}

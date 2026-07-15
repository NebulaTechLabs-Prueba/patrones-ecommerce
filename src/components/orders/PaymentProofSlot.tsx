/**
 * Comprobante de pago (§10). Espacio donde vive la imagen/PDF que el cliente carga
 * y el admin revisa para aprobar o rechazar. Solo para métodos offline.
 */

import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import type { PaymentMethodKind, PaymentProof } from '@/lib/data/types';
import styles from './PaymentProofSlot.module.css';

function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export function PaymentProofSlot({
  proof,
  method,
}: {
  proof: PaymentProof | null | undefined;
  method: PaymentMethodKind;
}) {
  // El pago con tarjeta no lleva comprobante.
  if (method === 'stripe') return null;

  return (
    <section className={styles.wrap}>
      <h2 className={styles.title}>Comprobante de pago</h2>

      {proof ? (
        <div className={styles.slot}>
          <div className={styles.media}>
            {proof.kind === 'image' ? (
              <PlaceholderImage image={null} label="Comprobante" ratio="4 / 3" compact />
            ) : (
              <div className={styles.pdf} role="img" aria-label="Comprobante en PDF">
                <span className={styles.pdfBadge}>PDF</span>
                <span className={styles.pdfName}>comprobante.pdf</span>
              </div>
            )}
          </div>
          <div className={styles.info}>
            <p className={styles.ref}>Referencia {proof.reference}</p>
            <p className={styles.date}>Cargado el {formatDate(proof.uploaded_at)}</p>
          </div>
        </div>
      ) : (
        <p className={styles.empty}>El cliente aún no cargó el comprobante.</p>
      )}
    </section>
  );
}

'use client';

/**
 * Comprobante de pago (§10). Espacio donde vive la imagen/PDF que el cliente carga
 * y el admin revisa para aprobar o rechazar. Solo para métodos offline.
 * El admin puede AMPLIAR (visor en sitio), DESCARGAR o abrir en otra pestaña.
 */

import { useState } from 'react';
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
  const [zoom, setZoom] = useState(false);

  // El pago con tarjeta no lleva comprobante.
  if (method === 'stripe') return null;

  const isImage = proof?.kind === 'image';
  const hasUrl = Boolean(proof?.url);

  return (
    <section className={styles.wrap}>
      <h2 className={styles.title}>Comprobante de pago</h2>

      {proof ? (
        <div className={styles.slot}>
          <button
            type="button"
            className={styles.media}
            onClick={() => isImage && setZoom(true)}
            disabled={!isImage}
            aria-label={isImage ? 'Ampliar comprobante' : 'Comprobante en PDF'}
          >
            {isImage ? (
              <PlaceholderImage
                image={hasUrl ? { url: proof.url, alt: 'Comprobante', is_placeholder: false, sort_order: 0 } : null}
                label="Comprobante"
                ratio="4 / 3"
                compact
              />
            ) : (
              <div className={styles.pdf} role="img" aria-label="Comprobante en PDF">
                <span className={styles.pdfBadge}>PDF</span>
                <span className={styles.pdfName}>comprobante.pdf</span>
              </div>
            )}
          </button>

          <div className={styles.info}>
            <p className={styles.ref}>Referencia {proof.reference}</p>
            <p className={styles.date}>Cargado el {formatDate(proof.uploaded_at)}</p>

            <div className={styles.actions}>
              {isImage ? (
                <button type="button" className={styles.action} onClick={() => setZoom(true)}>
                  Ampliar
                </button>
              ) : null}
              {hasUrl ? (
                <>
                  <a className={styles.action} href={proof.url} target="_blank" rel="noopener noreferrer">
                    Abrir en pestaña
                  </a>
                  <a
                    className={styles.action}
                    href={proof.url}
                    download={`comprobante-${proof.reference}`}
                  >
                    Descargar
                  </a>
                </>
              ) : (
                <span className={styles.noFile}>Archivo no disponible en la demo</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className={styles.empty}>El cliente aún no cargó el comprobante.</p>
      )}

      {zoom && isImage ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Comprobante ampliado"
          onClick={() => setZoom(false)}
        >
          <button type="button" className={styles.lightboxClose} aria-label="Cerrar">
            ✕
          </button>
          <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
            {hasUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={proof!.url} alt="Comprobante ampliado" className={styles.lightboxImg} />
            ) : (
              <div className={styles.lightboxPlaceholder}>
                Sin archivo cargado en la demo. En producción se vería el comprobante real acá.
              </div>
            )}
            {hasUrl ? (
              <a className={styles.action} href={proof!.url} download={`comprobante-${proof!.reference}`}>
                Descargar
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

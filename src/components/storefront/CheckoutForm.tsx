'use client';

/**
 * CheckoutForm (demo, Fase 1). Ejercita el modelo puro sin backend:
 *  - identity: valida cedula/RIF y deriva tipo de comprador (§8).
 *  - shipping: cotiza el metodo (Zoom/MRW $0 cobro a destino, pickup, delivery) (§13.3).
 *  - pricing/currency: resumen con promos apiladas en la moneda elegida (§11, §13.2).
 *  - §13.5: aceptacion explicita de no-devolucion antes de confirmar.
 * Al confirmar NO crea orden ni cobra: muestra una confirmacion marcada como demo.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { IdentityDocKind, PaymentMethod, ShippingMethod } from '@/lib/data/types';
import { isInstitutionDoc, validateDocument } from '@/lib/domains/identity/identity';
import { quoteShipping } from '@/lib/domains/shipping/shipping';
import { useCart } from '@/lib/store/cart-context';
import { useCurrency } from '@/lib/store/currency-context';
import styles from './CheckoutForm.module.css';

interface CheckoutFormProps {
  paymentMethods: PaymentMethod[];
}

const DOC_KINDS: IdentityDocKind[] = ['V', 'E', 'J', 'G', 'P'];

const SHIPPING_OPTIONS: Array<{ method: ShippingMethod; label: string; note: string }> = [
  { method: 'pickup', label: 'Retiro en tienda', note: 'C.C. Costa Granada, Puerto Ordaz. Sin costo.' },
  { method: 'zoom', label: 'Zoom', note: 'Flete pagado en destino al retirar. Informá la oficina.' },
  { method: 'mrw', label: 'MRW', note: 'Flete pagado en destino al retirar. Informá la oficina.' },
  { method: 'delivery_local', label: 'Delivery local', note: 'Tarifa a acordar. Simulado en la demo.' },
];

export function CheckoutForm({ paymentMethods }: CheckoutFormProps) {
  const { items, hydrated, summary, clear } = useCart();
  const { formatCents } = useCurrency();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [docKind, setDocKind] = useState<IdentityDocKind>('V');
  const [docNumber, setDocNumber] = useState('');

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | ''>('');
  const [officeState, setOfficeState] = useState('');
  const [officeCity, setOfficeCity] = useState('');
  const [officeName, setOfficeName] = useState('');

  const [paymentKind, setPaymentKind] = useState('');
  const [acceptNoReturns, setAcceptNoReturns] = useState('');

  const [attempted, setAttempted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const docValidation = useMemo(
    () => (docNumber.trim() ? validateDocument(docKind, docNumber) : null),
    [docKind, docNumber],
  );

  const shippingQuote = shippingMethod ? quoteShipping(shippingMethod) : null;
  const shippingCost = shippingQuote?.costCents ?? 0;
  const selectedPayment = paymentMethods.find((m) => m.kind === paymentKind) ?? null;
  const totalWithShipping = summary.totalCents + shippingCost;

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const officeOk = !shippingQuote?.requiresOffice || (officeState && officeCity && officeName);

  const canConfirm =
    items.length > 0 &&
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    emailValid &&
    phone.trim() !== '' &&
    address.trim() !== '' &&
    docValidation?.valid === true &&
    shippingMethod !== '' &&
    Boolean(officeOk) &&
    paymentKind !== '' &&
    acceptNoReturns === 'yes';

  function handleConfirm() {
    setAttempted(true);
    if (canConfirm) setConfirmed(true);
  }

  if (!hydrated) {
    return (
      <main className={styles.main}>
        <p className={styles.muted} aria-live="polite">
          Cargando…
        </p>
      </main>
    );
  }

  if (confirmed) {
    return (
      <main className={styles.main}>
        <div className={styles.confirmation}>
          <p className={styles.demoTag}>Demo</p>
          <h1 className={styles.title}>Recibimos tu pedido</h1>
          <p className={styles.muted}>
            Esta es una demostración: no se registró una orden ni se procesó ningún pago.
            En producción, acá confirmarías tu cuenta, cargarías el comprobante (si el pago
            es offline) y verías el estado de tu pago en todo momento.
          </p>
          <p className={styles.summaryLine}>
            Total del pedido: <strong>{formatCents(totalWithShipping)}</strong>
          </p>
          <Link href="/" className={styles.primary} onClick={() => clear()}>
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className={styles.main}>
        <h1 className={styles.title}>Checkout</h1>
        <p className={styles.muted}>Tu carrito está vacío.</p>
        <Link href="/" className={styles.primary}>
          Ver productos
        </Link>
      </main>
    );
  }

  const customerType = isInstitutionDoc(docKind) ? 'Institución' : 'Individual';

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Checkout</h1>

      <div className={styles.layout}>
        <div className={styles.form}>
          {/* Datos del cliente */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tus datos</h2>
            <div className={styles.grid2}>
              <label className={styles.field}>
                <span>Nombre</span>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span>Apellido</span>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={attempted && !emailValid}
                />
              </label>
              <label className={styles.field}>
                <span>Teléfono</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span>Dirección</span>
                <input value={address} onChange={(e) => setAddress(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span>Documento</span>
                <div className={styles.docRow}>
                  <select
                    value={docKind}
                    onChange={(e) => setDocKind(e.target.value as IdentityDocKind)}
                    aria-label="Tipo de documento"
                  >
                    {DOC_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                  <input
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="12345678"
                    aria-invalid={docValidation !== null && !docValidation.valid}
                    aria-describedby="doc-help"
                  />
                </div>
              </label>
              <div className={styles.field}>
                <span>Tipo de comprador</span>
                <p className={styles.derived}>{customerType}</p>
              </div>
            </div>
            <p id="doc-help" className={styles.help} aria-live="polite">
              {docValidation && !docValidation.valid
                ? docValidation.reason
                : docValidation?.valid
                  ? 'Documento válido.'
                  : 'Cédula (V/E) o RIF (J/G/P).'}
            </p>
          </section>

          {/* Envio */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Envío</h2>
            <div className={styles.options}>
              {SHIPPING_OPTIONS.map((opt) => (
                <label key={opt.method} className={styles.option}>
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === opt.method}
                    onChange={() => setShippingMethod(opt.method)}
                  />
                  <span className={styles.optionBody}>
                    <span className={styles.optionLabel}>{opt.label}</span>
                    <span className={styles.optionNote}>{opt.note}</span>
                  </span>
                  <span className={styles.optionCost}>
                    {formatCents(quoteShipping(opt.method).costCents)}
                  </span>
                </label>
              ))}
            </div>
            {shippingQuote?.requiresOffice ? (
              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span>Estado</span>
                  <input value={officeState} onChange={(e) => setOfficeState(e.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Ciudad</span>
                  <input value={officeCity} onChange={(e) => setOfficeCity(e.target.value)} />
                </label>
                <label className={`${styles.field} ${styles.full}`}>
                  <span>Oficina de destino</span>
                  <input value={officeName} onChange={(e) => setOfficeName(e.target.value)} />
                </label>
                <p className={`${styles.help} ${styles.full}`}>
                  El flete lo pagás al retirar en destino; el checkout no lo cobra.
                </p>
              </div>
            ) : null}
          </section>

          {/* Pago */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Pago</h2>
            <div className={styles.options}>
              {paymentMethods.map((m) => (
                <label key={m.id} className={styles.option}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentKind === m.kind}
                    onChange={() => setPaymentKind(m.kind)}
                  />
                  <span className={styles.optionBody}>
                    <span className={styles.optionLabel}>{m.label}</span>
                    <span className={styles.optionNote}>
                      {m.is_offline
                        ? 'Cargás el comprobante y verificamos el pago antes de confirmar.'
                        : 'Pago con tarjeta (redirección segura en producción).'}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {selectedPayment?.is_offline ? (
              <p className={styles.help}>
                Datos de la cuenta receptora demostrativos: se muestran los reales tras el
                lanzamiento. Tu pago queda en verificación hasta que lo aprobemos.
              </p>
            ) : null}
          </section>
        </div>

        {/* Resumen */}
        <aside className={styles.summary} aria-label="Resumen del pedido">
          <h2 className={styles.summaryTitle}>Tu pedido</h2>
          <ul className={styles.summaryItems}>
            {items.map((i) => (
              <li key={i.variantSku}>
                <span>
                  {i.quantity}× {i.productName}
                </span>
              </li>
            ))}
          </ul>
          <dl className={styles.summaryRows}>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatCents(summary.subtotalCents)}</dd>
            </div>
            {summary.discountCents > 0 ? (
              <div className={styles.discount}>
                <dt>Descuentos</dt>
                <dd>−{formatCents(summary.discountCents)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Envío</dt>
              <dd>
                {shippingQuote?.paidAtDestination ? 'Cobro a destino' : formatCents(shippingCost)}
              </dd>
            </div>
            <div className={styles.total}>
              <dt>Total</dt>
              <dd>{formatCents(totalWithShipping)}</dd>
            </div>
          </dl>

          <label className={styles.accept}>
            <input
              type="checkbox"
              checked={acceptNoReturns === 'yes'}
              onChange={(e) => setAcceptNoReturns(e.target.checked ? 'yes' : '')}
            />
            <span>
              He leído y acepto los Términos y Condiciones, incluida la política de no
              devolución.
            </span>
          </label>

          <button type="button" className={styles.primary} onClick={handleConfirm}>
            Confirmar pedido
          </button>
          {attempted && !canConfirm ? (
            <p className={styles.error} aria-live="polite">
              Revisá los datos, el envío, el pago y la aceptación antes de confirmar.
            </p>
          ) : null}
        </aside>
      </div>
    </main>
  );
}

'use client';

/**
 * CheckoutForm (demo, Fase 1). Ejercita el modelo puro sin backend:
 *  - identity: valida cedula/RIF y deriva tipo de comprador (§8).
 *  - shipping: cotiza el metodo (Zoom/MRW $0 cobro a destino, pickup, delivery) (§13.3).
 *  - pricing/currency: resumen con promos apiladas en la moneda elegida (§11, §13.2).
 *  - §13.5: aceptacion explicita de no-devolucion antes de confirmar.
 * Al confirmar NO crea orden ni cobra: muestra una confirmacion marcada como demo.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type {
  IdentityDocKind,
  PaymentMethod,
  SavedPaymentMethod,
  SavedShippingLocation,
  ShippingMethod,
} from '@/lib/data/types';
import { validateDocument } from '@/lib/domains/identity/identity';
import { quoteShipping } from '@/lib/domains/shipping/shipping';
import { useAuth, readStoredProfile, type StoredAccount } from '@/lib/store/auth-context';
import { useCart } from '@/lib/store/cart-context';
import { useCurrency } from '@/lib/store/currency-context';
import { PAYMENT_METHOD_LABELS } from '@/lib/labels';
import styles from './CheckoutForm.module.css';

export interface CustomerPrefill {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  docKind: IdentityDocKind;
  docNumber: string;
  address: string;
}

interface CheckoutFormProps {
  paymentMethods: PaymentMethod[];
  customerFallback?: CustomerPrefill | null;
}

function readByEmail<T>(key: string, email: string): T[] {
  if (!email) return [];
  try {
    const map = JSON.parse(window.localStorage.getItem(key) ?? '{}') as Record<string, T[]>;
    return map[email] ?? [];
  } catch {
    return [];
  }
}

const DOC_KINDS: IdentityDocKind[] = ['V', 'E', 'J', 'G', 'P'];

const SHIPPING_OPTIONS: Array<{ method: ShippingMethod; label: string; note: string }> = [
  { method: 'pickup', label: 'Retiro en tienda', note: 'C.C. Costa Granada. Sin costo.' },
  { method: 'zoom', label: 'Zoom', note: 'Flete pagado en destino al retirar. Informa la oficina.' },
  { method: 'mrw', label: 'MRW', note: 'Flete pagado en destino al retirar. Informa la oficina.' },
  { method: 'delivery_local', label: 'Delivery local', note: 'Tarifa a acordar. Simulado en la demo.' },
];

export function CheckoutForm({ paymentMethods, customerFallback }: CheckoutFormProps) {
  const { items, hydrated, summary, clear } = useCart();
  const { formatCents } = useCurrency();
  const { user } = useAuth();

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

  // Datos guardados del cliente (agilizan el checkout): casilleros y métodos de pago.
  const [savedShip, setSavedShip] = useState<SavedShippingLocation[]>([]);
  const [savedPay, setSavedPay] = useState<SavedPaymentMethod[]>([]);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    const em = user?.email ?? '';
    setSavedShip(readByEmail<SavedShippingLocation>('ptr-shipping-locations', em));
    setSavedPay(readByEmail<SavedPaymentMethod>('ptr-payment-methods', em));

    if (prefilled) return;
    // Solo se prellena si hay sesión iniciada (dato del propio cliente).
    if (!em) {
      setPrefilled(true);
      return;
    }
    // Prellenado de "Tus datos": perfil editado -> cuenta creada -> cliente demo.
    const prof = readStoredProfile(em);
    let base: CustomerPrefill | null = null;
    if (prof) {
      base = { firstName: prof.firstName, lastName: prof.lastName, email: em, phone: prof.phone, docKind: prof.docKind, docNumber: prof.docNumber, address: '' };
    } else {
      try {
        const accounts = JSON.parse(window.localStorage.getItem('ptr-accounts') ?? '[]') as StoredAccount[];
        const found = accounts.find((a) => a.email === em);
        if (found) base = { firstName: found.firstName, lastName: found.lastName, email: em, phone: found.phone, docKind: found.docKind, docNumber: found.docNumber.replace(/\D/g, ''), address: '' };
      } catch {
        // sin almacenamiento
      }
    }
    if (!base && customerFallback) base = { ...customerFallback, email: em || customerFallback.email };
    if (base) {
      setFirstName(base.firstName);
      setLastName(base.lastName);
      setEmail(base.email);
      setPhone(base.phone);
      setDocKind(base.docKind);
      setDocNumber(base.docNumber);
      if (base.address) setAddress(base.address);
    }
    setPrefilled(true);
  }, [user, customerFallback, prefilled]);

  function applySavedLocation(loc: SavedShippingLocation) {
    setShippingMethod(loc.carrier);
    setOfficeState(loc.state);
    setOfficeCity(loc.city);
    setOfficeName(loc.office);
  }

  // Etiqueta honesta de tarifa: gratis, cobro a destino, o a consultar (sin fingir $0).
  function shippingLabel(method: ShippingMethod): string {
    const q = quoteShipping(method);
    if (q.paidAtDestination) return 'Cobro a destino';
    if (method === 'delivery_local') return 'A consultar';
    if (q.costCents === 0) return 'Gratis';
    return formatCents(q.costCents);
  }

  const [attempted, setAttempted] = useState(false);
  // Fases: 'form' (datos) -> 'pay' (offline: datos de la empresa + comprobante) -> 'done'.
  const [phase, setPhase] = useState<'form' | 'pay' | 'done'>('form');
  const [reference, setReference] = useState('');
  const [proofName, setProofName] = useState('');

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

  const isOnlinePay = selectedPayment !== null && !selectedPayment.is_offline;
  const proofReady = reference.trim() !== '' || proofName !== '';

  function handleConfirm() {
    setAttempted(true);
    if (!canConfirm) return;
    // Online (tarjeta): se aprueba en segundos. Offline: pasa a cargar el comprobante.
    setPhase(isOnlinePay ? 'done' : 'pay');
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

  // Fase de pago offline: datos de la empresa + referencia + comprobante, sin esperas.
  if (phase === 'pay') {
    return (
      <main className={styles.main}>
        <div className={styles.payWrap}>
          <h1 className={styles.title}>Completá tu pago</h1>
          <p className={styles.muted}>
            Paga con <strong>{selectedPayment?.label}</strong> a los datos de abajo y carga tu
            comprobante. Tu pago queda en verificación hasta que lo aprobemos.
          </p>

          <div className={styles.payBox}>
            <p className={styles.payBoxTitle}>Datos para el pago</p>
            <pre className={styles.payData}>
              {selectedPayment?.instructions?.trim()
                ? selectedPayment.instructions
                : 'Te enviaremos los datos de pago por WhatsApp para completar tu pedido.'}
            </pre>
            <p className={styles.payAmount}>
              Monto a pagar: <strong>{formatCents(totalWithShipping)}</strong>
            </p>
          </div>

          <label className={styles.field}>
            <span>Referencia / número de la operación</span>
            <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ej. 000123456789" />
          </label>
          <label className={styles.field}>
            <span>Comprobante (imagen o PDF)</span>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setProofName(e.target.files?.[0]?.name ?? '')} />
            {proofName ? <span className={styles.help}>Cargado: {proofName}</span> : null}
          </label>

          <button type="button" className={styles.primary} disabled={!proofReady} onClick={() => setPhase('done')}>
            Enviar comprobante
          </button>
          {!proofReady ? (
            <p className={styles.help}>Ingresa la referencia o carga el comprobante para enviar.</p>
          ) : null}
        </div>
      </main>
    );
  }

  if (phase === 'done') {
    return (
      <main className={styles.main}>
        <div className={styles.confirmation}>
          <h1 className={styles.title}>{isOnlinePay ? 'Pago aprobado' : 'Comprobante recibido'}</h1>
          <p className={styles.muted}>
            {isOnlinePay
              ? 'Tu pago se aprobó y tu pedido quedó confirmado. Puedes seguir el estado desde tu cuenta.'
              : 'Recibimos tu comprobante. Tu pago queda en verificación y te avisamos al aprobarlo. Puedes seguir el estado desde tu cuenta.'}
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
            {savedShip.length > 0 ? (
              <div className={styles.saved}>
                <span className={styles.savedLabel}>Usar una dirección guardada:</span>
                <div className={styles.savedChips}>
                  {savedShip.map((l) => (
                    <button key={l.id} type="button" className={styles.savedChip} onClick={() => applySavedLocation(l)}>
                      {l.label} · {l.carrier === 'zoom' ? 'Zoom' : 'MRW'}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
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
                    {shippingLabel(opt.method)}
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
                  El flete lo pagas al retirar en destino; el checkout no lo cobra.
                </p>
              </div>
            ) : null}
          </section>

          {/* Pago */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Pago</h2>
            {savedPay.some((p) => paymentMethods.some((m) => m.kind === p.kind)) ? (
              <div className={styles.saved}>
                <span className={styles.savedLabel}>Tus métodos guardados:</span>
                <div className={styles.savedChips}>
                  {savedPay
                    .filter((p) => paymentMethods.some((m) => m.kind === p.kind))
                    .map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`${styles.savedChip} ${paymentKind === p.kind ? styles.savedChipOn : ''}`}
                        onClick={() => setPaymentKind(p.kind)}
                      >
                        {p.label} · {PAYMENT_METHOD_LABELS[p.kind]}
                      </button>
                    ))}
                </div>
              </div>
            ) : null}
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
                        ? 'Cargas el comprobante y verificamos el pago antes de confirmar.'
                        : 'Pago con tarjeta.'}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {selectedPayment?.is_offline ? (
              <p className={styles.help}>
                Al confirmar te mostramos los datos de la cuenta y cargas el comprobante. Tu
                pago queda en verificación hasta que lo aprobemos.
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
              <dd>{shippingMethod ? shippingLabel(shippingMethod) : '—'}</dd>
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
              He leído y acepto los{' '}
              <a href="/terminos/" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
                Términos y Condiciones
              </a>
              , incluida la política de no devolución.
            </span>
          </label>

          <button type="button" className={styles.primary} onClick={handleConfirm}>
            {isOnlinePay ? 'Pagar ahora' : 'Continuar al pago'}
          </button>
          {attempted && !canConfirm ? (
            <p className={styles.error} aria-live="polite">
              Revisa los datos, el envío, el pago y la aceptación antes de confirmar.
            </p>
          ) : null}
        </aside>
      </div>
    </main>
  );
}

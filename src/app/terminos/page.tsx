/**
 * Términos y Condiciones. Recoge las condiciones comerciales de PATRONES (cuenta,
 * precios y moneda, pagos, nota de entrega, envíos, devoluciones, disponibilidad).
 */

import type { Metadata } from 'next';
import styles from './legal.module.css';

export const metadata: Metadata = {
  title: 'Términos y Condiciones — PATRONES',
  description: 'Condiciones de compra en PATRONES: pagos, envíos, nota de entrega y devoluciones.',
};

export default function TermsPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Legal</p>
        <h1 className={styles.title}>Términos y Condiciones</h1>
        <p className={styles.lead}>
          Al realizar una compra en PATRONES aceptás las condiciones que se detallan a
          continuación.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.h2}>Cuenta y compra</h2>
        <p className={styles.p}>
          Para comprar es necesario crear una cuenta o iniciar sesión. Navegar y armar el carrito
          no requiere registro; los datos de la cuenta (incluida la cédula o el RIF) se solicitan
          al iniciar la compra y se usan para procesar y dar seguimiento al pedido.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Precios y moneda</h2>
        <p className={styles.p}>
          Los precios se expresan en dólares estadounidenses y son precios finales: no se agregan
          impuestos. Los montos en bolívares son referenciales, calculados a la tasa oficial del
          BCV al momento de la operación. El monto de cada pedido queda fijado al confirmar la
          compra.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Pagos</h2>
        <p className={styles.p}>
          Aceptamos pagos con tarjeta y métodos con comprobante (Pago Móvil, transferencia y
          otros). En los métodos con comprobante, el cliente carga el soporte y la referencia, y
          el pedido queda en verificación hasta que confirmemos el pago. El estado del pago está
          siempre visible en tu cuenta.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Nota de entrega</h2>
        <p className={styles.p}>
          Las compras se documentan con una nota de entrega, que es un documento comercial —no una
          factura fiscal— emitido bajo conformidad y acuerdo de ambas partes.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Envíos</h2>
        <p className={styles.p}>
          Ofrecemos retiro en tienda, envío por Zoom y MRW, y delivery local. En Zoom y MRW el
          flete se paga en destino al retirar; el checkout lo informa y no lo cobra. El costo y las
          condiciones de cada método se muestran antes de confirmar.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Devoluciones</h2>
        <p className={styles.p}>
          PATRONES no acepta devoluciones. Por eso te acompañamos antes de comprar con tablas de
          medidas y atención por WhatsApp. La aceptación de esta condición se solicita de forma
          explícita antes de pagar.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Disponibilidad</h2>
        <p className={styles.p}>
          Solo mostramos prendas con existencia disponible. Un producto sin stock no aparece en el
          catálogo; podés guardarlo en tu lista de deseados y te avisamos cuando vuelva.
        </p>
      </section>
    </main>
  );
}

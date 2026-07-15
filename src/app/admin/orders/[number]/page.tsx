/**
 * Admin - Detalle de una orden, con los datos del cliente. Export estático: se
 * generan las páginas de cada número de orden.
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderDetail } from '@/components/orders/OrderDetail';
import { customerRepo, orderRepo } from '@/lib/data';
import ui from '@/components/admin/adminUI.module.css';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ number: string }>;
}

export async function generateStaticParams() {
  const orders = await orderRepo.listOrders();
  return orders.map((o) => ({ number: o.number }));
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { number } = await params;
  const order = await orderRepo.getOrderByNumber(number);
  if (!order) notFound();

  const customer = await customerRepo.getCustomerById(order.customer_id);

  return (
    <div>
      <Link href="/admin/orders/" className={styles.back}>
        ← Volver a órdenes
      </Link>
      <h1 className={ui.pageTitle}>Orden {order.number}</h1>

      {customer ? (
        <div className={styles.customer}>
          <div>
            <span className={styles.label}>Cliente</span>
            <span className={styles.value}>
              {customer.first_name} {customer.last_name}
              {customer.customer_type === 'institucion' ? (
                <span className={`${ui.badge} ${ui.warning}`}> Institución</span>
              ) : null}
            </span>
          </div>
          <div>
            <span className={styles.label}>Documento</span>
            <span className={styles.value}>
              {customer.doc_kind}-{customer.doc_number}
            </span>
          </div>
          <div>
            <span className={styles.label}>Contacto</span>
            <span className={styles.value}>
              {customer.email} · {customer.phone}
            </span>
          </div>
          <div>
            <span className={styles.label}>Dirección</span>
            <span className={styles.value}>{customer.address}</span>
          </div>
        </div>
      ) : null}

      <OrderDetail order={order} />
    </div>
  );
}

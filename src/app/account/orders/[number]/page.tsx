/**
 * Cuenta - Detalle de un pedido. Bajo el AccountShell (nav + guarda). Export
 * estático: se generan las páginas de cada número de orden.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderDetail } from '@/components/orders/OrderDetail';
import { orderRepo } from '@/lib/data';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ number: string }>;
}

export async function generateStaticParams() {
  const orders = await orderRepo.listOrders();
  return orders.map((o) => ({ number: o.number }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { number } = await params;
  return { title: `Pedido ${number} — PATRONES` };
}

export default async function AccountOrderDetailPage({ params }: PageProps) {
  const { number } = await params;
  const order = await orderRepo.getOrderByNumber(number);
  if (!order) notFound();

  return (
    <div>
      <Link href="/account/orders/" className={styles.back}>
        ← Volver a mis pedidos
      </Link>
      <OrderDetail order={order} />
    </div>
  );
}

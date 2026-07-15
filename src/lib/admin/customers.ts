/**
 * CRM admin (§8, §13.4). Server-only. Consolida cada cliente con su historial:
 * pedidos, cotizaciones y total verificado (pagado). Distingue individual vs
 * institucion (un RIF J compra distinto).
 */

import { customerRepo, orderRepo } from '@/lib/data';
import type { CustomerType } from '@/lib/data/types';

export interface CustomerRow {
  id: string;
  name: string;
  type: CustomerType;
  doc: string;
  email: string;
  phone: string;
  orders: number;
  quotes: number;
  paidTotalCents: number;
}

export async function getCustomers(): Promise<CustomerRow[]> {
  const [customers, orders, quotes] = await Promise.all([
    customerRepo.listCustomers(),
    orderRepo.listOrders(),
    orderRepo.listQuotes(),
  ]);

  return customers.map((c) => {
    const cOrders = orders.filter((o) => o.customer_id === c.id);
    const paidTotalCents = cOrders
      .filter((o) => o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total_cents, 0);
    return {
      id: c.id,
      name: `${c.first_name} ${c.last_name}`,
      type: c.customer_type,
      doc: `${c.doc_kind}-${c.doc_number}`,
      email: c.email,
      phone: c.phone,
      orders: cOrders.length,
      quotes: quotes.filter((q) => q.customer_id === c.id).length,
      paidTotalCents,
    };
  });
}

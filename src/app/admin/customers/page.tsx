/**
 * Admin - Clientes (CRM, §8). Vista consolidada: tipo (individual/institución),
 * documento validado, contacto e historial (pedidos, cotizaciones, total pagado).
 * Sin CMS/CRM externo: es el CRM propio del admin.
 */

import { getCustomers } from '@/lib/admin/customers';
import { formatUsd } from '@/lib/format';
import ui from '@/components/admin/adminUI.module.css';

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div>
      <h1 className={ui.pageTitle}>Clientes</h1>
      <p className={ui.pageSubtitle}>
        Relación con clientes. Una institución (RIF J) compra distinto que una persona: el
        historial y el foco institucional (cotizaciones) viven acá.
      </p>

      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Documento</th>
              <th>Contacto</th>
              <th>Pedidos</th>
              <th>Cotizaciones</th>
              <th>Total pagado</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>
                  <span
                    className={`${ui.badge} ${c.type === 'institucion' ? ui.warning : ui.neutral}`}
                  >
                    {c.type === 'institucion' ? 'Institución' : 'Individual'}
                  </span>
                </td>
                <td className={ui.mono}>{c.doc}</td>
                <td>
                  {c.email}
                  <br />
                  {c.phone}
                </td>
                <td>{c.orders}</td>
                <td>{c.quotes}</td>
                <td>{formatUsd(c.paidTotalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

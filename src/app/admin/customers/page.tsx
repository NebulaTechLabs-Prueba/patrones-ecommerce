import { AdminPlaceholder } from '@/components/admin/AdminPlaceholder';

export default function AdminCustomersPage() {
  return (
    <AdminPlaceholder
      title="Clientes (CRM)"
      description="Relación con clientes: personas e instituciones (un RIF J compra distinto). Historial de pedidos, pagos y cotizaciones."
      planned={[
        'Listado con tipo (individual / institución) y datos validados (cédula/RIF)',
        'Ficha con pedidos, cotizaciones y estado de pagos',
        'Base del CRM: segmentar institucional para cotizaciones y portfolio',
      ]}
    />
  );
}

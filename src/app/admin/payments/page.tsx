import { AdminPlaceholder } from '@/components/admin/AdminPlaceholder';

export default function AdminPaymentsPage() {
  return (
    <AdminPlaceholder
      title="Pagos"
      description="Cobro de pedidos. Verificación de pagos offline (comprobante + referencia), con auditoría."
      planned={[
        'Cola de pagos en verificación (badge con contador)',
        'Aprobar (→ paid) o rechazar (→ rejected, con motivo)',
        'Plazo de verificación: 3 días hábiles; vencido libera stock',
        'Toda verificación auditada (quién, cuándo, monto, comprobante)',
      ]}
    />
  );
}

import { AdminPlaceholder } from '@/components/admin/AdminPlaceholder';

export default function AdminOrdersPage() {
  return (
    <AdminPlaceholder
      title="Órdenes"
      description="Cumplimiento de pedidos. Máquina de estado separada del cobro; cada transición valida el estado previo."
      planned={[
        'Listado con estado de cumplimiento y de pago (dos máquinas separadas)',
        'Avanzar estado: pending → confirmed → preparing → shipped/ready_for_pickup → delivered',
        'Cargar número de guía al despachar',
        'La lógica de transiciones ya está implementada y testeada',
      ]}
    />
  );
}

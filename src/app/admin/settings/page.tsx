import { AdminPlaceholder } from '@/components/admin/AdminPlaceholder';

export default function AdminSettingsPage() {
  return (
    <AdminPlaceholder
      title="Ajustes"
      description="Configuración del negocio: umbral de bajo stock, mayoreo, ventana de tasa, cotización, horario, WhatsApp, cuentas receptoras y métodos de pago."
      planned={[
        'Umbral global de bajo stock, mayoreo (on/off + umbral), piso de precio',
        'Ventana de validez de tasa, vigencia de cotización, TTL de carrito',
        'Horario, número de WhatsApp, fuente de tasa',
        'Cuentas receptoras y métodos de pago activos (keys en DB, enmascaradas)',
      ]}
    />
  );
}

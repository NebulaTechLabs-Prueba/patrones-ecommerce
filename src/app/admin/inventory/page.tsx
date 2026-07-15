import { AdminPlaceholder } from '@/components/admin/AdminPlaceholder';

export default function AdminInventoryPage() {
  return (
    <AdminPlaceholder
      title="Inventario"
      description="Existencias por variante (disponible = stock − reservado) y alertas de bajo stock. El resumen ya vive en el Dashboard."
      planned={[
        'Tabla por variante con stock, reservado y disponible',
        'Umbral de bajo stock global + override por producto',
        'Sincronización con el sistema administrativo (Fase 2): proyección + stale + alerta',
      ]}
    />
  );
}

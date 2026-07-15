import { AdminPlaceholder } from '@/components/admin/AdminPlaceholder';

export default function AdminDiscountsPage() {
  return (
    <AdminPlaceholder
      title="Descuentos"
      description="Promociones acumulables controladas por el admin: tipo, vigencia, qué se apila y en qué orden."
      planned={[
        'Crear/activar/desactivar promos (%, monto fijo, precio especial, mayoreo)',
        'stackable + priority (orden de aplicación determinista)',
        'Piso de precio para promos apiladas',
        'El motor de cálculo (pricing) ya está implementado y testeado',
      ]}
    />
  );
}

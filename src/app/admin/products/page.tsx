import { AdminPlaceholder } from '@/components/admin/AdminPlaceholder';

export default function AdminProductsPage() {
  return (
    <AdminPlaceholder
      title="Productos"
      description="Alta y edición de productos, variantes (SKU por variante), precios y línea propia."
      planned={[
        'Listado con estado de visibilidad (agotado no aparece en el público)',
        'Variantes: SKU provisto por PATRONES (se valida, no se genera)',
        'Precio a nivel producto + override por variante',
        'Marcar featured (con aviso si se concentran en un rubro)',
      ]}
    />
  );
}

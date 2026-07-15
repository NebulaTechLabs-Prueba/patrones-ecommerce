/**
 * Admin - Productos. Todo el catálogo (productos, variantes, marcas, rubros y
 * categorías) sale del store compartido, que a su vez se siembra desde el servidor
 * en el layout. El workspace (client) maneja las pestañas y el estado.
 */

import { ProductsWorkspace } from '@/components/admin/ProductsWorkspace';

export default function AdminProductsPage() {
  return <ProductsWorkspace />;
}

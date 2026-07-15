import { AdminPlaceholder } from '@/components/admin/AdminPlaceholder';

export default function AdminContentPage() {
  return (
    <AdminPlaceholder
      title="Contenido (CMS)"
      description="Gestión de contenido editable como data: rubros, marcas, categorías, colecciones, FAQ, tabla de medidas y textos legales."
      planned={[
        'CRUD de rubros/marcas/categorías/modelos/colecciones',
        'FAQ y tabla de medidas (hoy con forma de datos tipada)',
        'Textos legales (nota de entrega sin factura fiscal + no-devolución)',
        'Este es el CMS del sitio: el catálogo y el contenido son data, no código',
      ]}
    />
  );
}

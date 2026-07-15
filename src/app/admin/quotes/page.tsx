import { AdminPlaceholder } from '@/components/admin/AdminPlaceholder';

export default function AdminQuotesPage() {
  return (
    <AdminPlaceholder
      title="Cotizaciones"
      description="Cotizaciones institucionales: congelan precios, promociones y tasa; convertibles a orden revalidando disponibilidad."
      planned={[
        'Crear cotización desde un carrito, con vigencia (72h)',
        'Desglose de tallas (30 conjuntos: X en S, Y en M…)',
        'PDF + email; convertir a orden en un click',
      ]}
    />
  );
}

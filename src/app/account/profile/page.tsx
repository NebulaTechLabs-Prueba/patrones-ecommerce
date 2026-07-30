/**
 * Cuenta - Mis datos. Muestra los datos del cliente (funcional) y sus direcciones
 * de encomienda guardadas. En Fase 1 la cuenta demo cae en la clienta Ana del seed;
 * las cuentas creadas por el visitante salen de su registro (localStorage).
 */

import { MyDetails, type DetailsData } from '@/components/account/MyDetails';
import { PaymentMethods } from '@/components/account/PaymentMethods';
import { ShippingLocations } from '@/components/account/ShippingLocations';
import { customerRepo } from '@/lib/data';

const DEMO_CUSTOMER_ID = 'cus-ana';

export default async function AccountProfilePage() {
  const demo = await customerRepo.getCustomerById(DEMO_CUSTOMER_ID);
  const fallback: DetailsData = demo
    ? {
        firstName: demo.first_name,
        lastName: demo.last_name,
        email: demo.email,
        phone: demo.phone,
        docKind: demo.doc_kind,
        docNumber: demo.doc_number,
      }
    : { firstName: '', lastName: '', email: '', phone: '', docKind: 'V', docNumber: '' };

  return (
    <div>
      <MyDetails fallback={fallback} />
      <ShippingLocations />
      <PaymentMethods />
    </div>
  );
}

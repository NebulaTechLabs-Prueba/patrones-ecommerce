/**
 * Admin - Ajustes. El server entrega la configuración y los métodos de pago; la
 * edición (in-memory) vive en el client component.
 */

import { AdminSettings } from '@/components/admin/AdminSettings';
import { settingsRepo } from '@/lib/data';

export default async function AdminSettingsPage() {
  const [settings, methods] = await Promise.all([
    settingsRepo.getSettings(),
    settingsRepo.listPaymentMethods(),
  ]);

  return <AdminSettings initial={settings} initialMethods={methods} />;
}

/**
 * Contacto. Hero editorial (StatementHero) con los datos de atención desde la
 * configuración (WhatsApp y ubicación), más el horario debajo.
 */

import type { Metadata } from 'next';
import { settingsRepo } from '@/lib/data';
import { ContactHero } from '@/components/storefront/ContactHero';

export const metadata: Metadata = {
  title: 'Contacto — PATRONES',
  description: 'Escríbenos por WhatsApp, visítanos en tienda o consulta nuestro horario.',
};

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default async function ContactPage() {
  const settings = await settingsRepo.getSettings();
  const { business_hours, location } = settings;
  const days = [...business_hours.open_days].sort((a, b) => a - b);
  const dayLabel = days.length > 0 ? `${DAY_NAMES[days[0]!]} a ${DAY_NAMES[days[days.length - 1]!]}` : '';
  const waDigits = settings.whatsapp_number.replace(/\D/g, '');

  return (
    <main>
      <ContactHero
        waHref={`https://wa.me/${waDigits}`}
        contact={{
          website: '@PATRONES.VZLA',
          phone: settings.whatsapp_number,
          address: `${location.line1} · ${location.line2}`,
        }}
      />

      <section style={{ maxWidth: 'var(--ptr-container)', margin: '0 auto', padding: 'var(--ptr-space-9) var(--ptr-space-6)', textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--ptr-text-sm)', fontWeight: 'var(--ptr-weight-semibold)', letterSpacing: 'var(--ptr-tracking-wider)', textTransform: 'uppercase', color: 'var(--ptr-primary)', marginBottom: 'var(--ptr-space-2)' }}>
          Horario de atención
        </p>
        <p style={{ fontSize: 'var(--ptr-text-lg)', color: 'var(--ptr-ink)', margin: 0 }}>
          {dayLabel} · {business_hours.open_time}–{business_hours.close_time}
        </p>
        <p style={{ color: 'var(--ptr-neutral-500)', marginTop: 'var(--ptr-space-2)' }}>
          Quien compra fuera de horario compra igual; se procesa al reabrir.
        </p>
      </section>
    </main>
  );
}

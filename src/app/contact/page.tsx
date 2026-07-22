/**
 * Contacto. Datos de atención desde la configuración (horario, WhatsApp) y la
 * ubicación con enlace a Maps.
 */

import type { Metadata } from 'next';
import { settingsRepo } from '@/lib/data';
import styles from './contact.module.css';

export const metadata: Metadata = {
  title: 'Contacto — PATRONES',
  description: 'Escríbenos por WhatsApp, visítanos en Puerto Ordaz o consulta nuestro horario.',
};

const MAPS_URL = 'https://maps.app.goo.gl/Z4DzPoUoodymjQwJ7';
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default async function ContactPage() {
  const settings = await settingsRepo.getSettings();
  const { business_hours } = settings;
  const days = [...business_hours.open_days].sort((a, b) => a - b);
  const dayLabel =
    days.length > 0 ? `${DAY_NAMES[days[0]!]} a ${DAY_NAMES[days[days.length - 1]!]}` : '';
  const waDigits = settings.whatsapp_number.replace(/\D/g, '');

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Contacto</p>
        <h1 className={styles.title}>Estamos para ayudarte</h1>
        <p className={styles.lead}>
          Consultanos por talles, disponibilidad o pedidos institucionales. Te respondemos en
          horario de atención.
        </p>
      </header>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>WhatsApp</h2>
          <p className={styles.cardText}>{settings.whatsapp_number}</p>
          <a
            className={styles.cta}
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Escribir por WhatsApp
          </a>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Tienda</h2>
          <p className={styles.cardText}>C.C. Costa Granada, Villa Granada</p>
          <p className={styles.cardText}>Puerto Ordaz, Venezuela</p>
          <a className={styles.link} href={MAPS_URL} target="_blank" rel="noopener noreferrer">
            Ver en el mapa
          </a>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Horario</h2>
          <p className={styles.cardText}>
            {dayLabel} · {business_hours.open_time}–{business_hours.close_time}
          </p>
          <p className={styles.cardMuted}>Quien compra fuera de horario compra igual; se procesa al reabrir.</p>
        </section>
      </div>
    </main>
  );
}

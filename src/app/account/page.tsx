/**
 * Resumen de la cuenta del cliente. Accesos rapidos a pedidos, cotizaciones,
 * deseados y datos. Los datos reales por-usuario llegan en Fase 2 (auth real).
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { SoundToggle } from '@/components/layout/SoundToggle';
import styles from './account.module.css';

export const metadata: Metadata = {
  title: 'Mi cuenta — PATRONES',
};

const LINKS = [
  { title: 'Pedidos', description: 'Sigue el estado de tus compras y de tus pagos.', href: '/account/orders/' },
  { title: 'Cotizaciones', description: 'Tus cotizaciones con precios y tasa congelados.', href: '/account/quotes/' },
  { title: 'Carritos guardados', description: 'Retoma tus carritos sin cerrar (hasta 5).', href: '/account/carts/' },
  { title: 'Lista de deseados', description: 'Prendas guardadas; te avisamos cuando vuelvan.', href: '/account/wishlist/' },
  { title: 'Mis datos', description: 'Contacto, dirección y documento (cédula/RIF).', href: '/account/profile/' },
];

export default function AccountHomePage() {
  return (
    <div>
      <div className={styles.grid}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={styles.card}>
            <span className={styles.cardTitle}>{l.title}</span>
            <span className={styles.cardDesc}>{l.description}</span>
          </Link>
        ))}
      </div>

      <section className={styles.prefs}>
        <div>
          <span className={styles.cardTitle}>Sonido de la interfaz</span>
          <span className={styles.cardDesc}>Activa o silencia el sonido de botones e interacciones.</span>
        </div>
        <SoundToggle />
      </section>
    </div>
  );
}

/**
 * Resumen de la cuenta del cliente. Accesos rapidos a pedidos, cotizaciones,
 * deseados y datos. Los datos reales por-usuario llegan en Fase 2 (auth real).
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './account.module.css';

export const metadata: Metadata = {
  title: 'Mi cuenta — PATRONES',
};

const LINKS = [
  { title: 'Pedidos', description: 'Seguí el estado de tus compras y de tus pagos.', href: '/account/orders/' },
  { title: 'Cotizaciones', description: 'Tus cotizaciones con precios y tasa congelados.', href: '/account/quotes/' },
  { title: 'Lista de deseados', description: 'Prendas guardadas; te avisamos cuando vuelvan.', href: '/account/wishlist/' },
  { title: 'Mis datos', description: 'Contacto, dirección y documento (cédula/RIF).', href: '/account/profile/' },
];

export default function AccountHomePage() {
  return (
    <div className={styles.grid}>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={styles.card}>
          <span className={styles.cardTitle}>{l.title}</span>
          <span className={styles.cardDesc}>{l.description}</span>
        </Link>
      ))}
    </div>
  );
}

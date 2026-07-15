/**
 * Footer del storefront.
 *
 * Server component. Datos de contacto y horario desde SettingsRepository (no
 * hardcodeados). Deja explicito el alcance comercial (nota de entrega, no factura
 * fiscal; §3) porque es parte del acuerdo, no copy decorativo.
 */

import Link from 'next/link';
import { settingsRepo } from '@/lib/data';
import styles from './Footer.module.css';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function formatDays(days: number[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (first === undefined || last === undefined) return '';
  return `${DAY_NAMES[first]} a ${DAY_NAMES[last]}`;
}

export async function Footer() {
  const settings = await settingsRepo.getSettings();
  const { business_hours } = settings;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.col}>
          <p className={styles.brand}>PATRONES</p>
          <p className={styles.muted}>
            Uniformes profesionales multi-rubro. Línea propia y marcas seleccionadas.
          </p>
        </div>

        <div className={styles.col}>
          <p className={styles.heading}>Tienda</p>
          <Link href="/uniformes/salud/" className={styles.link}>
            Rubros
          </Link>
          <Link href="/linea-patrones/" className={styles.link}>
            Línea PATRONES
          </Link>
          <Link href="/faq/" className={styles.link}>
            Preguntas frecuentes
          </Link>
          <Link href="/account/orders/" className={styles.link}>
            Mis pedidos
          </Link>
        </div>

        <div className={styles.col}>
          <p className={styles.heading}>Atención</p>
          <p className={styles.muted}>
            {formatDays(business_hours.open_days)} · {business_hours.open_time}–{business_hours.close_time}
          </p>
          <a
            className={styles.address}
            href="https://maps.app.goo.gl/Z4DzPoUoodymjQwJ7"
            target="_blank"
            rel="noopener noreferrer"
          >
            Puerto Ordaz, Venezuela · C.C. Costa Granada
          </a>
        </div>
      </div>
    </footer>
  );
}

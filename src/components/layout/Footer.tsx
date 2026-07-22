/**
 * Footer del storefront — cierre con carácter.
 *
 * Server component. Datos de contacto y horario desde SettingsRepository (no
 * hardcodeados). Suma un llamado a la acción (venta/servicio por WhatsApp) y redes.
 * Deja explícito el alcance comercial (nota de entrega, no factura fiscal; §3).
 * Firma visual: retícula de patrón sobre fondo oscuro, coherente con el hero.
 */

import Link from 'next/link';
import { settingsRepo } from '@/lib/data';
import styles from './Footer.module.css';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const INSTAGRAM_URL = 'https://www.instagram.com/PATRONES.VZLA';

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
  const waNumber = settings.whatsapp_number.replace(/\D/g, '');
  const waLink = `https://wa.me/${waNumber}`;
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.inner}>
        {/* Llamado a la acción */}
        <div className={styles.cta}>
          <div>
            <p className={styles.ctaEyebrow}>Equipamos a tu equipo</p>
            <h2 className={styles.ctaTitle}>Armemos el look de tu profesión, de pies a cabeza.</h2>
          </div>
          <div className={styles.ctaActions}>
            <a className={styles.ctaPrimary} href={waLink} target="_blank" rel="noopener noreferrer">
              <WhatsappIcon />
              Escríbenos por WhatsApp
            </a>
            <a className={styles.ctaSocial} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram de PATRONES">
              <InstagramIcon />
              @PATRONES.VZLA
            </a>
          </div>
        </div>

        <div className={styles.cols}>
          <div className={styles.brandCol}>
            <p className={styles.brand}>PATRONES</p>
            <p className={styles.muted}>
              Todo para el profesional, de pies a cabeza. Línea propia y marcas seleccionadas,
              con la asesoría de quienes visten Puerto Ordaz.
            </p>
          </div>

          <div className={styles.col}>
            <p className={styles.heading}>Tienda</p>
            <Link href="/uniformes/salud/" className={styles.link}>Rubros</Link>
            <Link href="/linea-patrones/" className={styles.link}>Línea PATRONES</Link>
            <Link href="/about/" className={styles.link}>Nosotros</Link>
            <Link href="/contact/" className={styles.link}>Contacto</Link>
          </div>

          <div className={styles.col}>
            <p className={styles.heading}>Ayuda</p>
            <Link href="/tallas/" className={styles.link}>Guía de tallas</Link>
            <Link href="/faq/" className={styles.link}>Preguntas frecuentes</Link>
            <Link href="/terminos/" className={styles.link}>Términos y Condiciones</Link>
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
              Puerto Ordaz, Venezuela
              <br />
              C.C. Costa Granada
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {year} PATRONES · Puerto Ordaz, Venezuela</p>
          <p className={styles.note}>De pies a cabeza · Puerto Ordaz</p>
        </div>
      </div>
    </footer>
  );
}

function WhatsappIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.33 4.95L2 22l5.3-1.38a9.9 9.9 0 0 0 4.73 1.2c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2Zm5.8 14.13c-.24.68-1.42 1.32-1.95 1.36-.5.05-1.13.07-1.83-.11-.42-.11-.96-.29-1.66-.59-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.26-.29.57-.36.76-.36l.55.01c.18.01.42-.07.65.5.24.58.82 2.01.89 2.16.07.14.12.31.02.5-.09.19-.14.31-.28.48l-.42.49c-.14.14-.28.29-.12.57.16.29.72 1.18 1.54 1.91 1.06.95 1.95 1.24 2.24 1.38.29.14.45.12.62-.07.17-.19.71-.83.9-1.11.19-.29.38-.24.64-.14.26.09 1.67.79 1.96.93.29.14.48.22.55.34.07.12.07.69-.17 1.36Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

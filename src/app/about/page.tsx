/**
 * Nosotros + Portfolio institucional. Amplía la percepción de la marca (§2):
 * PATRONES es multi-rubro. El portfolio muestra CAPACIDADES de dotación
 * institucional, no testimonios ni clientes ficticios (§6).
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'Nosotros — PATRONES',
  description:
    'Casa de uniformes profesionales multi-rubro en Puerto Ordaz: salud, gastronomía y corporativo. Línea propia y dotación institucional.',
};

const PORTFOLIO = [
  {
    title: 'Dotación para salud',
    text: 'Scrubs, casacas y calzado para clínicas y consultorios, con tallas para todo el equipo.',
    label: 'Salud',
  },
  {
    title: 'Cocinas y salón',
    text: 'Filipinas, delantales y pantalones para restaurantes y hoteles, listos para el servicio.',
    label: 'Gastronomía',
  },
  {
    title: 'Imagen corporativa',
    text: 'Camisas y chaquetas para equipos de atención y oficina, con presencia consistente.',
    label: 'Corporativo',
  },
];

export default function AboutPage() {
  return (
    <main>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Nosotros</p>
          <h1 className={styles.title}>Uniformes profesionales, para cada oficio</h1>
          <p className={styles.lead}>
            Nacimos en Puerto Ordaz vistiendo al personal de salud y hoy somos una casa de
            uniformes multi-rubro: salud, gastronomía y corporativo. Combinamos nuestra línea
            propia con marcas seleccionadas para resolver la dotación completa de cada equipo.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.values}>
          <div className={styles.value}>
            <h2 className={styles.valueTitle}>Línea propia + marcas</h2>
            <p className={styles.valueText}>
              Diseñamos y producimos la Línea PATRONES, y sumamos marcas de terceros para ampliar
              opciones sin resignar calidad.
            </p>
          </div>
          <div className={styles.value}>
            <h2 className={styles.valueTitle}>Multi-rubro</h2>
            <p className={styles.valueText}>
              Una misma casa resuelve el scrub de la clínica, la filipina del chef y la camisa de
              recepción.
            </p>
          </div>
          <div className={styles.value}>
            <h2 className={styles.valueTitle}>Atención cercana</h2>
            <p className={styles.valueText}>
              Asesoría por talles y disponibilidad, y atención directa por WhatsApp antes y después
              de la compra.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.portfolioEyebrow}>Portfolio institucional</p>
        <h2 className={styles.portfolioTitle}>Vestimos equipos completos</h2>
        <p className={styles.portfolioLead}>
          Acompañamos a instituciones en su dotación, por rubro y a la medida de cada equipo.
        </p>

        <div className={styles.portfolio}>
          {PORTFOLIO.map((item) => (
            <article key={item.title} className={styles.projectCard}>
              <PlaceholderImage image={null} label={item.label} ratio="4 / 3" />
              <div className={styles.projectBody}>
                <h3 className={styles.projectTitle}>{item.title}</h3>
                <p className={styles.projectText}>{item.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.cta}>
          <p className={styles.ctaText}>¿Necesitás dotar a tu equipo o institución?</p>
          <Link href="/contact/" className={styles.ctaBtn}>
            Solicitar una cotización
          </Link>
        </div>
      </section>
    </main>
  );
}

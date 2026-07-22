/**
 * Nosotros + Portfolio institucional. Amplía la percepción de la marca (§2):
 * PATRONES es multi-rubro. El portfolio muestra CAPACIDADES de dotación
 * institucional, no testimonios ni clientes ficticios (§6). Rediseño editorial.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import { Reveal } from '@/components/motion/Reveal';
import type { ProductImage } from '@/lib/data/types';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'Nosotros — PATRONES',
  description:
    'La casa que equipa al profesional de pies a cabeza en Puerto Ordaz: uniformes de alto rendimiento, calzado, perfumería y complementos. Línea propia, marcas seleccionadas y dotación institucional.',
};

const shot = (id: string, alt: string): ProductImage => ({
  url: `https://images.unsplash.com/photo-${id}?q=80&w=800&h=600&fit=crop`,
  alt,
  is_placeholder: false,
  sort_order: 0,
});

const PORTFOLIO = [
  {
    title: 'Dotación para salud',
    text: 'Scrubs, casacas y calzado para clínicas y consultorios, con tallas para todo el equipo.',
    label: 'Salud',
    image: shot('1576091160399-112ba8d25d1d', 'Equipo de salud con uniformes PATRONES'),
  },
  {
    title: 'Cocinas y salón',
    text: 'Filipinas, delantales y pantalones para restaurantes y hoteles, listos para el servicio.',
    label: 'Gastronomía',
    image: shot('1577219491135-ce391730fb2c', 'Personal de cocina con filipina PATRONES'),
  },
  {
    title: 'Imagen corporativa',
    text: 'Camisas y chaquetas para equipos de atención y oficina, con presencia consistente.',
    label: 'Corporativo',
    image: shot('1594938298603-c8148c4dae35', 'Equipo corporativo con uniforme PATRONES'),
  },
];

export default function AboutPage() {
  return (
    <main>
      <section className={styles.hero}>
        <Reveal className={styles.heroInner}>
          <p className={styles.eyebrow}>Nosotros</p>
          <h1 className={styles.title}>Todo para el profesional, de pies a cabeza</h1>
          <p className={styles.lead}>
            Nacimos en Puerto Ordaz vistiendo al personal de salud y hoy equipamos al
            profesional entero: uniformes de alto rendimiento para cada rubro —salud,
            gastronomía, corporativo y más—, sumados a calzado, perfumería y complementos.
            Una sola casa que combina su línea propia con marcas seleccionadas, de pies a cabeza.
          </p>
        </Reveal>
      </section>

      <section className={styles.section}>
        <div className={styles.values}>
          {[
            {
              t: 'Versatilidad integral',
              d: 'Una misma casa resuelve el uniforme, el calzado, la fragancia y el complemento. Todo lo que un profesional necesita, de pies a cabeza.',
            },
            {
              t: 'Vanguardia y estilo',
              d: 'Rompemos el molde: prendas y piezas pensadas para verse tan bien como rinden. Para que cada quien sea patrón de su propio camino.',
            },
            {
              t: 'Alto rendimiento y detalle',
              d: 'Telas, marcas y terminaciones elegidas con exigencia. Cuidamos cada detalle para que acompañen la jornada sin ceder.',
            },
            {
              t: 'Línea propia + marcas',
              d: 'Diseñamos y producimos la Línea PATRONES, y sumamos marcas seleccionadas para ampliar opciones sin resignar calidad.',
            },
          ].map((v, i) => (
            <Reveal key={v.t} delay={i * 90} className={styles.value}>
              <h2 className={styles.valueTitle}>{v.t}</h2>
              <p className={styles.valueText}>{v.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <Reveal>
          <p className={styles.portfolioEyebrow}>Portfolio institucional</p>
          <h2 className={styles.portfolioTitle}>Vestimos equipos completos</h2>
          <p className={styles.portfolioLead}>
            Acompañamos a instituciones en su dotación, por rubro y a la medida de cada equipo.
          </p>
        </Reveal>

        <div className={styles.portfolio}>
          {PORTFOLIO.map((item, i) => (
            <Reveal key={item.title} delay={i * 90} as="article" className={styles.projectCard}>
              <PlaceholderImage image={item.image} label={item.label} ratio="4 / 3" />
              <div className={styles.projectBody}>
                <h3 className={styles.projectTitle}>{item.title}</h3>
                <p className={styles.projectText}>{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal variant="fade" className={styles.cta}>
          <p className={styles.ctaText}>¿Necesitas dotar a tu equipo o institución?</p>
          <Link href="/contact/" className={styles.ctaBtn} data-sound="add">
            Solicitar una cotización
          </Link>
        </Reveal>
      </section>
    </main>
  );
}

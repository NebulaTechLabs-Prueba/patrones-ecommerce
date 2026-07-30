'use client';

/**
 * Hero editorial "split" (texto + foto con revelado por clip-path). Adaptación —a
 * las convenciones del proyecto (CSS Modules + tokens, animación CSS, sin
 * dependencias nuevas)— del patrón de hero con datos de contacto. Se usa en la
 * página de Contacto.
 */

import Link from 'next/link';
import { Isologo } from '@/components/brand/Isologo';
import styles from './StatementHero.module.css';

interface StatementHeroProps {
  slogan?: string;
  title: React.ReactNode;
  subtitle: string;
  cta: { text: string; href: string };
  backgroundImage: string;
  contact: { website: string; phone: string; address: string };
}

function Icon({ type }: { type: 'website' | 'phone' | 'address' }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (type === 'website') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" x2="22" y1="12" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }
  if (type === 'phone') {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function StatementHero({ slogan, title, subtitle, cta, backgroundImage, contact }: StatementHeroProps) {
  const external = /^https?:\/\//.test(cta.href);
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div>
          <div className={styles.brandRow}>
            <Isologo height={26} />
            {slogan ? <span className={styles.slogan}>{slogan}</span> : null}
          </div>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.accent} />
          <p className={styles.subtitle}>{subtitle}</p>
          {external ? (
            <a href={cta.href} className={styles.cta} target="_blank" rel="noopener noreferrer">
              {cta.text}
            </a>
          ) : (
            <Link href={cta.href} className={styles.cta}>
              {cta.text}
            </Link>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.info}><Icon type="website" /><span>{contact.website}</span></div>
          <div className={styles.info}><Icon type="phone" /><span>{contact.phone}</span></div>
          <div className={styles.info}><Icon type="address" /><span>{contact.address}</span></div>
        </div>
      </div>

      <div className={styles.media} style={{ backgroundImage: `url(${backgroundImage})` }} aria-hidden="true" />
    </section>
  );
}

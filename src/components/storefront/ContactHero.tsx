'use client';

/**
 * Hero de Contacto: el copy y la imagen son editables (content-context); los datos
 * de contacto (WhatsApp, ubicación) llegan como props desde Ajustes (server).
 */

import { StatementHero } from './StatementHero';
import { useContent } from '@/lib/store/content-context';

export function ContactHero({
  waHref,
  contact,
}: {
  waHref: string;
  contact: { website: string; phone: string; address: string };
}) {
  const { content } = useContent();
  const s = content.statement;
  return (
    <StatementHero
      slogan={s.slogan}
      title={s.title}
      subtitle={s.subtitle}
      cta={{ text: s.ctaText, href: waHref }}
      backgroundImage={s.image}
      contact={contact}
    />
  );
}

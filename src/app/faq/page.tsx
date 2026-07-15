/**
 * FAQ (§15). Hardcodeada en el seed pero CON FORMA DE DATOS: se lee por el
 * SettingsRepository. Migrar a DB en v2 = cambiar el origen, no esta pagina.
 *
 * Acordeon con <details>/<summary> nativo: accesible y sin JavaScript (no hace
 * falta 'use client'). El estado abierto/cerrado lo maneja el navegador.
 */

import type { Metadata } from 'next';
import { settingsRepo } from '@/lib/data';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Preguntas frecuentes — PATRONES',
  description: 'Cómo comprar, pagar, elegir talla, recibir el pedido y verificar tu pago en PATRONES.',
};

export default async function FaqPage() {
  const faqs = await settingsRepo.listFaqs();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Ayuda</p>
        <h1 className={styles.title}>Preguntas frecuentes</h1>
      </header>

      <ul className={styles.list}>
        {faqs.map((faq) => (
          <li key={faq.sort_order} className={styles.item}>
            <details className={styles.details}>
              <summary className={styles.summary}>{faq.question}</summary>
              <p className={styles.answer}>{faq.answer}</p>
            </details>
          </li>
        ))}
      </ul>
    </main>
  );
}

'use client';

/**
 * Editor de promos del sitio: la barra de anuncio superior y el incentivo (popup)
 * para crear cuenta. La clienta los ajusta por temporada sin depender de desarrollo.
 * Guarda en el store de promos (localStorage en Fase 1).
 */

import { useEffect, useState } from 'react';
import { usePromo, type PromoConfig } from '@/lib/store/promo-context';
import { useToast } from '@/lib/store/toast-context';
import ui from './adminUI.module.css';

export function AdminPromos() {
  const { promo, setPromo, hydrated } = usePromo();
  const { success } = useToast();
  const [draft, setDraft] = useState<PromoConfig>(promo);

  useEffect(() => {
    setDraft(promo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function setA<K extends keyof PromoConfig['announcement']>(key: K, value: PromoConfig['announcement'][K]) {
    setDraft((d) => ({ ...d, announcement: { ...d.announcement, [key]: value } }));
  }
  function setS<K extends keyof PromoConfig['signup']>(key: K, value: PromoConfig['signup'][K]) {
    setDraft((d) => ({ ...d, signup: { ...d.signup, [key]: value } }));
  }

  function save() {
    setPromo(draft);
    success('Promos guardadas.');
  }

  return (
    <div style={{ marginTop: 'var(--ptr-space-9)' }}>
      <div className={ui.pageHead}>
        <div>
          <h2 className={ui.pageTitle}>Anuncio y captación de cuentas</h2>
          <p className={ui.pageSubtitle}>La barra superior de anuncio y el popup que invita a crear cuenta.</p>
        </div>
        <button type="button" className={ui.newBtn} onClick={save}>Guardar promos</button>
      </div>

      {/* Barra de anuncio */}
      <label className={ui.check} style={{ marginBottom: 'var(--ptr-space-3)' }}>
        <input type="checkbox" checked={draft.announcement.enabled} onChange={(e) => setA('enabled', e.target.checked)} />
        <span>Mostrar barra de anuncio (arriba del navbar)</span>
      </label>
      <div className={ui.fieldRow}>
        <label className={ui.field} style={{ flex: 2 }}>
          <span>Texto del anuncio</span>
          <input className={ui.input} value={draft.announcement.text} onChange={(e) => setA('text', e.target.value)} />
        </label>
        <label className={ui.field}>
          <span>Enlace (opcional)</span>
          <input className={ui.input} value={draft.announcement.href} onChange={(e) => setA('href', e.target.value)} placeholder="/login/" />
        </label>
      </div>

      {/* Popup de captación */}
      <label className={ui.check} style={{ margin: 'var(--ptr-space-5) 0 var(--ptr-space-3)' }}>
        <input type="checkbox" checked={draft.signup.enabled} onChange={(e) => setS('enabled', e.target.checked)} />
        <span>Mostrar popup para crear cuenta (a quien no inició sesión)</span>
      </label>
      <label className={ui.field}>
        <span>Título</span>
        <input className={ui.input} value={draft.signup.title} onChange={(e) => setS('title', e.target.value)} />
      </label>
      <label className={ui.field}>
        <span>Mensaje</span>
        <textarea className={ui.input} rows={2} value={draft.signup.body} onChange={(e) => setS('body', e.target.value)} />
      </label>
      <div className={ui.fieldRow}>
        <label className={ui.field}>
          <span>Texto del botón</span>
          <input className={ui.input} value={draft.signup.ctaLabel} onChange={(e) => setS('ctaLabel', e.target.value)} />
        </label>
        <label className={ui.field}>
          <span>Enlace del botón</span>
          <input className={ui.input} value={draft.signup.ctaHref} onChange={(e) => setS('ctaHref', e.target.value)} placeholder="/login/" />
        </label>
        <label className={ui.field}>
          <span>Aparece a los (seg.)</span>
          <input className={ui.input} type="number" min="0" value={draft.signup.delaySeconds} onChange={(e) => setS('delaySeconds', Number(e.target.value))} />
        </label>
      </div>
    </div>
  );
}

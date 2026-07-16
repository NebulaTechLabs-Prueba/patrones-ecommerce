'use client';

/**
 * Sonido de interfaz (orden del PM): feedback audible en botones e interacciones.
 * Se sintetiza con Web Audio (sin archivos ni CDN): ticks cortos y sutiles. Un
 * listener global reproduce el sonido al hacer click en elementos interactivos;
 * los CTA marcados con data-sound="primary" suenan distinto. Silenciable y
 * persistente (localStorage). El AudioContext se crea recién con el primer gesto.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type SoundKind = 'tick' | 'soft' | 'primary';

interface SoundContextValue {
  muted: boolean;
  toggle: () => void;
  play: (kind: SoundKind) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);
const STORAGE_KEY = 'ptr-sound-muted';

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const acRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      if (v !== null) {
        const m = v === '1';
        setMuted(m);
        mutedRef.current = m;
      }
    } catch {
      // ignorar
    }
  }, []);

  const ensureAC = useCallback((): AudioContext | null => {
    if (!acRef.current) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      try {
        acRef.current = new Ctor();
      } catch {
        return null;
      }
    }
    if (acRef.current.state === 'suspended') acRef.current.resume().catch(() => {});
    return acRef.current;
  }, []);

  const play = useCallback(
    (kind: SoundKind) => {
      if (mutedRef.current) return;
      const ac = ensureAC();
      if (!ac) return;
      const now = ac.currentTime;

      const blip = (freq: number, start: number, dur: number, peak: number, type: OscillatorType = 'sine') => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.linearRampToValueAtTime(peak, now + start + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        osc.connect(gain).connect(ac.destination);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.02);
      };

      if (kind === 'tick') blip(2050, 0, 0.05, 0.045, 'triangle');
      else if (kind === 'soft') blip(1300, 0, 0.06, 0.03, 'sine');
      else {
        blip(760, 0, 0.09, 0.05, 'sine');
        blip(1240, 0.055, 0.12, 0.045, 'sine');
      }
    },
    [ensureAC],
  );

  const toggle = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      mutedRef.current = next;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        // ignorar
      }
      if (!next) ensureAC();
      return next;
    });
  }, [ensureAC]);

  // Sonido global en clicks de elementos interactivos.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.(
        'a[href], button, [role="button"], input[type="checkbox"], input[type="radio"], select, summary',
      );
      if (!el) return;
      play(el.closest('[data-sound="primary"]') ? 'primary' : 'tick');
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [play]);

  return <SoundContext.Provider value={{ muted, toggle, play }}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound debe usarse dentro de SoundProvider');
  return ctx;
}

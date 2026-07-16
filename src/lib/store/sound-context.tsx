'use client';

/**
 * Sonido de interfaz (orden del PM): feedback audible clasificado por acción.
 * Se sintetiza con Web Audio (sin archivos ni CDN). Cada tipo de interacción tiene
 * su sonido distintivo. Un listener global cubre clicks y hover de elementos
 * interactivos; los componentes disparan sonidos específicos con play(kind) o con
 * el atributo data-sound="<kind>". Silenciable SOLO desde la cuenta (Ajustes);
 * por defecto activo. El AudioContext se crea con el primer gesto.
 *
 * Taxonomía:
 *  - click    : botón genérico
 *  - nav      : enlace de navegación
 *  - hover     : paso del cursor por producto/botón (sutil)
 *  - add      : añadir al carrito / comprar
 *  - success  : operación correcta / toast de éxito / login ok
 *  - error    : operación fallida / toast de error / login inválido
 *  - toggle   : interruptores
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export type SoundKind = 'click' | 'nav' | 'hover' | 'add' | 'success' | 'error' | 'toggle';

interface SoundContextValue {
  muted: boolean;
  setMuted: (m: boolean) => void;
  play: (kind: SoundKind) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);
const STORAGE_KEY = 'ptr-sound-muted';

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMutedState] = useState(false);
  const mutedRef = useRef(false);
  const acRef = useRef<AudioContext | null>(null);
  const lastHover = useRef<Element | null>(null);
  const lastHoverAt = useRef(0);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      if (v !== null) {
        const m = v === '1';
        setMutedState(m);
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
      const t0 = ac.currentTime;

      const tone = (freq: number, start: number, dur: number, peak: number, type: OscillatorType = 'sine') => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0 + start);
        gain.gain.setValueAtTime(0.0001, t0 + start);
        gain.gain.linearRampToValueAtTime(peak, t0 + start + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
        osc.connect(gain).connect(ac.destination);
        osc.start(t0 + start);
        osc.stop(t0 + start + dur + 0.02);
      };

      switch (kind) {
        case 'click':
          tone(2050, 0, 0.05, 0.05, 'triangle');
          break;
        case 'nav':
          tone(1500, 0, 0.05, 0.035, 'sine');
          break;
        case 'hover':
          tone(2700, 0, 0.028, 0.018, 'sine');
          break;
        case 'add': // añadir/comprar: dos notas ascendentes, positivo
          tone(660, 0, 0.09, 0.05, 'sine');
          tone(990, 0.06, 0.12, 0.05, 'sine');
          break;
        case 'success': // arpegio ascendente
          tone(660, 0, 0.1, 0.05, 'sine');
          tone(880, 0.08, 0.1, 0.05, 'sine');
          tone(1230, 0.16, 0.16, 0.05, 'sine');
          break;
        case 'error': // dos notas graves descendentes, timbre áspero
          tone(320, 0, 0.14, 0.05, 'sawtooth');
          tone(200, 0.12, 0.2, 0.05, 'sawtooth');
          break;
        case 'toggle':
          tone(1400, 0, 0.06, 0.04, 'triangle');
          break;
      }
    },
    [ensureAC],
  );

  const setMuted = useCallback(
    (m: boolean) => {
      setMutedState(m);
      mutedRef.current = m;
      try {
        window.localStorage.setItem(STORAGE_KEY, m ? '1' : '0');
      } catch {
        // ignorar
      }
      if (!m) ensureAC();
    },
    [ensureAC],
  );

  // Click global: clasifica por data-sound, luego por tipo de elemento.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.('a[href], button, [role="button"], input[type="checkbox"], input[type="radio"], select, summary, [data-sound]');
      if (!el) return;
      const explicit = el.closest('[data-sound]')?.getAttribute('data-sound') as SoundKind | null;
      if (explicit) {
        play(explicit);
        return;
      }
      if (el.tagName === 'A') play('nav');
      else play('click');
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [play]);

  // Hover global (sutil): productos y botones, una vez por elemento.
  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.('button, [role="button"], a[href*="/products/"], [data-sound-hover]');
      if (!el || el === lastHover.current) return;
      const now = e.timeStamp;
      if (now - lastHoverAt.current < 60) return; // anti-spam
      lastHover.current = el;
      lastHoverAt.current = now;
      play('hover');
    };
    const onOut = (e: MouseEvent) => {
      const rel = (e as MouseEvent & { relatedTarget: EventTarget | null }).relatedTarget as HTMLElement | null;
      if (!rel || !lastHover.current?.contains(rel)) lastHover.current = null;
    };
    document.addEventListener('mouseover', onOver, true);
    document.addEventListener('mouseout', onOut, true);
    return () => {
      document.removeEventListener('mouseover', onOver, true);
      document.removeEventListener('mouseout', onOut, true);
    };
  }, [play]);

  return <SoundContext.Provider value={{ muted, setMuted, play }}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound debe usarse dentro de SoundProvider');
  return ctx;
}

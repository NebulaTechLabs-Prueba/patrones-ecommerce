'use client';

/**
 * Selector ágil: en vez de recorrer listas largas de checkboxes, se busca y se
 * agrega con un clic (o Enter). Lo elegido queda como chips removibles. Reutilizable
 * para asociar productos a categorías/rubros/colecciones/conjuntos/promociones.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './TokenPicker.module.css';

export interface PickerOption {
  id: string;
  name: string;
}

interface TokenPickerProps {
  options: PickerOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  /** Si true, solo permite una selección (reemplaza). */
  single?: boolean;
}

export function TokenPicker({ options, selected, onChange, placeholder = 'Buscar y agregar…', single = false }: TokenPickerProps) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const nameById = useMemo(() => new Map(options.map((o) => [o.id, o.name])), [options]);
  const selSet = useMemo(() => new Set(selected), [selected]);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    return options.filter((o) => !selSet.has(o.id) && (t === '' || o.name.toLowerCase().includes(t))).slice(0, 60);
  }, [options, selSet, q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  function add(id: string) {
    onChange(single ? [id] : [...selected, id]);
    setQ('');
    if (single) setOpen(false);
  }
  function remove(id: string) {
    onChange(selected.filter((x) => x !== id));
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <div className={styles.box} onClick={() => setOpen(true)}>
        {selected.map((id) => (
          <button key={id} type="button" className={styles.chip} onClick={() => remove(id)} title="Quitar">
            {nameById.get(id) ?? id} <span aria-hidden="true">×</span>
          </button>
        ))}
        <input
          className={styles.input}
          value={q}
          placeholder={selected.length === 0 ? placeholder : ''}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && matches[0]) {
              e.preventDefault();
              add(matches[0].id);
            } else if (e.key === 'Backspace' && q === '' && selected.length > 0) {
              remove(selected[selected.length - 1]!);
            }
          }}
        />
      </div>

      {open ? (
        <div className={styles.menu} role="listbox">
          {matches.length > 0 ? (
            matches.map((m) => (
              <button key={m.id} type="button" className={styles.opt} onClick={() => add(m.id)}>
                {m.name}
              </button>
            ))
          ) : (
            <p className={styles.hint}>{q.trim() ? 'Sin coincidencias.' : 'Todo agregado.'}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Familias de color: agrupan los ~100 tonos del inventario (que a simple vista no
 * se distinguen) en grupos claros. Se usa en los filtros y en "Comprá por color".
 */

export interface ColorFamily {
  key: string;
  name: string;
  hex: string;
}

export const COLOR_FAMILIES: ColorFamily[] = [
  { key: 'negro', name: 'Negro', hex: '#1d1d1b' },
  { key: 'gris', name: 'Gris', hex: '#9aa0a6' },
  { key: 'blanco', name: 'Blanco', hex: '#f2f2ef' },
  { key: 'azul', name: 'Azul', hex: '#26344d' },
  { key: 'verde', name: 'Verde', hex: '#3f7d6e' },
  { key: 'rojo', name: 'Rojo', hex: '#8f2d2d' },
  { key: 'rosa', name: 'Rosa', hex: '#e8a5bf' },
  { key: 'morado', name: 'Morado', hex: '#6a4a8f' },
  { key: 'amarillo', name: 'Amarillo', hex: '#e3c04a' },
  { key: 'naranja', name: 'Naranja', hex: '#d98a3d' },
  { key: 'marron', name: 'Marrón', hex: '#5b4636' },
  { key: 'beige', name: 'Beige', hex: '#d8c3a5' },
];

export const FAMILY_NAME = new Map(COLOR_FAMILIES.map((f) => [f.key, f.name]));
export const FAMILY_HEX = new Map(COLOR_FAMILIES.map((f) => [f.key, f.hex]));

/** Clasifica un hex en una familia por matiz/luminosidad/saturación. */
export function hexToFamily(hex?: string | null): string {
  if (!hex) return 'gris';
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length < 6) return 'gris';
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let hue = 0;
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  if (l < 0.13) return 'negro';
  if (s < 0.12) return l > 0.8 ? 'blanco' : l < 0.3 ? 'negro' : 'gris';
  if (hue < 20 || hue >= 340) return 'rojo';
  if (hue < 45) return l < 0.45 && s < 0.65 ? 'marron' : l > 0.62 ? 'beige' : 'naranja';
  if (hue < 68) return 'amarillo';
  if (hue < 175) return 'verde';
  if (hue < 255) return 'azul';
  if (hue < 300) return 'morado';
  return 'rosa';
}

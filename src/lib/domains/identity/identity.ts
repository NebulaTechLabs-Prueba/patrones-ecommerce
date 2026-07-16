/**
 * Identidad venezolana (§8): cedula o RIF. Puro y testeado.
 *
 * Modelo del storefront:
 *  - Cedula (kind V | E): numerica, 6 a 9 digitos, sin digito verificador.
 *  - RIF (kind J | G | P): 8 digitos base + 1 digito verificador (modulo 11).
 *
 * El algoritmo del RIF usa los coeficientes SENIAT [4,3,2,7,6,5,4,3,2] y el valor
 * del tipo (V=1,E=2,J=3,P=4,G=5). NOTA: confirmar contra SENIAT antes de produccion;
 * la forma del validador (acepta verificador correcto, rechaza el alterado) no cambia.
 */

import type { IdentityDocKind } from '@/lib/data/types';

export interface DocValidation {
  valid: boolean;
  reason?: string;
  /** Forma canonica, p. ej. "V-12345678" o "J-316417158". */
  normalized?: string;
}

const CEDULA_KINDS: ReadonlySet<IdentityDocKind> = new Set(['V', 'E']);
const RIF_KINDS: ReadonlySet<IdentityDocKind> = new Set(['J', 'G', 'P']);

const RIF_COEFFICIENTS = [4, 3, 2, 7, 6, 5, 4, 3, 2] as const;
const RIF_TYPE_VALUE: Record<IdentityDocKind, number> = { V: 1, E: 2, J: 3, P: 4, G: 5 };

/** Solo digitos. */
function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, '');
}

/**
 * Digito verificador de un RIF a partir del tipo y sus 8 digitos base.
 * Devuelve 0..9 (si el resto da 10 u 11, el verificador es 0, regla estandar).
 */
export function rifCheckDigit(kind: IdentityDocKind, base8: string): number {
  const coefHead = RIF_COEFFICIENTS[0] ?? 0;
  let sum = RIF_TYPE_VALUE[kind] * coefHead;
  for (let i = 0; i < 8; i += 1) {
    const digit = Number(base8[i]);
    const coef = RIF_COEFFICIENTS[i + 1] ?? 0;
    sum += digit * coef;
  }
  const resto = 11 - (sum % 11);
  return resto >= 10 ? 0 : resto;
}

function validateCedula(kind: IdentityDocKind, digits: string): DocValidation {
  if (digits.length < 6 || digits.length > 9) {
    return { valid: false, reason: 'La cédula debe tener entre 6 y 9 dígitos.' };
  }
  return { valid: true, normalized: `${kind}-${digits}` };
}

function validateRif(kind: IdentityDocKind, digits: string): DocValidation {
  if (digits.length !== 9) {
    return { valid: false, reason: 'El RIF debe tener 8 dígitos más el verificador.' };
  }
  const base8 = digits.slice(0, 8);
  const provided = Number(digits[8]);
  const expected = rifCheckDigit(kind, base8);
  if (provided !== expected) {
    return { valid: false, reason: 'El dígito verificador del RIF no es válido.' };
  }
  return { valid: true, normalized: `${kind}-${digits}` };
}

/**
 * Valida un documento venezolano segun su tipo. `raw` puede venir con guiones o
 * espacios; se normaliza a digitos.
 */
export function validateDocument(kind: IdentityDocKind, raw: string): DocValidation {
  const digits = digitsOnly(raw);
  if (digits.length === 0) return { valid: false, reason: 'Ingresa el número del documento.' };

  if (CEDULA_KINDS.has(kind)) return validateCedula(kind, digits);
  if (RIF_KINDS.has(kind)) return validateRif(kind, digits);
  return { valid: false, reason: 'Tipo de documento no reconocido.' };
}

/** Un RIF J corresponde a una institucion; el resto, a persona natural (§8). */
export function isInstitutionDoc(kind: IdentityDocKind): boolean {
  return kind === 'J' || kind === 'G';
}

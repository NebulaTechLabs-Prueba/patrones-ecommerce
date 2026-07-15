import { describe, expect, it } from 'vitest';
import { isInstitutionDoc, rifCheckDigit, validateDocument } from './identity';

describe('identity — cédula (V/E)', () => {
  it('acepta una cédula con dígitos válidos y la normaliza', () => {
    expect(validateDocument('V', '18.456.789')).toEqual({ valid: true, normalized: 'V-18456789' });
    expect(validateDocument('E', '1234567')).toMatchObject({ valid: true });
  });

  it('rechaza cédulas demasiado cortas o largas', () => {
    expect(validateDocument('V', '123').valid).toBe(false);
    expect(validateDocument('V', '1234567890').valid).toBe(false);
  });

  it('rechaza el documento vacío', () => {
    expect(validateDocument('V', '   ').valid).toBe(false);
  });
});

describe('identity — RIF (J/G/P) con dígito verificador módulo 11', () => {
  // Verificador calculado con el algoritmo: J + base 31641715 => 8.
  it('calcula el dígito verificador esperado', () => {
    expect(rifCheckDigit('J', '31641715')).toBe(8);
  });

  it('acepta un RIF con verificador correcto', () => {
    expect(validateDocument('J', 'J-31641715-8')).toEqual({
      valid: true,
      normalized: 'J-316417158',
    });
  });

  it('rechaza un RIF con verificador alterado', () => {
    expect(validateDocument('J', 'J-31641715-0').valid).toBe(false);
  });

  it('rechaza un RIF con longitud incorrecta', () => {
    expect(validateDocument('J', '3164171').valid).toBe(false);
  });

  it('acepta/normaliza cualquier separador', () => {
    const check = rifCheckDigit('P', '12345678');
    expect(validateDocument('P', `P${'12345678'}${check}`).valid).toBe(true);
  });
});

describe('identity — tipo de comprador (§8)', () => {
  it('un RIF J o G es institución', () => {
    expect(isInstitutionDoc('J')).toBe(true);
    expect(isInstitutionDoc('G')).toBe(true);
    expect(isInstitutionDoc('V')).toBe(false);
    expect(isInstitutionDoc('P')).toBe(false);
  });
});

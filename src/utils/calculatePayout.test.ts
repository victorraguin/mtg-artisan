import { describe, it, expect } from 'vitest';
import { calculatePayout, type CommissionRule } from './calculatePayout';

describe('calculatePayout', () => {
  const rules: CommissionRule[] = [
    { scope: 'global', rate: 0.1, fixedFee: 1, currency: 'EUR', is_active: true },
    { scope: 'product', rate: 0.2, fixedFee: 0, currency: 'EUR', is_active: true },
  ];

  it('calcule les commissions de la plateforme et de l\'ambassadeur', () => {
    const res = calculatePayout(100, 'product', rules, 0.05);
    expect(res.commissionPlatform).toBe(20);
    expect(res.commissionAmbassador).toBe(5);
    expect(res.net).toBe(75);
  });

  it('revient à la règle globale lorsque la portée spécifique manque', () => {
    const res = calculatePayout(50, 'service', rules);
    expect(res.commissionPlatform).toBeCloseTo(50 * 0.1 + 1);
    expect(res.commissionAmbassador).toBe(0);
    expect(res.net).toBeCloseTo(50 - (50 * 0.1 + 1));
  });

  it('lève une erreur si aucune règle active', () => {
    expect(() => calculatePayout(100, 'product', [])).toThrow();
  });
});

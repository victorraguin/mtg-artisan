export interface CommissionRule {
  scope: 'global' | 'product' | 'service';
  rate: number; // p. ex. 0,10
  fixedFee: number;
  currency: string;
  is_active: boolean;
}

export function calculatePayout(
  gross: number,
  scope: 'product' | 'service',
  rules: CommissionRule[],
  ambassadorRate?: number
) {
  const rule =
    rules.find(r => r.scope === scope && r.is_active) ||
    rules.find(r => r.scope === 'global' && r.is_active);
  if (!rule) throw new Error('Aucune règle de commission active trouvée');

  const commissionPlatform = gross * rule.rate + rule.fixedFee;
  const commissionAmbassador = ambassadorRate ? gross * ambassadorRate : 0;
  const net = gross - commissionPlatform - commissionAmbassador;

  return { commissionPlatform, commissionAmbassador, net };
}

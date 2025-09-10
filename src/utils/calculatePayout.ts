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

  // NOUVEAU SYSTÈME : Commission prélevée sur la plateforme
  // Le créateur garde toujours le même montant, peu importe le parrainage
  
  const totalPlatformCommission = gross * rule.rate + rule.fixedFee;
  const commissionAmbassador = ambassadorRate ? gross * ambassadorRate : 0;
  
  // La commission ambassadeur est prélevée sur la commission plateforme
  const commissionPlatform = Math.max(0, totalPlatformCommission - commissionAmbassador);
  
  // Le créateur garde toujours le même montant (pas d'incitation à l'auto-parrainage)
  const net = gross - totalPlatformCommission;

  return { 
    commissionPlatform, 
    commissionAmbassador, 
    net,
    // Informations supplémentaires pour debug/transparence
    totalPlatformCommission,
    creatorAlwaysGets: net // Le créateur gagne toujours ce montant
  };
}

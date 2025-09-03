import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface CommissionRule {
  scope: 'global' | 'product' | 'service';
  rate: number;
  fixed_fee: number;
  currency: string;
  is_active: boolean;
}

function calculatePayout(
  gross: number,
  scope: 'product' | 'service',
  rules: CommissionRule[],
  ambassadorRate?: number
) {
  const rule =
    rules.find((r) => r.scope === scope && r.is_active) ||
    rules.find((r) => r.scope === 'global' && r.is_active);
  if (!rule) throw new Error('Aucune règle de commission active trouvée');
  const commissionPlatform = gross * rule.rate + rule.fixed_fee;
  const commissionAmbassador = ambassadorRate ? gross * ambassadorRate : 0;
  const net = gross - commissionPlatform - commissionAmbassador;
  return { commissionPlatform, commissionAmbassador, net };
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const event = await req.json();
  const { orderId, items } = event;

  const { data: rules } = await supabase
    .from('commissions')
    .select('*')
    .eq('is_active', true);

  for (const item of items) {
    const { commissionPlatform, commissionAmbassador, net } = calculatePayout(
      item.subtotal,
      item.type,
      rules as CommissionRule[],
      item.ambassadorRate
    );

    await supabase.from('payouts').insert({
      shop_id: item.shopId,
      order_id: orderId,
      gross_amount: item.subtotal,
      commission_platform: commissionPlatform,
      commission_ambassador: commissionAmbassador,
      net_amount: net,
      currency: item.currency,
      status: 'en_attente',
    });
  }

  return new Response('ok', { status: 200 });
});

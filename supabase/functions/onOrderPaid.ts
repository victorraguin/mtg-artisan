import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const event = await req.json();
  const { orderId, buyerId, sellerId, amount, currency, ambassadorRate } = event;

  const { data: settings } = await supabase
    .from('platform_settings')
    .select('*')
    .single();

  const commissionPlatform = amount * (settings?.platform_commission_rate || 0);
  const commissionAmbassador = ambassadorRate
    ? amount * ambassadorRate
    : amount * (settings?.ambassador_commission_rate || 0);
  const net = amount - commissionPlatform - commissionAmbassador;
  const autoRelease = new Date();
  autoRelease.setDate(autoRelease.getDate() + (settings?.auto_release_days || 7));

  await supabase.from('escrows').insert({
    order_id: orderId,
    buyer_id: buyerId,
    seller_id: sellerId,
    gross_amount: amount,
    commission_platform: commissionPlatform,
    commission_ambassador: commissionAmbassador,
    net_amount: net,
    currency,
    status: 'held',
    auto_release_at: autoRelease.toISOString(),
  });

  return new Response('ok', { status: 200 });
});

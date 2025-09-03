import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: pending } = await supabase
    .from('payouts')
    .select('id, shop_id, net_amount, currency, shops!inner(paypal_email)')
    .eq('status', 'en_attente');

  if (pending) {
    for (const p of pending) {
      // Appel fictif à l'API PayPal Payouts
      const response = await fetch('https://api.paypal.com/v1/payments/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get('PAYPAL_TOKEN')}`,
        },
        body: JSON.stringify({
          sender_batch_header: { email_subject: 'Virement de ManaShop' },
          items: [
            {
              recipient_type: 'EMAIL',
              amount: { value: p.net_amount, currency: p.currency },
              receiver: p.shops.paypal_email,
            },
          ],
        }),
      });

      const result = await response.json();
      await supabase
        .from('payouts')
        .update({
          status: 'en_traitement',
          paypal_payout_batch_id: result.batch_header?.payout_batch_id || null,
        })
        .eq('id', p.id);
    }
  }

  return new Response('ok', { status: 200 });
});

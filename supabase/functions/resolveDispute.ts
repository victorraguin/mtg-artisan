import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { disputeId, decision } = await req.json();

  const { data: dispute } = await supabase
    .from('disputes')
    .select('id, escrow_id, escrows(order_id)')
    .eq('id', disputeId)
    .single();

  if (!dispute) return new Response('litige introuvable', { status: 404 });

  const fnUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/releaseEscrow`;

  if (decision === 'refund_buyer') {
    await supabase
      .from('escrows')
      .update({ status: 'refunded', released_at: new Date().toISOString() })
      .eq('id', dispute.escrow_id);
    await supabase
      .from('disputes')
      .update({ status: 'refunded', resolved_at: new Date().toISOString() })
      .eq('id', disputeId);
  } else if (decision === 'pay_seller') {
    await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ orderId: dispute.escrows.order_id }),
    });
    await supabase
      .from('disputes')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', disputeId);
  } else if (decision === 'split') {
    await supabase
      .from('disputes')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', disputeId);
  }

  return new Response('litige traité', { status: 200 });
});

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { orderId, buyerId, reason } = await req.json();
  const { data: escrow } = await supabase
    .from('escrows')
    .select('id')
    .eq('order_id', orderId)
    .single();

  if (!escrow) return new Response('escrow introuvable', { status: 404 });

  const { data: dispute } = await supabase
    .from('disputes')
    .insert({ escrow_id: escrow.id, opened_by: buyerId, reason })
    .select()
    .single();

  await supabase
    .from('escrows')
    .update({ status: 'dispute' })
    .eq('id', escrow.id);

  return new Response(JSON.stringify(dispute), { status: 200 });
});

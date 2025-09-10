import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: escrows } = await supabase
    .from('escrows')
    .select('order_id')
    .eq('status', 'delivered')
    .lte('auto_release_at', new Date().toISOString());

  const fnUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/releaseEscrow`;
  for (const e of escrows || []) {
    await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ orderId: e.order_id }),
    });
  }

  return new Response('auto-libération effectuée', { status: 200 });
});

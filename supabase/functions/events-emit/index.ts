import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const body = await req.json();
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error } = await supabase.from('notification_events').insert({
    name: body.name,
    actor_id: body.actorId,
    target_user_ids: body.targetUserIds,
    shop_id: body.shopId,
    order_id: body.orderId,
    payload: body.payload,
    idempotency_key: body.idempotencyKey
  });
  if (error) return new Response(error.message, { status: 400 });
  return new Response(null, { status: 202 });
});

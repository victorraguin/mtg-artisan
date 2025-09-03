import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: deliveries } = await supabase.from('notification_deliveries').select('*').eq('status', 'queued').limit(50);
  if (!deliveries) return new Response('no deliveries', { status: 200 });
  for (const d of deliveries) {
    // TODO: implement actual sending via provider
    await supabase.from('notification_deliveries').update({ status: 'sent', attempts: d.attempts + 1 }).eq('id', d.id);
  }
  return new Response('ok');
});

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { orderId } = await req.json();

  const { data: settings } = await supabase
    .from('platform_settings')
    .select('*')
    .single();

  const autoRelease = new Date();
  autoRelease.setDate(autoRelease.getDate() + (settings?.auto_release_days || 7));

  await supabase
    .from('escrows')
    .update({ status: 'delivered', auto_release_at: autoRelease.toISOString() })
    .eq('order_id', orderId);

  return new Response('marqué livré', { status: 200 });
});

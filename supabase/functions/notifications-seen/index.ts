import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, req.headers.get('Authorization')!.replace('Bearer ', ''));
  const body = await req.json();
  const ids: string[] = body.ids;
  await supabase.from('notifications').update({ seen_at: new Date().toISOString() }).in('id', ids);
  return new Response('ok');
});

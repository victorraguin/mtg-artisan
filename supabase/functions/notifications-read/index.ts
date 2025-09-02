import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Missing Authorization header', { status: 401 });
  }
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, authHeader.replace('Bearer ', ''));
  const body = await req.json();
  const ids: string[] = body.ids;
  await supabase.from('notifications').update({ read_at: new Date().toISOString() }).in('id', ids);
  return new Response('ok');
});

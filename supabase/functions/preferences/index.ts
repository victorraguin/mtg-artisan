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
  const { error } = await supabase.from('notification_preferences').upsert(body);
  if (error) return new Response(error.message, { status: 400 });
  return new Response('ok');
});

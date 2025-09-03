import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { disputeId, senderId, message } = await req.json();
  await supabase.from('dispute_messages').insert({
    dispute_id: disputeId,
    sender_id: senderId,
    message,
  });

  return new Response('message enregistré', { status: 200 });
});

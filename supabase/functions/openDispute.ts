import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Gestion CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Répondre aux requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { orderId, buyerId, reason } = await req.json();
    
    if (!orderId || !buyerId || !reason) {
      return new Response(JSON.stringify({ error: 'orderId, buyerId et reason requis' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { data: escrow } = await supabase
      .from('escrows')
      .select('id')
      .eq('order_id', orderId)
      .single();

    if (!escrow) {
      return new Response(JSON.stringify({ error: 'escrow introuvable' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { data: dispute } = await supabase
      .from('disputes')
      .insert({ escrow_id: escrow.id, opened_by: buyerId, reason })
      .select()
      .single();

    await supabase
      .from('escrows')
      .update({ status: 'dispute' })
      .eq('id', escrow.id);

    return new Response(JSON.stringify(dispute), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Erreur dans openDispute:', error);
    return new Response(JSON.stringify({ error: 'erreur interne' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

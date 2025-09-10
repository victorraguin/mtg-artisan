import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

async function paypalAccessToken(): Promise<string> {
  const creds = btoa(
    `${Deno.env.get('PAYPAL_CLIENT')}:${Deno.env.get('PAYPAL_SECRET')}`,
  );
  const res = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token as string;
}

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

    const { orderId } = await req.json();
    
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId requis' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { data: escrow } = await supabase
      .from('escrows')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (!escrow) {
      return new Response(JSON.stringify({ error: 'escrow introuvable' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Vérifier si l'escrow peut être libéré
    if (escrow.status !== 'delivered' && escrow.status !== 'held') {
      return new Response(JSON.stringify({ error: 'escrow déjà traité' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Simuler la libération (pour le développement)
    // En production, vous voudrez probablement intégrer PayPal
    await supabase
      .from('escrows')
      .update({ status: 'released', released_at: new Date().toISOString() })
      .eq('order_id', orderId);

    return new Response(JSON.stringify({ message: 'libéré avec succès' }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Erreur dans releaseEscrow:', error);
    return new Response(JSON.stringify({ error: 'erreur interne' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

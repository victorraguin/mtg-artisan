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

    let { data: escrow } = await supabase
      .from('escrows')
      .select('id')
      .eq('order_id', orderId)
      .single();

    // Si l'escrow n'existe pas, le créer
    if (!escrow) {
      // Récupérer les informations de la commande
      const { data: order } = await supabase
        .from('orders')
        .select('user_id, total, currency')
        .eq('id', orderId)
        .single();

      if (!order) {
        return new Response(JSON.stringify({ error: 'commande introuvable' }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Récupérer le vendeur (premier shop de la commande)
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('shop_id, shops!inner(owner_id)')
        .eq('order_id', orderId)
        .limit(1)
        .single();

      if (!orderItems) {
        return new Response(JSON.stringify({ error: 'articles de commande introuvables' }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Créer l'escrow avec des valeurs par défaut
      const { data: newEscrow } = await supabase
        .from('escrows')
        .insert({
          order_id: orderId,
          buyer_id: order.user_id,
          seller_id: orderItems.shops.owner_id,
          gross_amount: order.total,
          commission_platform: order.total * 0.05, // 5% par défaut
          commission_ambassador: 0,
          net_amount: order.total * 0.95,
          currency: order.currency,
          status: 'held',
          auto_release_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
        })
        .select('id')
        .single();

      escrow = newEscrow;
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

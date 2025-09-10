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

    const { disputeId, userId, resolutionType, message } = await req.json();
    
    if (!disputeId || !userId || !resolutionType) {
      return new Response(JSON.stringify({ error: 'disputeId, userId et resolutionType requis' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Vérifier que l'utilisateur peut agir sur ce litige
    const { data: canAct } = await supabase.rpc('can_user_act_on_dispute', {
      dispute_uuid: disputeId,
      user_uuid: userId
    });

    if (!canAct) {
      return new Response(JSON.stringify({ error: 'Non autorisé à agir sur ce litige' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Récupérer les informations du litige
    const { data: dispute } = await supabase
      .from('disputes')
      .select(`
        *,
        escrow:escrows(
          *,
          seller_id,
          buyer_id
        )
      `)
      .eq('id', disputeId)
      .single();

    if (!dispute) {
      return new Response(JSON.stringify({ error: 'Litige introuvable' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Déterminer qui fait la demande
    const isRequestedByBuyer = userId === dispute.opened_by;
    const isRequestedBySeller = userId === dispute.escrow.seller_id;

    // Enregistrer l'action
    await supabase
      .from('dispute_resolution_actions')
      .insert({
        dispute_id: disputeId,
        user_id: userId,
        action_type: 'request_closure',
        resolution_type: resolutionType,
        message: message
      });

    // Cas spécial: si le vendeur accepte explicitement un remboursement,
    // on clôture immédiatement et on rembourse l'acheteur, sans attendre une approbation côté acheteur
    if (isRequestedBySeller && resolutionType === 'refund_buyer') {
      // Mettre à jour l'escrow (remboursement)
      await supabase
        .from('escrows')
        .update({
          status: 'refunded',
          released_at: new Date().toISOString()
        })
        .eq('id', dispute.escrow_id);

      // Mettre à jour le litige (résolu)
      await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          seller_approved_closure: true,
          buyer_approved_closure: true
        })
        .eq('id', disputeId);

      return new Response(JSON.stringify({
        message: 'Remboursement accepté par le vendeur: litige résolu et fonds remboursés',
        newStatus: 'resolved',
        resolution: 'refund_buyer'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Mettre à jour le statut du litige (flux habituel)
    let newStatus = 'pending_admin_review';
    if (isRequestedByBuyer) {
      newStatus = 'pending_seller_closure';
    } else if (isRequestedBySeller) {
      newStatus = 'pending_buyer_closure';
    }

    await supabase
      .from('disputes')
      .update({ 
        status: newStatus,
        resolution_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
      })
      .eq('id', disputeId);

    return new Response(JSON.stringify({ 
      message: 'Demande de fermeture envoyée',
      newStatus: newStatus
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Erreur dans requestDisputeClosure:', error);
    return new Response(JSON.stringify({ error: 'erreur interne' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

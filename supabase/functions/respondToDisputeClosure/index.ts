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

    const { disputeId, userId, approved, message } = await req.json();
    
    if (!disputeId || !userId || approved === undefined) {
      return new Response(JSON.stringify({ error: 'disputeId, userId et approved requis' }), { 
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

    // Déterminer qui répond
    const isRespondingBuyer = userId === dispute.opened_by;
    const isRespondingSeller = userId === dispute.escrow.seller_id;

    // Enregistrer l'action
    await supabase
      .from('dispute_resolution_actions')
      .insert({
        dispute_id: disputeId,
        user_id: userId,
        action_type: approved ? 'approve_closure' : 'reject_closure',
        message: message
      });

    if (!approved) {
      // Si rejeté, escalader vers l'admin
      await supabase
        .from('disputes')
        .update({ 
          status: 'pending_admin_review'
        })
        .eq('id', disputeId);

      return new Response(JSON.stringify({ 
        message: 'Fermeture rejetée, escaladé vers un administrateur',
        newStatus: 'pending_admin_review'
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Si approuvé, mettre à jour les flags d'approbation
    const updateData: any = {};
    if (isRespondingBuyer) {
      updateData.buyer_approved_closure = true;
    } else if (isRespondingSeller) {
      updateData.seller_approved_closure = true;
    }

    await supabase
      .from('disputes')
      .update(updateData)
      .eq('id', disputeId);

    // Vérifier si les deux parties ont approuvé
    const { data: updatedDispute } = await supabase
      .from('disputes')
      .select('buyer_approved_closure, seller_approved_closure')
      .eq('id', disputeId)
      .single();

    if (updatedDispute?.buyer_approved_closure && updatedDispute?.seller_approved_closure) {
      // Les deux parties ont approuvé, résoudre automatiquement
      // Récupérer la dernière action de résolution pour connaître le type
      const { data: lastAction } = await supabase
        .from('dispute_resolution_actions')
        .select('resolution_type')
        .eq('dispute_id', disputeId)
        .eq('action_type', 'request_closure')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const resolutionType = lastAction?.resolution_type || 'refund_buyer';

      // Appliquer la résolution
      if (resolutionType === 'refund_buyer') {
        await supabase
          .from('escrows')
          .update({ 
            status: 'refunded', 
            released_at: new Date().toISOString() 
          })
          .eq('id', dispute.escrow_id);
      } else if (resolutionType === 'pay_seller') {
        await supabase
          .from('escrows')
          .update({ 
            status: 'released', 
            released_at: new Date().toISOString() 
          })
          .eq('id', dispute.escrow_id);
      }

      await supabase
        .from('disputes')
        .update({ 
          status: 'resolved', 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', disputeId);

      return new Response(JSON.stringify({ 
        message: 'Litige résolu par accord mutuel',
        newStatus: 'resolved',
        resolution: resolutionType
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ 
      message: 'Approbation enregistrée, en attente de l\'autre partie',
      newStatus: dispute.status
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Erreur dans respondToDisputeClosure:', error);
    return new Response(JSON.stringify({ error: 'erreur interne' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

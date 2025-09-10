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

    const { disputeId, adminId, resolutionType, adminNotes } = await req.json();
    
    if (!disputeId || !adminId || !resolutionType) {
      return new Response(JSON.stringify({ error: 'disputeId, adminId et resolutionType requis' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Vérifier que l'utilisateur est admin
    const { data: admin } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single();

    if (!admin || admin.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Accès admin requis' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Récupérer les informations du litige
    const { data: dispute } = await supabase
      .from('disputes')
      .select(`
        *,
        escrow:escrows(*)
      `)
      .eq('id', disputeId)
      .single();

    if (!dispute) {
      return new Response(JSON.stringify({ error: 'Litige introuvable' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Enregistrer l'action admin
    await supabase
      .from('dispute_resolution_actions')
      .insert({
        dispute_id: disputeId,
        user_id: adminId,
        action_type: 'admin_resolve',
        resolution_type: resolutionType,
        message: adminNotes
      });

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
    } else if (resolutionType === 'split_payment') {
      // Pour le split, on pourrait implémenter une logique plus complexe
      // Pour l'instant, on marque comme résolu sans libérer l'escrow
      await supabase
        .from('escrows')
        .update({ 
          status: 'resolved', 
          released_at: new Date().toISOString() 
        })
        .eq('id', dispute.escrow_id);
    }

    // Marquer le litige comme résolu
    await supabase
      .from('disputes')
      .update({ 
        status: 'resolved', 
        resolved_at: new Date().toISOString(),
        admin_notes: adminNotes
      })
      .eq('id', disputeId);

    return new Response(JSON.stringify({ 
      message: 'Litige résolu par l\'administrateur',
      resolution: resolutionType
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Erreur dans adminResolveDispute:', error);
    return new Response(JSON.stringify({ error: 'erreur interne' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

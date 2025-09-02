import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fanoutEvent, Preference } from "../_shared/notifications.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insérer l'événement
    const { error } = await supabase.from("notification_events").insert({
      name: body.name,
      actor_id: body.actorId,
      target_user_ids: body.targetUserIds,
      shop_id: body.shopId,
      order_id: body.orderId,
      payload: body.payload,
      idempotency_key: body.idempotencyKey,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Traiter immédiatement l'événement pour créer les notifications
    try {
      // Récupérer les préférences des utilisateurs cibles
      const prefs: Record<string, Preference[]> = {};
      for (const userId of body.targetUserIds) {
        const { data } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", userId);
        prefs[userId] = (data as Preference[]) || [];
      }

      // Traiter l'événement avec fanoutEvent
      const result = fanoutEvent(
        {
          name: body.name,
          actorId: body.actorId,
          targetUserIds: body.targetUserIds,
          shopId: body.shopId,
          orderId: body.orderId,
          payload: body.payload,
          idempotencyKey: body.idempotencyKey,
        },
        prefs
      );

      // Créer les notifications
      if (result.notifications.length) {
        const { data: insertedNotifications, error: notifError } =
          await supabase
            .from("notifications")
            .insert(
              result.notifications.map((n) => ({
                user_id: n.userId,
                category: n.category,
                event_name: n.eventName,
                title: n.title,
                body: n.body,
                action_url: n.actionUrl,
                icon: n.icon,
                payload: n.payload,
              }))
            )
            .select("id,user_id");

        if (notifError) {
          console.error("Error creating notifications:", notifError);
        }

        // Créer les deliveries si nécessaire
        if (result.deliveries.length && insertedNotifications) {
          const notificationIdMap: Record<string, string> = {};
          for (const notif of insertedNotifications) {
            notificationIdMap[notif.user_id] = notif.id;
          }

          await supabase.from("notification_deliveries").insert(
            result.deliveries.map((d) => ({
              user_id: d.userId,
              channel: d.channel,
              status: "queued",
              notification_id: notificationIdMap[d.userId],
            }))
          );
        }
      }
    } catch (fanoutError) {
      console.error("Error processing event:", fanoutError);
      // Ne pas faire échouer la requête si le fanout échoue
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 202,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

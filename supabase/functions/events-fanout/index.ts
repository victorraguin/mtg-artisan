import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fanoutEvent, Preference } from '../_shared/notifications.ts';

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: events } = await supabase.from('notification_events').select('*').limit(10);
  if (!events) return new Response('no events', { status: 200 });
  for (const event of events) {
    const prefs: Record<string, Preference[]> = {};
    for (const userId of event.target_user_ids) {
      const { data } = await supabase.from('notification_preferences').select('*').eq('user_id', userId);
      prefs[userId] = data as Preference[] || [];
    }
    const result = fanoutEvent({
      name: event.name,
      actorId: event.actor_id,
      targetUserIds: event.target_user_ids,
      shopId: event.shop_id,
      orderId: event.order_id,
      payload: event.payload,
      idempotencyKey: event.idempotency_key
    }, prefs);

    let notificationIdMap: Record<string, number> = {};
    if (result.notifications.length) {
      const { data: insertedNotifications } = await supabase.from('notifications').insert(result.notifications.map(n => ({
        user_id: n.userId,
        category: n.category,
        event_name: n.eventName,
        title: event.name
      }))).select('id,user_id');
      // Build a map from userId to notificationId
      if (insertedNotifications) {
        for (const notif of insertedNotifications) {
          notificationIdMap[notif.user_id] = notif.id;
        }
      }
    }
    if (result.deliveries.length) {
      await supabase.from('notification_deliveries').insert(result.deliveries.map(d => ({
        user_id: d.userId,
        channel: d.channel,
        status: 'queued',
        notification_id: notificationIdMap[d.userId]
      })));
    }
  }
  return new Response('ok');
});

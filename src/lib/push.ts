import supabase from './supabase';

export async function registerPush(userId: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  const reg = await navigator.serviceWorker.register('/sw.js');
  const subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: import.meta.env.VITE_VAPID_KEY });
  const { endpoint, keys } = subscription.toJSON();
  await supabase.from('push_subscriptions').insert({
    user_id: userId,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth
  });
}

import supabase from './supabase';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPush(userId: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  const reg = await navigator.serviceWorker.register('/sw.js');
  const applicationServerKey = urlBase64ToUint8Array(import.meta.env.VITE_VAPID_KEY);
  const subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
  const { endpoint, keys } = subscription.toJSON();
  await supabase.from('push_subscriptions').insert({
    user_id: userId,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth
  });
}

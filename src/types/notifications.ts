export type NotificationCategory = 'orders' | 'messages' | 'reviews' | 'shop' | 'system';
export type NotificationChannel = 'inapp' | 'email' | 'push' | 'webhook';
export type DeliveryStatus = 'queued' | 'sending' | 'sent' | 'failed' | 'suppressed';
export type DigestFrequency = 'immediate' | 'daily' | 'weekly';

export interface Notification {
  id: string;
  user_id: string;
  category: NotificationCategory;
  event_name: string;
  title: string;
  body: string | null;
  action_url: string | null;
  icon: string | null;
  payload: Record<string, any> | null;
  seen_at: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreference {
  user_id: string;
  category: NotificationCategory;
  channel: NotificationChannel;
  enabled: boolean;
  digest_frequency: DigestFrequency;
}

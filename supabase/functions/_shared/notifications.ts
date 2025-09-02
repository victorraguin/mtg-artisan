export type NotificationCategory = 'orders' | 'messages' | 'reviews' | 'shop' | 'system';
export type NotificationChannel = 'inapp' | 'email' | 'push' | 'webhook';
export type DigestFrequency = 'immediate' | 'daily' | 'weekly';

export interface NotificationEvent {
  name: string;
  actorId?: string;
  targetUserIds: string[];
  shopId?: string;
  orderId?: string;
  payload?: Record<string, any>;
  idempotencyKey?: string;
}

export interface Preference {
  category: NotificationCategory;
  channel: NotificationChannel;
  enabled: boolean;
}

export interface FanoutResult {
  notifications: Array<{ userId: string; category: NotificationCategory; eventName: string }>;
  deliveries: Array<{ userId: string; channel: NotificationChannel }>;
}

const EVENT_MAP: Record<string, { category: NotificationCategory; template: string }> = {
  'order.paid': { category: 'orders', template: 'orderPaid' },
  'order.shipped': { category: 'orders', template: 'orderShipped' },
  'message.new': { category: 'messages', template: 'messageNew' },
  'review.posted': { category: 'reviews', template: 'reviewPosted' },
  'quote.sent': { category: 'shop', template: 'quoteSent' },
  'payout.scheduled': { category: 'shop', template: 'payoutScheduled' }
};

export function resolveCategory(eventName: string): NotificationCategory {
  return EVENT_MAP[eventName]?.category || 'system';
}

export function fanoutEvent(event: NotificationEvent, prefs: Record<string, Preference[]>): FanoutResult {
  const notifications: FanoutResult['notifications'] = [];
  const deliveries: FanoutResult['deliveries'] = [];
  const category = resolveCategory(event.name);

  for (const userId of event.targetUserIds) {
    notifications.push({ userId, category, eventName: event.name });
    const userPrefs = prefs[userId] || [];
    const enabled = (channel: NotificationChannel) => {
      const pref = userPrefs.find(p => p.category === category && p.channel === channel);
      return pref ? pref.enabled : true;
    };
    for (const channel of ['email', 'push', 'webhook'] as NotificationChannel[]) {
      if (enabled(channel)) {
        deliveries.push({ userId, channel });
      }
    }
  }

  return { notifications, deliveries };
}

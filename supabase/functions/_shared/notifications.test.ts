import { describe, it, expect } from 'vitest';
import { fanoutEvent, NotificationEvent, Preference } from './notifications';

describe('fanoutEvent', () => {
  it('creates deliveries for enabled channels', () => {
    const event: NotificationEvent = { name: 'order.paid', targetUserIds: ['u1'] };
    const prefs: Record<string, Preference[]> = {
      u1: [{ category: 'orders', channel: 'email', enabled: true }]
    };
    const result = fanoutEvent(event, prefs);
    expect(result.notifications).toHaveLength(1);
    expect(result.deliveries).toEqual([{ userId: 'u1', channel: 'email' }, { userId: 'u1', channel: 'push' }, { userId: 'u1', channel: 'webhook' }]);
  });

  it('filters disabled channels', () => {
    const event: NotificationEvent = { name: 'message.new', targetUserIds: ['u1'] };
    const prefs: Record<string, Preference[]> = {
      u1: [{ category: 'messages', channel: 'email', enabled: false }]
    };
    const result = fanoutEvent(event, prefs);
    expect(result.deliveries.find(d => d.channel === 'email')).toBeUndefined();
  });
});

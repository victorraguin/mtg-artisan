import React, { useState } from 'react';
import { Play, Send, User, Package, Star, MessageSquare, Settings, AlertTriangle } from 'lucide-react';
import { NotificationService } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const TEST_EVENTS = [
  {
    categoryKey: 'notificationTester.categories.orders',
    icon: Package,
    color: 'text-blue-500',
    events: [
      {
        name: 'order.paid',
        labelKey: 'notificationTester.events.orderPaid.label',
        descriptionKey: 'notificationTester.events.orderPaid.description',
        payload: { orderId: 'ORD-123', total: 89.99, currency: 'EUR', buyerName: 'Alice Dupont' }
      },
      {
        name: 'order.shipped',
        labelKey: 'notificationTester.events.orderShipped.label',
        descriptionKey: 'notificationTester.events.orderShipped.description',
        payload: { orderId: 'ORD-123', trackingNumber: 'FR123456789', shopName: 'ArtMaster Studio' }
      },
      {
        name: 'alter.commissioned',
        labelKey: 'notificationTester.events.alterCommissioned.label',
        descriptionKey: 'notificationTester.events.alterCommissioned.description',
        payload: { cardName: 'Lightning Bolt', artistName: 'Marie Artisan', orderId: 'ALT-456' }
      },
      {
        name: 'token.ready',
        labelKey: 'notificationTester.events.tokenReady.label',
        descriptionKey: 'notificationTester.events.tokenReady.description',
        payload: { tokenName: 'Goblin Token Set', orderId: 'TOK-789' }
      }
    ]
  },
  {
    categoryKey: 'notificationTester.categories.services',
    icon: User,
    color: 'text-green-500',
    events: [
      {
        name: 'coaching.scheduled',
        labelKey: 'notificationTester.events.coachingScheduled.label',
        descriptionKey: 'notificationTester.events.coachingScheduled.description',
        payload: { coachName: 'Pro Player', date: '2024-02-15', time: '19:00' }
      },
      {
        name: 'deckbuilding.completed',
        labelKey: 'notificationTester.events.deckbuildingCompleted.label',
        descriptionKey: 'notificationTester.events.deckbuildingCompleted.description',
        payload: { format: 'Modern Burn', builderName: 'DeckMaster', orderId: 'DECK-321' }
      }
    ]
  },
  {
    categoryKey: 'notificationTester.categories.messages',
    icon: MessageSquare,
    color: 'text-purple-500',
    events: [
      {
        name: 'message.new',
        labelKey: 'notificationTester.events.messageNew.label',
        descriptionKey: 'notificationTester.events.messageNew.description',
        payload: { senderName: 'Bob Collectionneur' }
      },
      {
        name: 'message.commission_request',
        labelKey: 'notificationTester.events.messageCommissionRequest.label',
        descriptionKey: 'notificationTester.events.messageCommissionRequest.description',
        payload: { buyerName: 'Sarah Magic' }
      }
    ]
  },
  {
    categoryKey: 'notificationTester.categories.reviews',
    icon: Star,
    color: 'text-yellow-500',
    events: [
      {
        name: 'review.posted',
        labelKey: 'notificationTester.events.reviewPosted.label',
        descriptionKey: 'notificationTester.events.reviewPosted.description',
        payload: { reviewerName: 'Client Satisfait', rating: 5, productName: 'Alter Lightning Bolt' }
      }
    ]
  },
  {
    categoryKey: 'notificationTester.categories.shop',
    icon: Settings,
    color: 'text-orange-500',
    events: [
      {
        name: 'shop.verified',
        labelKey: 'notificationTester.events.shopVerified.label',
        descriptionKey: 'notificationTester.events.shopVerified.description',
        payload: { shopName: 'Mon Atelier MTG' }
      },
      {
        name: 'product.low_stock',
        labelKey: 'notificationTester.events.productLowStock.label',
        descriptionKey: 'notificationTester.events.productLowStock.description',
        payload: { productName: 'Playmat Dragon', stock: 2 }
      },
      {
        name: 'payout.completed',
        labelKey: 'notificationTester.events.payoutCompleted.label',
        descriptionKey: 'notificationTester.events.payoutCompleted.description',
        payload: { amount: 250.5, currency: 'EUR' }
      }
    ]
  },
  {
    categoryKey: 'notificationTester.categories.system',
    icon: AlertTriangle,
    color: 'text-red-500',
    events: [
      {
        name: 'system.update',
        labelKey: 'notificationTester.events.systemUpdate.label',
        descriptionKey: 'notificationTester.events.systemUpdate.description',
        payload: {}
      },
      {
        name: 'account.login_new_device',
        labelKey: 'notificationTester.events.accountLoginNewDevice.label',
        descriptionKey: 'notificationTester.events.accountLoginNewDevice.description',
        payload: { device: 'iPhone 15', location: 'Paris, France' }
      }
    ]
  }
];

export function NotificationTester() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className="p-6 bg-card border border-border rounded-lg">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t('notificationTester.noUser.title')}
        </h3>
        <p className="text-muted-foreground">
          {t('notificationTester.noUser.message')}
        </p>
      </div>
    );
  }

  const handleSendNotification = async (eventName: string, payload: any) => {
    if (!user?.id) return;

    setIsLoading(eventName);
    try {
      await NotificationService.emitEvent(eventName, [user.id], payload);
      toast.success(t('notificationTester.toast.success', { eventName }));
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(t('notificationTester.toast.error'));
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center space-x-2">
          <Play className="w-5 h-5 text-primary" />
          <span>{t('notificationTester.header.title')}</span>
        </h3>
        <p className="text-muted-foreground text-sm">
          {t('notificationTester.header.description')}
        </p>
      </div>

      <div className="space-y-6">
        {TEST_EVENTS.map((category) => (
          <div key={category.categoryKey} className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center space-x-2">
              <category.icon className={`w-4 h-4 ${category.color}`} />
              <span>{t(category.categoryKey)}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.events.map((event) => (
                <div
                  key={event.name}
                  className="p-4 border border-border rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-foreground text-sm">
                        {t(event.labelKey)}
                      </h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t(event.descriptionKey)}
                      </p>
                      <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded mt-2 inline-block">
                        {event.name}
                      </code>
                    </div>

                    <button
                      onClick={() => handleSendNotification(event.name, event.payload)}
                      disabled={isLoading === event.name}
                      className="ml-3 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title={t('notificationTester.sendButton.title')}
                    >
                      {isLoading === event.name ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted/30 border border-border rounded-lg">
        <h5 className="font-medium text-foreground text-sm mb-2">
          {t('notificationTester.instructions.title')}
        </h5>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>
            • {t('notificationTester.instructions.items.sendButton.part1')} <Send className="w-3 h-3 inline" /> {t('notificationTester.instructions.items.sendButton.part2')}
          </li>
          <li>
            • {t('notificationTester.instructions.items.bellAppearance')}
          </li>
          <li>
            • {t('notificationTester.instructions.items.toastConfirmation')}
          </li>
          <li>
            • {t('notificationTester.instructions.items.testCategories')}
          </li>
          <li>
            • {t('notificationTester.instructions.items.persistence')}
          </li>
        </ul>
      </div>
    </div>
  );
}

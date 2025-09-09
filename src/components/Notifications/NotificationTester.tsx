import React, { useState } from 'react';
import { Play, Send, User, Package, Star, MessageSquare, Settings, AlertTriangle } from 'lucide-react';
import { NotificationService } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const TEST_EVENTS = [
  {
    category: 'Orders',
    icon: Package,
    color: 'text-blue-500',
    events: [
      {
        name: 'order.paid',
        label: 'Order paid',
        description: 'Simulate a successfully paid order',
        payload: { orderId: 'ORD-123', total: 89.99, currency: 'EUR', buyerName: 'Alice Smith' }
      },
      {
        name: 'order.shipped',
        label: 'Order shipped',
        description: 'Simulate a shipped order',
        payload: { orderId: 'ORD-123', trackingNumber: 'FR123456789', shopName: 'ArtMaster Studio' }
      },
      {
        name: 'alter.commissioned',
        label: 'Alter commissioned',
        description: 'Simulate an MTG alter order',
        payload: { cardName: 'Lightning Bolt', artistName: 'Mary Artisan', orderId: 'ALT-456' }
      },
      {
        name: 'token.ready',
        label: 'Tokens ready',
        description: 'Simulate custom tokens ready',
        payload: { tokenName: 'Goblin Token Set', orderId: 'TOK-789' }
      }
    ]
  },
  {
    category: 'Services',
    icon: User,
    color: 'text-green-500',
    events: [
      {
        name: 'coaching.scheduled',
        label: 'Coaching scheduled',
        description: 'Simulate a scheduled coaching session',
        payload: { coachName: 'Pro Player', date: '2024-02-15', time: '19:00' }
      },
      {
        name: 'deckbuilding.completed',
        label: 'Deck completed',
        description: 'Simulate a finished deck build',
        payload: { format: 'Modern Burn', builderName: 'DeckMaster', orderId: 'DECK-321' }
      }
    ]
  },
  {
    category: 'Messages',
    icon: MessageSquare,
    color: 'text-purple-500',
    events: [
      {
        name: 'message.new',
        label: 'New message',
        description: 'Simulate a new message received',
        payload: { senderName: 'Bob Collector' }
      },
      {
        name: 'message.commission_request',
        label: 'Commission request',
        description: 'Simulate a custom commission request',
        payload: { buyerName: 'Sarah Magic' }
      }
    ]
  },
  {
    category: 'Reviews',
    icon: Star,
    color: 'text-yellow-500',
    events: [
      {
        name: 'review.posted',
        label: 'New review',
        description: 'Simulate a new customer review',
        payload: { reviewerName: 'Happy Customer', rating: 5, productName: 'Alter Lightning Bolt' }
      }
    ]
  },
  {
    category: 'Shop',
    icon: Settings,
    color: 'text-orange-500',
    events: [
      {
        name: 'shop.verified',
        label: 'Shop verified',
        description: 'Simulate a shop verification',
        payload: { shopName: 'My MTG Workshop' }
      },
      {
        name: 'product.low_stock',
        label: 'Low stock',
        description: 'Simulate a low stock alert',
        payload: { productName: 'Playmat Dragon', stock: 2 }
      },
      {
        name: 'payout.completed',
        label: 'Payout received',
        description: 'Simulate a received payout',
        payload: { amount: 250.50, currency: 'EUR' }
      }
    ]
  },
  {
    category: 'System',
    icon: AlertTriangle,
    color: 'text-red-500',
    events: [
      {
        name: 'system.update',
        label: 'System update',
        description: 'Simulate a system update notification',
        payload: {}
      },
      {
        name: 'account.login_new_device',
        label: 'New login',
        description: 'Simulate a login from a new device',
        payload: { device: 'iPhone 15', location: 'Paris, France' }
      }
    ]
  }
];

export function NotificationTester() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="p-6 bg-card border border-border rounded-lg">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Notification Tester
        </h3>
        <p className="text-muted-foreground">
          You must be logged in to test notifications.
        </p>
      </div>
    );
  }

  const handleSendNotification = async (eventName: string, payload: any) => {
    if (!user?.id) return;
    
    setIsLoading(eventName);
    try {
      await NotificationService.emitEvent(eventName, [user.id], payload);
      toast.success(`Notification "${eventName}" sent successfully!`);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Error sending notification');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center space-x-2">
          <Play className="w-5 h-5 text-primary" />
          <span>MTG Artisan Notification Tester</span>
        </h3>
        <p className="text-muted-foreground text-sm">
          Test the different types of notifications in the app. Notifications will appear in the bell at the top right and as toasts.
        </p>
      </div>

      <div className="space-y-6">
        {TEST_EVENTS.map((category) => (
          <div key={category.category} className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center space-x-2">
              <category.icon className={`w-4 h-4 ${category.color}`} />
              <span>{category.category}</span>
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
                        {event.label}
                      </h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.description}
                      </p>
                      <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded mt-2 inline-block">
                        {event.name}
                      </code>
                    </div>
                    
                    <button
                      onClick={() => handleSendNotification(event.name, event.payload)}
                      disabled={isLoading === event.name}
                      className="ml-3 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Send this notification"
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
        <h5 className="font-medium text-foreground text-sm mb-2">💡 Instructions</h5>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Click the <Send className="w-3 h-3 inline" /> button to send a test notification</li>
          <li>• Notifications will appear in the notification bell at the top right</li>
          <li>• A confirmation toast will also appear</li>
          <li>• You can test the different categories and event types</li>
          <li>• Notifications are persistent and remain visible even after refresh</li>
        </ul>
      </div>
    </div>
  );
}

export type NotificationCategory =
  | "orders"
  | "messages"
  | "reviews"
  | "shop"
  | "system";
export type NotificationChannel = "inapp" | "email" | "push" | "webhook";
export type DigestFrequency = "immediate" | "daily" | "weekly";

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
  notifications: Array<{
    userId: string;
    category: NotificationCategory;
    eventName: string;
  }>;
  deliveries: Array<{ userId: string; channel: NotificationChannel }>;
}

const EVENT_MAP: Record<
  string,
  { category: NotificationCategory; template: string }
> = {
  // Événements de commandes
  "order.created": { category: "orders", template: "orderCreated" },
  "order.paid": { category: "orders", template: "orderPaid" },
  "order.processing": { category: "orders", template: "orderProcessing" },
  "order.shipped": { category: "orders", template: "orderShipped" },
  "order.delivered": { category: "orders", template: "orderDelivered" },
  "order.completed": { category: "orders", template: "orderCompleted" },
  "order.cancelled": { category: "orders", template: "orderCancelled" },
  "order.refunded": { category: "orders", template: "orderRefunded" },

  // Événements spécifiques aux produits MTG
  "alter.commissioned": { category: "orders", template: "alterCommissioned" },
  "alter.progress_update": {
    category: "orders",
    template: "alterProgressUpdate",
  },
  "alter.completed": { category: "orders", template: "alterCompleted" },
  "token.ready": { category: "orders", template: "tokenReady" },
  "playmat.shipped": { category: "orders", template: "playmatShipped" },

  // Événements de services
  "coaching.scheduled": { category: "orders", template: "coachingScheduled" },
  "coaching.reminder": { category: "orders", template: "coachingReminder" },
  "deckbuilding.started": {
    category: "orders",
    template: "deckbuildingStarted",
  },
  "deckbuilding.completed": {
    category: "orders",
    template: "deckbuildingCompleted",
  },

  // Événements de messages
  "message.new": { category: "messages", template: "messageNew" },
  "message.commission_request": {
    category: "messages",
    template: "commissionRequest",
  },
  "message.quote_request": { category: "messages", template: "quoteRequest" },

  // Événements d'avis
  "review.posted": { category: "reviews", template: "reviewPosted" },
  "review.reply": { category: "reviews", template: "reviewReply" },

  // Événements de boutique
  "shop.verified": { category: "shop", template: "shopVerified" },
  "shop.suspended": { category: "shop", template: "shopSuspended" },
  "product.low_stock": { category: "shop", template: "productLowStock" },
  "product.out_of_stock": { category: "shop", template: "productOutOfStock" },
  "quote.sent": { category: "shop", template: "quoteSent" },
  "quote.accepted": { category: "shop", template: "quoteAccepted" },
  "quote.declined": { category: "shop", template: "quoteDeclined" },
  "payout.scheduled": { category: "shop", template: "payoutScheduled" },
  "payout.completed": { category: "shop", template: "payoutCompleted" },

  // Événements système
  "system.maintenance": { category: "system", template: "systemMaintenance" },
  "system.update": { category: "system", template: "systemUpdate" },
  "account.security_alert": { category: "system", template: "securityAlert" },
  "account.login_new_device": {
    category: "system",
    template: "loginNewDevice",
  },
};

export function resolveCategory(eventName: string): NotificationCategory {
  return EVENT_MAP[eventName]?.category || "system";
}

export function fanoutEvent(
  event: NotificationEvent,
  prefs: Record<string, Preference[]>
): FanoutResult {
  const notifications: FanoutResult["notifications"] = [];
  const deliveries: FanoutResult["deliveries"] = [];
  const category = resolveCategory(event.name);
  const template = EVENT_MAP[event.name]?.template || "default";

  for (const userId of event.targetUserIds) {
    const userPrefs = prefs[userId] || [];
    const enabled = (channel: NotificationChannel) => {
      const pref = userPrefs.find(
        (p) => p.category === category && p.channel === channel
      );
      return pref ? pref.enabled : true;
    };

    // Vérifier si les notifications in-app sont activées pour cette catégorie
    const inAppEnabled = enabled("inapp");
    
    // Créer la notification seulement si les notifications in-app sont activées
    if (inAppEnabled) {
      // Générer le contenu de la notification basé sur l'événement
      const notificationContent = generateNotificationContent(
        event.name,
        event.payload
      );

      notifications.push({
        userId,
        category,
        eventName: event.name,
        title: notificationContent.title,
        body: notificationContent.body,
        icon: notificationContent.icon,
        actionUrl: notificationContent.actionUrl,
        payload: event.payload,
      });
    }

    // Créer les deliveries pour les autres canaux (email, push, webhook)
    for (const channel of [
      "email",
      "push",
      "webhook",
    ] as NotificationChannel[]) {
      if (enabled(channel)) {
        deliveries.push({ userId, channel });
      }
    }
  }

  return { notifications, deliveries };
}

function generateNotificationContent(
  eventName: string,
  payload: any
): {
  title: string;
  body: string;
  icon: string;
  actionUrl?: string;
} {
  switch (eventName) {
    case "order.paid":
      return {
        title: "💳 Commande payée",
        body: `Votre commande ${payload?.orderId || "N/A"} a été payée (${
          payload?.total || 0
        }${payload?.currency || "€"})`,
        icon: "💳",
      };
    case "alter.commissioned":
      return {
        title: "🎨 Alter commandé",
        body: `Votre alter ${payload?.cardName || "N/A"} a été commandé par ${
          payload?.artistName || "un artiste"
        }`,
        icon: "🎨",
      };
    case "product.low_stock":
      return {
        title: "⚠️ Stock faible",
        body: `Plus que ${payload?.stock || 0} exemplaires de ${
          payload?.productName || "ce produit"
        }`,
        icon: "⚠️",
      };
    case "shop.verified":
      return {
        title: "✅ Boutique vérifiée",
        body: `Votre boutique ${
          payload?.shopName || "N/A"
        } est maintenant vérifiée`,
        icon: "✅",
      };
    case "message.new":
      return {
        title: "💬 Nouveau message",
        body: `${payload?.senderName || "Quelqu'un"} vous a envoyé un message`,
        icon: "💬",
      };
    default:
      return {
        title: `📢 ${eventName}`,
        body: "Vous avez une nouvelle notification",
        icon: "📢",
      };
  }
}

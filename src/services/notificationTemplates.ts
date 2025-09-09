import { NotificationCategory } from "../types/notifications";
import i18n from "../lib/i18n";

// Templates de notifications spécifiques à MTG Artisan
export interface NotificationTemplate {
  key: string;
  category: NotificationCategory;
  titleKey: string;
  bodyKey: string;
  icon?: string;
  actionUrl?: string;
}

// Mapping des événements vers les templates
export const MTG_EVENT_MAP: Record<
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

// Templates de notifications
export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  // Templates de commandes
  orderCreated: {
    key: "orderCreated",
    category: "orders",
    titleKey: "notifications.templates.orderCreated.title",
    bodyKey: "notifications.templates.orderCreated.body",
    icon: "📦",
    actionUrl: "/dashboard/creator?tab=orders",
  },

  orderPaid: {
    key: "orderPaid",
    category: "orders",
    titleKey: "notifications.templates.orderPaid.title",
    bodyKey: "notifications.templates.orderPaid.body",
    icon: "💳",
    actionUrl: "/dashboard/buyer",
  },

  orderProcessing: {
    key: "orderProcessing",
    category: "orders",
    titleKey: "notifications.templates.orderProcessing.title",
    bodyKey: "notifications.templates.orderProcessing.body",
    icon: "⚙️",
    actionUrl: "/dashboard/buyer",
  },

  orderShipped: {
    key: "orderShipped",
    category: "orders",
    titleKey: "notifications.templates.orderShipped.title",
    bodyKey: "notifications.templates.orderShipped.body",
    icon: "🚚",
    actionUrl: "/dashboard/buyer",
  },

  orderDelivered: {
    key: "orderDelivered",
    category: "orders",
    titleKey: "notifications.templates.orderDelivered.title",
    bodyKey: "notifications.templates.orderDelivered.body",
    icon: "✅",
    actionUrl: "/dashboard/buyer",
  },

  orderCompleted: {
    key: "orderCompleted",
    category: "orders",
    titleKey: "notifications.templates.orderCompleted.title",
    bodyKey: "notifications.templates.orderCompleted.body",
    icon: "🎉",
    actionUrl: "/dashboard/buyer",
  },

  orderCancelled: {
    key: "orderCancelled",
    category: "orders",
    titleKey: "notifications.templates.orderCancelled.title",
    bodyKey: "notifications.templates.orderCancelled.body",
    icon: "❌",
    actionUrl: "/dashboard/buyer",
  },

  // Templates spécifiques MTG
  alterCommissioned: {
    key: "alterCommissioned",
    category: "orders",
    titleKey: "notifications.templates.alterCommissioned.title",
    bodyKey: "notifications.templates.alterCommissioned.body",
    icon: "🎨",
    actionUrl: "/dashboard/buyer",
  },

  alterProgressUpdate: {
    key: "alterProgressUpdate",
    category: "orders",
    titleKey: "notifications.templates.alterProgressUpdate.title",
    bodyKey: "notifications.templates.alterProgressUpdate.body",
    icon: "🖌️",
    actionUrl: "/dashboard/buyer",
  },

  alterCompleted: {
    key: "alterCompleted",
    category: "orders",
    titleKey: "notifications.templates.alterCompleted.title",
    bodyKey: "notifications.templates.alterCompleted.body",
    icon: "🎨",
    actionUrl: "/dashboard/buyer",
  },

  tokenReady: {
    key: "tokenReady",
    category: "orders",
    titleKey: "notifications.templates.tokenReady.title",
    bodyKey: "notifications.templates.tokenReady.body",
    icon: "🪙",
    actionUrl: "/dashboard/buyer",
  },

  playmatShipped: {
    key: "playmatShipped",
    category: "orders",
    titleKey: "notifications.templates.playmatShipped.title",
    bodyKey: "notifications.templates.playmatShipped.body",
    icon: "🎯",
    actionUrl: "/dashboard/buyer",
  },

  // Templates de services
  coachingScheduled: {
    key: "coachingScheduled",
    category: "orders",
    titleKey: "notifications.templates.coachingScheduled.title",
    bodyKey: "notifications.templates.coachingScheduled.body",
    icon: "📚",
    actionUrl: "/dashboard/buyer",
  },

  coachingReminder: {
    key: "coachingReminder",
    category: "orders",
    titleKey: "notifications.templates.coachingReminder.title",
    bodyKey: "notifications.templates.coachingReminder.body",
    icon: "⏰",
    actionUrl: "/dashboard/buyer",
  },

  deckbuildingStarted: {
    key: "deckbuildingStarted",
    category: "orders",
    titleKey: "notifications.templates.deckbuildingStarted.title",
    bodyKey: "notifications.templates.deckbuildingStarted.body",
    icon: "🃏",
    actionUrl: "/dashboard/buyer",
  },

  deckbuildingCompleted: {
    key: "deckbuildingCompleted",
    category: "orders",
    titleKey: "notifications.templates.deckbuildingCompleted.title",
    bodyKey: "notifications.templates.deckbuildingCompleted.body",
    icon: "🎴",
    actionUrl: "/dashboard/buyer",
  },

  // Templates de messages
  messageNew: {
    key: "messageNew",
    category: "messages",
    titleKey: "notifications.templates.messageNew.title",
    bodyKey: "notifications.templates.messageNew.body",
    icon: "💬",
    actionUrl: "/messages",
  },

  commissionRequest: {
    key: "commissionRequest",
    category: "messages",
    titleKey: "notifications.templates.commissionRequest.title",
    bodyKey: "notifications.templates.commissionRequest.body",
    icon: "🎨",
    actionUrl: "/messages",
  },

  quoteRequest: {
    key: "quoteRequest",
    category: "messages",
    titleKey: "notifications.templates.quoteRequest.title",
    bodyKey: "notifications.templates.quoteRequest.body",
    icon: "📄",
    actionUrl: "/messages",
  },

  // Templates d'avis
  reviewPosted: {
    key: "reviewPosted",
    category: "reviews",
    titleKey: "notifications.templates.reviewPosted.title",
    bodyKey: "notifications.templates.reviewPosted.body",
    icon: "⭐",
    actionUrl: "/dashboard/creator?tab=reviews",
  },

  reviewReply: {
    key: "reviewReply",
    category: "reviews",
    titleKey: "notifications.templates.reviewReply.title",
    bodyKey: "notifications.templates.reviewReply.body",
    icon: "💬",
    actionUrl: "/dashboard/buyer",
  },

  // Templates de boutique
  shopVerified: {
    key: "shopVerified",
    category: "shop",
    titleKey: "notifications.templates.shopVerified.title",
    bodyKey: "notifications.templates.shopVerified.body",
    icon: "✅",
    actionUrl: "/dashboard/creator",
  },

  shopSuspended: {
    key: "shopSuspended",
    category: "shop",
    titleKey: "notifications.templates.shopSuspended.title",
    bodyKey: "notifications.templates.shopSuspended.body",
    icon: "⚠️",
    actionUrl: "/dashboard/creator",
  },

  productLowStock: {
    key: "productLowStock",
    category: "shop",
    titleKey: "notifications.templates.productLowStock.title",
    bodyKey: "notifications.templates.productLowStock.body",
    icon: "⚠️",
    actionUrl: "/dashboard/creator?tab=products",
  },

  productOutOfStock: {
    key: "productOutOfStock",
    category: "shop",
    titleKey: "notifications.templates.productOutOfStock.title",
    bodyKey: "notifications.templates.productOutOfStock.body",
    icon: "🚫",
    actionUrl: "/dashboard/creator?tab=products",
  },

  quoteSent: {
    key: "quoteSent",
    category: "shop",
    titleKey: "notifications.templates.quoteSent.title",
    bodyKey: "notifications.templates.quoteSent.body",
    icon: "📄",
    actionUrl: "/dashboard/creator?tab=quotes",
  },

  quoteAccepted: {
    key: "quoteAccepted",
    category: "shop",
    titleKey: "notifications.templates.quoteAccepted.title",
    bodyKey: "notifications.templates.quoteAccepted.body",
    icon: "✅",
    actionUrl: "/dashboard/creator?tab=orders",
  },

  quoteDeclined: {
    key: "quoteDeclined",
    category: "shop",
    titleKey: "notifications.templates.quoteDeclined.title",
    bodyKey: "notifications.templates.quoteDeclined.body",
    icon: "❌",
    actionUrl: "/dashboard/creator?tab=quotes",
  },

  payoutScheduled: {
    key: "payoutScheduled",
    category: "shop",
    titleKey: "notifications.templates.payoutScheduled.title",
    bodyKey: "notifications.templates.payoutScheduled.body",
    icon: "💰",
    actionUrl: "/dashboard/creator?tab=payouts",
  },

  payoutCompleted: {
    key: "payoutCompleted",
    category: "shop",
    titleKey: "notifications.templates.payoutCompleted.title",
    bodyKey: "notifications.templates.payoutCompleted.body",
    icon: "💳",
    actionUrl: "/dashboard/creator?tab=payouts",
  },

  // Templates système
  systemMaintenance: {
    key: "systemMaintenance",
    category: "system",
    titleKey: "notifications.templates.systemMaintenance.title",
    bodyKey: "notifications.templates.systemMaintenance.body",
    icon: "🔧",
    actionUrl: "/",
  },

  systemUpdate: {
    key: "systemUpdate",
    category: "system",
    titleKey: "notifications.templates.systemUpdate.title",
    bodyKey: "notifications.templates.systemUpdate.body",
    icon: "🚀",
    actionUrl: "/",
  },

  securityAlert: {
    key: "securityAlert",
    category: "system",
    titleKey: "notifications.templates.securityAlert.title",
    bodyKey: "notifications.templates.securityAlert.body",
    icon: "🔒",
    actionUrl: "/profile/security",
  },

  loginNewDevice: {
    key: "loginNewDevice",
    category: "system",
    titleKey: "notifications.templates.loginNewDevice.title",
    bodyKey: "notifications.templates.loginNewDevice.body",
    icon: "📱",
    actionUrl: "/profile/security",
  },
};

// Fonction pour résoudre une catégorie d'événement
export function resolveCategory(eventName: string): NotificationCategory {
  return MTG_EVENT_MAP[eventName]?.category || "system";
}

// Fonction pour obtenir un template
export function getTemplate(templateKey: string): NotificationTemplate | null {
  return NOTIFICATION_TEMPLATES[templateKey] || null;
}

// Fonction pour formater un message avec des variables
export function formatNotificationMessage(
  template: NotificationTemplate,
  variables: Record<string, any>,
  language?: string
): { title: string; body: string; icon?: string; actionUrl?: string } {
  const t = i18n.getFixedT(language, "notifications");
  const title = t(template.titleKey, variables);
  const body = t(template.bodyKey, variables);
  let actionUrl = template.actionUrl;

  if (actionUrl) {
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      actionUrl = actionUrl!.replace(new RegExp(placeholder, "g"), String(value));
    });
  }

  return {
    title,
    body,
    icon: template.icon,
    actionUrl,
  };
}

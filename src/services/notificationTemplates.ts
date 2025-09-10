import { NotificationCategory } from "../types/notifications";

// Templates de notifications spécifiques à MTG Artisan
export interface NotificationTemplate {
  key: string;
  category: NotificationCategory;
  title: string;
  body: string;
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

// Templates de notifications en français
export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  // Templates de commandes
  orderCreated: {
    key: "orderCreated",
    category: "orders",
    title: "Nouvelle commande reçue",
    body: "Vous avez reçu une nouvelle commande #{orderId} de {buyerName}",
    icon: "📦",
    actionUrl: "/dashboard/creator?tab=orders",
  },

  orderPaid: {
    key: "orderPaid",
    category: "orders",
    title: "Commande payée",
    body: "Votre commande #{orderId} a été payée avec succès. Montant: {total} {currency}",
    icon: "💳",
    actionUrl: "/dashboard/buyer",
  },

  orderProcessing: {
    key: "orderProcessing",
    category: "orders",
    title: "Commande en cours de traitement",
    body: "Votre commande #{orderId} est maintenant en cours de traitement par {shopName}",
    icon: "⚙️",
    actionUrl: "/dashboard/buyer",
  },

  orderShipped: {
    key: "orderShipped",
    category: "orders",
    title: "Commande expédiée",
    body: "Votre commande #{orderId} a été expédiée. Numéro de suivi: {trackingNumber}",
    icon: "🚚",
    actionUrl: "/dashboard/buyer",
  },

  orderDelivered: {
    key: "orderDelivered",
    category: "orders",
    title: "Commande livrée",
    body: "Votre commande #{orderId} a été livrée avec succès !",
    icon: "✅",
    actionUrl: "/dashboard/buyer",
  },

  orderCompleted: {
    key: "orderCompleted",
    category: "orders",
    title: "Commande terminée",
    body: "Votre commande #{orderId} est maintenant terminée. N'hésitez pas à laisser un avis !",
    icon: "🎉",
    actionUrl: "/dashboard/buyer",
  },

  orderCancelled: {
    key: "orderCancelled",
    category: "orders",
    title: "Commande annulée",
    body: "Votre commande #{orderId} a été annulée. Vous serez remboursé sous 3-5 jours ouvrés.",
    icon: "❌",
    actionUrl: "/dashboard/buyer",
  },

  // Templates spécifiques MTG
  alterCommissioned: {
    key: "alterCommissioned",
    category: "orders",
    title: "Alter commandé",
    body: 'Votre alter de "{cardName}" a été commandé avec succès ! L\'artiste {artistName} va commencer le travail.',
    icon: "🎨",
    actionUrl: "/dashboard/buyer",
  },

  alterProgressUpdate: {
    key: "alterProgressUpdate",
    category: "orders",
    title: "Mise à jour de votre alter",
    body: 'L\'artiste {artistName} a mis à jour le statut de votre alter "{cardName}": {status}',
    icon: "🖌️",
    actionUrl: "/dashboard/buyer",
  },

  alterCompleted: {
    key: "alterCompleted",
    category: "orders",
    title: "Votre alter est terminé !",
    body: 'L\'alter de "{cardName}" par {artistName} est maintenant terminé et prêt à être expédié !',
    icon: "🎨",
    actionUrl: "/dashboard/buyer",
  },

  tokenReady: {
    key: "tokenReady",
    category: "orders",
    title: "Vos tokens sont prêts",
    body: 'Vos tokens personnalisés "{tokenName}" sont prêts à télécharger !',
    icon: "🪙",
    actionUrl: "/dashboard/buyer",
  },

  playmatShipped: {
    key: "playmatShipped",
    category: "orders",
    title: "Playmat expédié",
    body: 'Votre playmat personnalisé "{playmatName}" a été expédié ! Suivi: {trackingNumber}',
    icon: "🎯",
    actionUrl: "/dashboard/buyer",
  },

  // Templates de services
  coachingScheduled: {
    key: "coachingScheduled",
    category: "orders",
    title: "Session de coaching programmée",
    body: "Votre session de coaching avec {coachName} est programmée pour le {date} à {time}",
    icon: "📚",
    actionUrl: "/dashboard/buyer",
  },

  coachingReminder: {
    key: "coachingReminder",
    category: "orders",
    title: "Rappel: Session de coaching",
    body: "Votre session de coaching avec {coachName} commence dans 1 heure",
    icon: "⏰",
    actionUrl: "/dashboard/buyer",
  },

  deckbuildingStarted: {
    key: "deckbuildingStarted",
    category: "orders",
    title: "Construction de deck commencée",
    body: "{builderName} a commencé à travailler sur votre deck {format}",
    icon: "🃏",
    actionUrl: "/dashboard/buyer",
  },

  deckbuildingCompleted: {
    key: "deckbuildingCompleted",
    category: "orders",
    title: "Votre deck est prêt !",
    body: "Votre deck {format} par {builderName} est maintenant terminé et disponible !",
    icon: "🎴",
    actionUrl: "/dashboard/buyer",
  },

  // Templates de messages
  messageNew: {
    key: "messageNew",
    category: "messages",
    title: "Nouveau message",
    body: "{senderName} vous a envoyé un nouveau message",
    icon: "💬",
    actionUrl: "/messages",
  },

  commissionRequest: {
    key: "commissionRequest",
    category: "messages",
    title: "Demande de commission",
    body: "{buyerName} souhaite vous commander une œuvre personnalisée",
    icon: "🎨",
    actionUrl: "/messages",
  },

  quoteRequest: {
    key: "quoteRequest",
    category: "messages",
    title: "Demande de devis",
    body: '{buyerName} demande un devis pour "{serviceName}"',
    icon: "📄",
    actionUrl: "/messages",
  },

  // Templates d'avis
  reviewPosted: {
    key: "reviewPosted",
    category: "reviews",
    title: "Nouvel avis reçu",
    body: '{reviewerName} a laissé un avis {rating}/5 sur "{productName}"',
    icon: "⭐",
    actionUrl: "/dashboard/creator?tab=reviews",
  },

  reviewReply: {
    key: "reviewReply",
    category: "reviews",
    title: "Réponse à votre avis",
    body: '{shopName} a répondu à votre avis sur "{productName}"',
    icon: "💬",
    actionUrl: "/dashboard/buyer",
  },

  // Templates de boutique
  shopVerified: {
    key: "shopVerified",
    category: "shop",
    title: "Boutique vérifiée !",
    body: 'Félicitations ! Votre boutique "{shopName}" a été vérifiée et dispose maintenant du badge officiel.',
    icon: "✅",
    actionUrl: "/dashboard/creator",
  },

  shopSuspended: {
    key: "shopSuspended",
    category: "shop",
    title: "Boutique suspendue",
    body: "Votre boutique a été temporairement suspendue. Contactez le support pour plus d'informations.",
    icon: "⚠️",
    actionUrl: "/dashboard/creator",
  },

  productLowStock: {
    key: "productLowStock",
    category: "shop",
    title: "Stock faible",
    body: 'Attention ! Il ne reste que {stock} exemplaires de "{productName}" en stock.',
    icon: "⚠️",
    actionUrl: "/dashboard/creator?tab=products",
  },

  productOutOfStock: {
    key: "productOutOfStock",
    category: "shop",
    title: "Rupture de stock",
    body: '"{productName}" est maintenant en rupture de stock. Pensez à réapprovisionner !',
    icon: "🚫",
    actionUrl: "/dashboard/creator?tab=products",
  },

  quoteSent: {
    key: "quoteSent",
    category: "shop",
    title: "Devis envoyé",
    body: 'Votre devis pour "{serviceName}" a été envoyé à {buyerName}',
    icon: "📄",
    actionUrl: "/dashboard/creator?tab=quotes",
  },

  quoteAccepted: {
    key: "quoteAccepted",
    category: "shop",
    title: "Devis accepté !",
    body: '{buyerName} a accepté votre devis pour "{serviceName}". Montant: {amount} {currency}',
    icon: "✅",
    actionUrl: "/dashboard/creator?tab=orders",
  },

  quoteDeclined: {
    key: "quoteDeclined",
    category: "shop",
    title: "Devis décliné",
    body: '{buyerName} a décliné votre devis pour "{serviceName}"',
    icon: "❌",
    actionUrl: "/dashboard/creator?tab=quotes",
  },

  payoutScheduled: {
    key: "payoutScheduled",
    category: "shop",
    title: "Paiement programmé",
    body: "Votre paiement de {amount} {currency} sera traité le {date}",
    icon: "💰",
    actionUrl: "/dashboard/creator?tab=payouts",
  },

  payoutCompleted: {
    key: "payoutCompleted",
    category: "shop",
    title: "Paiement effectué",
    body: "Vous avez reçu un paiement de {amount} {currency} sur votre compte",
    icon: "💳",
    actionUrl: "/dashboard/creator?tab=payouts",
  },

  // Templates système
  systemMaintenance: {
    key: "systemMaintenance",
    category: "system",
    title: "Maintenance programmée",
    body: "MTG Artisan sera en maintenance le {date} de {startTime} à {endTime}",
    icon: "🔧",
    actionUrl: "/",
  },

  systemUpdate: {
    key: "systemUpdate",
    category: "system",
    title: "Nouvelle mise à jour",
    body: "MTG Artisan a été mis à jour avec de nouvelles fonctionnalités ! Découvrez les nouveautés.",
    icon: "🚀",
    actionUrl: "/",
  },

  securityAlert: {
    key: "securityAlert",
    category: "system",
    title: "Alerte de sécurité",
    body: "Activité suspecte détectée sur votre compte. Vérifiez vos paramètres de sécurité.",
    icon: "🔒",
    actionUrl: "/profile/security",
  },

  loginNewDevice: {
    key: "loginNewDevice",
    category: "system",
    title: "Connexion depuis un nouvel appareil",
    body: "Connexion détectée depuis un nouvel appareil: {device} à {location}",
    icon: "📱",
    actionUrl: "/profile/security",
  },
};

// English notification templates
export const NOTIFICATION_TEMPLATES_EN: Record<string, NotificationTemplate> = {
  // Order templates
  orderCreated: {
    key: "orderCreated",
    category: "orders",
    title: "New order received",
    body: "You have received a new order #{orderId} from {buyerName}",
    icon: "📦",
    actionUrl: "/dashboard/creator?tab=orders",
  },
  orderPaid: {
    key: "orderPaid",
    category: "orders",
    title: "Order Paid",
    body: "Your order #{orderId} has been successfully paid. Amount: {total} {currency}",
    icon: "💳",
    actionUrl: "/dashboard/buyer",
  },
  orderProcessing: {
    key: "orderProcessing",
    category: "orders",
    title: "Order Processing",
    body: "Your order #{orderId} is now being processed by {shopName}",
    icon: "⚙️",
    actionUrl: "/dashboard/buyer",
  },
  orderShipped: {
    key: "orderShipped",
    category: "orders",
    title: "Order Shipped",
    body: "Your order #{orderId} has been shipped. Tracking number: {trackingNumber}",
    icon: "🚚",
    actionUrl: "/dashboard/buyer",
  },
  orderDelivered: {
    key: "orderDelivered",
    category: "orders",
    title: "Order Delivered",
    body: "Your order #{orderId} has been successfully delivered!",
    icon: "✅",
    actionUrl: "/dashboard/buyer",
  },
  orderCompleted: {
    key: "orderCompleted",
    category: "orders",
    title: "Order Completed",
    body: "Your order #{orderId} is now complete. Feel free to leave a review!",
    icon: "🎉",
    actionUrl: "/dashboard/buyer",
  },
  orderCancelled: {
    key: "orderCancelled",
    category: "orders",
    title: "Order Cancelled",
    body: "Your order #{orderId} has been cancelled. You will be refunded within 3-5 business days.",
    icon: "❌",
    actionUrl: "/dashboard/buyer",
  },

  // MTG specific templates
  alterCommissioned: {
    key: "alterCommissioned",
    category: "orders",
    title: "Alter Commissioned",
    body: 'Your alter for "{cardName}" has been successfully commissioned! Artist {artistName} will begin the work.',
    icon: "🎨",
    actionUrl: "/dashboard/buyer",
  },
  alterProgressUpdate: {
    key: "alterProgressUpdate",
    category: "orders",
    title: "Update on your alter",
    body: 'Artist {artistName} has updated the status of your alter "{cardName}": {status}',
    icon: "🖌️",
    actionUrl: "/dashboard/buyer",
  },
  alterCompleted: {
    key: "alterCompleted",
    category: "orders",
    title: "Your alter is complete!",
    body: 'The alter for "{cardName}" by {artistName} is now complete and ready for shipment!',
    icon: "🎨",
    actionUrl: "/dashboard/buyer",
  },
  tokenReady: {
    key: "tokenReady",
    category: "orders",
    title: "Your tokens are ready",
    body: 'Your custom tokens "{tokenName}" are ready for download!',
    icon: "🪙",
    actionUrl: "/dashboard/buyer",
  },
  playmatShipped: {
    key: "playmatShipped",
    category: "orders",
    title: "Playmat Shipped",
    body: 'Your custom playmat "{playmatName}" has been shipped! Tracking: {trackingNumber}',
    icon: "🎯",
    actionUrl: "/dashboard/buyer",
  },

  // Service templates
  coachingScheduled: {
    key: "coachingScheduled",
    category: "orders",
    title: "Coaching Session Scheduled",
    body: "Your coaching session with {coachName} is scheduled for {date} at {time}",
    icon: "📚",
    actionUrl: "/dashboard/buyer",
  },
  coachingReminder: {
    key: "coachingReminder",
    category: "orders",
    title: "Reminder: Coaching Session",
    body: "Your coaching session with {coachName} starts in 1 hour",
    icon: "⏰",
    actionUrl: "/dashboard/buyer",
  },
  deckbuildingStarted: {
    key: "deckbuildingStarted",
    category: "orders",
    title: "Deckbuilding Started",
    body: "{builderName} has started working on your {format} deck",
    icon: "🃏",
    actionUrl: "/dashboard/buyer",
  },
  deckbuildingCompleted: {
    key: "deckbuildingCompleted",
    category: "orders",
    title: "Your deck is ready!",
    body: "Your {format} deck by {builderName} is now complete and available!",
    icon: "🎴",
    actionUrl: "/dashboard/buyer",
  },

  // Message templates
  messageNew: {
    key: "messageNew",
    category: "messages",
    title: "New Message",
    body: "{senderName} sent you a new message",
    icon: "💬",
    actionUrl: "/messages",
  },
  commissionRequest: {
    key: "commissionRequest",
    category: "messages",
    title: "Commission Request",
    body: "{buyerName} wants to commission a custom piece from you",
    icon: "🎨",
    actionUrl: "/messages",
  },
  quoteRequest: {
    key: "quoteRequest",
    category: "messages",
    title: "Quote Request",
    body: '{buyerName} is requesting a quote for "{serviceName}"',
    icon: "📄",
    actionUrl: "/messages",
  },

  // Review templates
  reviewPosted: {
    key: "reviewPosted",
    category: "reviews",
    title: "New Review Received",
    body: '{reviewerName} left a {rating}/5 review on "{productName}"',
    icon: "⭐",
    actionUrl: "/dashboard/creator?tab=reviews",
  },
  reviewReply: {
    key: "reviewReply",
    category: "reviews",
    title: "Reply to your review",
    body: '{shopName} replied to your review on "{productName}"',
    icon: "💬",
    actionUrl: "/dashboard/buyer",
  },

  // Shop templates
  shopVerified: {
    key: "shopVerified",
    category: "shop",
    title: "Shop Verified!",
    body: 'Congratulations! Your shop "{shopName}" has been verified and now has the official badge.',
    icon: "✅",
    actionUrl: "/dashboard/creator",
  },
  shopSuspended: {
    key: "shopSuspended",
    category: "shop",
    title: "Shop Suspended",
    body: "Your shop has been temporarily suspended. Contact support for more information.",
    icon: "⚠️",
    actionUrl: "/dashboard/creator",
  },
  productLowStock: {
    key: "productLowStock",
    category: "shop",
    title: "Low Stock",
    body: 'Warning! Only {stock} units of "{productName}" are left in stock.',
    icon: "⚠️",
    actionUrl: "/dashboard/creator?tab=products",
  },
  productOutOfStock: {
    key: "productOutOfStock",
    category: "shop",
    title: "Out of Stock",
    body: '"{productName}" is now out of stock. Consider restocking!',
    icon: "🚫",
    actionUrl: "/dashboard/creator?tab=products",
  },
  quoteSent: {
    key: "quoteSent",
    category: "shop",
    title: "Quote Sent",
    body: 'Your quote for "{serviceName}" has been sent to {buyerName}',
    icon: "📄",
    actionUrl: "/dashboard/creator?tab=quotes",
  },
  quoteAccepted: {
    key: "quoteAccepted",
    category: "shop",
    title: "Quote Accepted!",
    body: '{buyerName} has accepted your quote for "{serviceName}". Amount: {amount} {currency}',
    icon: "✅",
    actionUrl: "/dashboard/creator?tab=orders",
  },
  quoteDeclined: {
    key: "quoteDeclined",
    category: "shop",
    title: "Quote Declined",
    body: '{buyerName} has declined your quote for "{serviceName}"',
    icon: "❌",
    actionUrl: "/dashboard/creator?tab=quotes",
  },
  payoutScheduled: {
    key: "payoutScheduled",
    category: "shop",
    title: "Payout Scheduled",
    body: "Your payout of {amount} {currency} will be processed on {date}",
    icon: "💰",
    actionUrl: "/dashboard/creator?tab=payouts",
  },
  payoutCompleted: {
    key: "payoutCompleted",
    category: "shop",
    title: "Payout Completed",
    body: "You have received a payment of {amount} {currency} in your account",
    icon: "💳",
    actionUrl: "/dashboard/creator?tab=payouts",
  },

  // System templates
  systemMaintenance: {
    key: "systemMaintenance",
    category: "system",
    title: "Scheduled Maintenance",
    body: "MTG Artisan will be undergoing maintenance on {date} from {startTime} to {endTime}",
    icon: "🔧",
    actionUrl: "/",
  },
  systemUpdate: {
    key: "systemUpdate",
    category: "system",
    title: "New Update",
    body: "MTG Artisan has been updated with new features! Check out what's new.",
    icon: "🚀",
    actionUrl: "/",
  },
  securityAlert: {
    key: "securityAlert",
    category: "system",
    title: "Security Alert",
    body: "Suspicious activity detected on your account. Please check your security settings.",
    icon: "🔒",
    actionUrl: "/profile/security",
  },
  loginNewDevice: {
    key: "loginNewDevice",
    category: "system",
    title: "Login from a new device",
    body: "Login detected from a new device: {device} at {location}",
    icon: "📱",
    actionUrl: "/profile/security",
  },
};

// Fonction pour résoudre une catégorie d'événement
export function resolveCategory(eventName: string): NotificationCategory {
  return MTG_EVENT_MAP[eventName]?.category || "system";
}

// Fonction pour obtenir un template
export function getTemplate(
  templateKey: string,
  lang: "fr" | "en" = "fr"
): NotificationTemplate | null {
  const templates =
    lang === "en" ? NOTIFICATION_TEMPLATES_EN : NOTIFICATION_TEMPLATES;
  return templates[templateKey] || null;
}

// Fonction pour formater un message avec des variables
export function formatNotificationMessage(
  template: NotificationTemplate,
  variables: Record<string, any>
): { title: string; body: string; icon?: string; actionUrl?: string } {
  let title = template.title;
  let body = template.body;
  let actionUrl = template.actionUrl;

  // Remplacer les variables dans le titre et le corps
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    title = title.replace(new RegExp(placeholder, "g"), String(value));
    body = body.replace(new RegExp(placeholder, "g"), String(value));
    if (actionUrl) {
      actionUrl = actionUrl.replace(
        new RegExp(placeholder, "g"),
        String(value)
      );
    }
  });

  return {
    title,
    body,
    icon: template.icon,
    actionUrl,
  };
}

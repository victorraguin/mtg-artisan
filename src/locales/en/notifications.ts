export default {
  templates: {
    orderCreated: {
      title: "New order received",
      body: "You have received a new order #{{orderId}} from {{buyerName}}",
    },
    orderPaid: {
      title: "Order paid",
      body: "Your order #{{orderId}} has been paid successfully. Amount: {{total}} {{currency}}",
    },
    orderProcessing: {
      title: "Order processing",
      body: "Your order #{{orderId}} is now being processed by {{shopName}}",
    },
    orderShipped: {
      title: "Order shipped",
      body: "Your order #{{orderId}} has been shipped. Tracking number: {{trackingNumber}}",
    },
    orderDelivered: {
      title: "Order delivered",
      body: "Your order #{{orderId}} has been delivered successfully!",
    },
    orderCompleted: {
      title: "Order completed",
      body: "Your order #{{orderId}} is now complete. Feel free to leave a review!",
    },
    orderCancelled: {
      title: "Order cancelled",
      body: "Your order #{{orderId}} has been cancelled. You will be refunded within 3-5 business days.",
    },
    alterCommissioned: {
      title: "Alter commissioned",
      body: "Your alter of \"{{cardName}}\" has been commissioned successfully! Artist {{artistName}} will start working.",
    },
    alterProgressUpdate: {
      title: "Alter progress update",
      body: "Artist {{artistName}} updated the status of your alter \"{{cardName}}\": {{status}}",
    },
    alterCompleted: {
      title: "Your alter is finished!",
      body: "The alter of \"{{cardName}}\" by {{artistName}} is now complete and ready to ship!",
    },
    tokenReady: {
      title: "Your tokens are ready",
      body: "Your custom tokens \"{{tokenName}}\" are ready to download!",
    },
    playmatShipped: {
      title: "Playmat shipped",
      body: "Your custom playmat \"{{playmatName}}\" has shipped! Tracking: {{trackingNumber}}",
    },
    coachingScheduled: {
      title: "Coaching session scheduled",
      body: "Your coaching session with {{coachName}} is scheduled for {{date}} at {{time}}",
    },
    coachingReminder: {
      title: "Reminder: Coaching session",
      body: "Your coaching session with {{coachName}} starts in 1 hour",
    },
    deckbuildingStarted: {
      title: "Deckbuilding started",
      body: "{{builderName}} has started working on your {{format}} deck",
    },
    deckbuildingCompleted: {
      title: "Your deck is ready!",
      body: "Your {{format}} deck by {{builderName}} is now complete and available!",
    },
    messageNew: {
      title: "New message",
      body: "{{senderName}} sent you a new message",
    },
    commissionRequest: {
      title: "Commission request",
      body: "{{buyerName}} wants to commission a custom piece from you",
    },
    quoteRequest: {
      title: "Quote request",
      body: "{{buyerName}} is requesting a quote for \"{{serviceName}}\"",
    },
    reviewPosted: {
      title: "New review received",
      body: "{{reviewerName}} left a {{rating}}/5 review on \"{{productName}}\"",
    },
    reviewReply: {
      title: "Reply to your review",
      body: "{{shopName}} replied to your review on \"{{productName}}\"",
    },
    shopVerified: {
      title: "Shop verified!",
      body: "Congratulations! Your shop \"{{shopName}}\" has been verified and now has the official badge.",
    },
    shopSuspended: {
      title: "Shop suspended",
      body: "Your shop has been temporarily suspended. Contact support for more information.",
    },
    productLowStock: {
      title: "Low stock",
      body: "Warning! Only {{stock}} copies of \"{{productName}}\" left in stock.",
    },
    productOutOfStock: {
      title: "Out of stock",
      body: "\"{{productName}}\" is now out of stock. Consider restocking!",
    },
    quoteSent: {
      title: "Quote sent",
      body: "Your quote for \"{{serviceName}}\" has been sent to {{buyerName}}",
    },
    quoteAccepted: {
      title: "Quote accepted!",
      body: "{{buyerName}} accepted your quote for \"{{serviceName}}\". Amount: {{amount}} {{currency}}",
    },
    quoteDeclined: {
      title: "Quote declined",
      body: "{{buyerName}} declined your quote for \"{{serviceName}}\"",
    },
    payoutScheduled: {
      title: "Payout scheduled",
      body: "Your payout of {{amount}} {{currency}} will be processed on {{date}}",
    },
    payoutCompleted: {
      title: "Payout completed",
      body: "You have received a payout of {{amount}} {{currency}} to your account",
    },
    systemMaintenance: {
      title: "Scheduled maintenance",
      body: "MTG Artisan will undergo maintenance on {{date}} from {{startTime}} to {{endTime}}",
    },
    systemUpdate: {
      title: "New update",
      body: "MTG Artisan has been updated with new features! Check out the changes.",
    },
    securityAlert: {
      title: "Security alert",
      body: "Suspicious activity detected on your account. Check your security settings.",
    },
    loginNewDevice: {
      title: "Login from a new device",
      body: "Login detected from a new device: {{device}} in {{location}}",
    },
  },
} as const;

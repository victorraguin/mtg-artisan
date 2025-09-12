export default {
  templates: {
    orderCreated: {
      title: "Nouvelle commande reçue",
      body: "Vous avez reçu une nouvelle commande #{{orderId}} de {{buyerName}}",
    },
    orderPaid: {
      title: "Commande payée",
      body: "Votre commande #{{orderId}} a été payée avec succès. Montant: {{total}} {{currency}}",
    },
    orderProcessing: {
      title: "Commande en cours de traitement",
      body: "Votre commande #{{orderId}} est maintenant en cours de traitement par {{shopName}}",
    },
    orderShipped: {
      title: "Commande expédiée",
      body: "Votre commande #{{orderId}} a été expédiée. Numéro de suivi: {{trackingNumber}}",
    },
    orderDelivered: {
      title: "Commande livrée",
      body: "Votre commande #{{orderId}} a été livrée avec succès !",
    },
    orderCompleted: {
      title: "Commande terminée",
      body: "Votre commande #{{orderId}} est maintenant terminée. N'hésitez pas à laisser un avis !",
    },
    orderCancelled: {
      title: "Commande annulée",
      body: "Votre commande #{{orderId}} a été annulée. Vous serez remboursé sous 3-5 jours ouvrés.",
    },
    alterCommissioned: {
      title: "Alter commandé",
      body: "Votre alter de \"{{cardName}}\" a été commandé avec succès ! L'artiste {{artistName}} va commencer le travail.",
    },
    alterProgressUpdate: {
      title: "Mise à jour de votre alter",
      body: "L'artiste {{artistName}} a mis à jour le statut de votre alter \"{{cardName}}\": {{status}}",
    },
    alterCompleted: {
      title: "Votre alter est terminé !",
      body: "L'alter de \"{{cardName}}\" par {{artistName}} est maintenant terminé et prêt à être expédié !",
    },
    tokenReady: {
      title: "Vos tokens sont prêts",
      body: "Vos tokens personnalisés \"{{tokenName}}\" sont prêts à télécharger !",
    },
    playmatShipped: {
      title: "Playmat expédié",
      body: "Votre playmat personnalisé \"{{playmatName}}\" a été expédié ! Suivi: {{trackingNumber}}",
    },
    coachingScheduled: {
      title: "Session de coaching programmée",
      body: "Votre session de coaching avec {{coachName}} est programmée pour le {{date}} à {{time}}",
    },
    coachingReminder: {
      title: "Rappel: Session de coaching",
      body: "Votre session de coaching avec {{coachName}} commence dans 1 heure",
    },
    deckbuildingStarted: {
      title: "Construction de deck commencée",
      body: "{{builderName}} a commencé à travailler sur votre deck {{format}}",
    },
    deckbuildingCompleted: {
      title: "Votre deck est prêt !",
      body: "Votre deck {{format}} par {{builderName}} est maintenant terminé et disponible !",
    },
    messageNew: {
      title: "Nouveau message",
      body: "{{senderName}} vous a envoyé un nouveau message",
    },
    commissionRequest: {
      title: "Demande de commission",
      body: "{{buyerName}} souhaite vous commander une œuvre personnalisée",
    },
    quoteRequest: {
      title: "Demande de devis",
      body: "{{buyerName}} demande un devis pour \"{{serviceName}}\"",
    },
    reviewPosted: {
      title: "Nouvel avis reçu",
      body: "{{reviewerName}} a laissé un avis {{rating}}/5 sur \"{{productName}}\"",
    },
    reviewReply: {
      title: "Réponse à votre avis",
      body: "{{shopName}} a répondu à votre avis sur \"{{productName}}\"",
    },
    shopVerified: {
      title: "Boutique vérifiée !",
      body: "Félicitations ! Votre boutique \"{{shopName}}\" a été vérifiée et dispose maintenant du badge officiel.",
    },
    shopSuspended: {
      title: "Boutique suspendue",
      body: "Votre boutique a été temporairement suspendue. Contactez le support pour plus d'informations.",
    },
    productLowStock: {
      title: "Stock faible",
      body: "Attention ! Il ne reste que {{stock}} exemplaires de \"{{productName}}\" en stock.",
    },
    productOutOfStock: {
      title: "Rupture de stock",
      body: "\"{{productName}}\" est maintenant en rupture de stock. Pensez à réapprovisionner !",
    },
    quoteSent: {
      title: "Devis envoyé",
      body: "Votre devis pour \"{{serviceName}}\" a été envoyé à {{buyerName}}",
    },
    quoteAccepted: {
      title: "Devis accepté !",
      body: "{{buyerName}} a accepté votre devis pour \"{{serviceName}}\". Montant: {{amount}} {{currency}}",
    },
    quoteDeclined: {
      title: "Devis décliné",
      body: "{{buyerName}} a décliné votre devis pour \"{{serviceName}}\"",
    },
    payoutScheduled: {
      title: "Paiement programmé",
      body: "Votre paiement de {{amount}} {{currency}} sera traité le {{date}}",
    },
    payoutCompleted: {
      title: "Paiement effectué",
      body: "Vous avez reçu un paiement de {{amount}} {{currency}} sur votre compte",
    },
    systemMaintenance: {
      title: "Maintenance programmée",
      body: "MTG Artisan sera en maintenance le {{date}} de {{startTime}} à {{endTime}}",
    },
    systemUpdate: {
      title: "Nouvelle mise à jour",
      body: "MTG Artisan a été mis à jour avec de nouvelles fonctionnalités ! Découvrez les nouveautés.",
    },
    securityAlert: {
      title: "Alerte de sécurité",
      body: "Activité suspecte détectée sur votre compte. Vérifiez vos paramètres de sécurité.",
    },
    loginNewDevice: {
      title: "Connexion depuis un nouvel appareil",
      body: "Connexion détectée depuis un nouvel appareil: {{device}} à {{location}}",
    },
  },
} as const;

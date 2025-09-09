export default {
  notificationTest: {
    title: "Test des Notifications",
    description: "Page de développement pour tester le système de notifications de MTG Artisan.",
    architecture: {
      title: "Architecture du Système",
      dbTables: {
        title: "📊 Tables de Base de Données",
        notificationEvents: "Queue d'événements entrants",
        notifications: "Notifications créées pour les utilisateurs",
        notificationPreferences: "Préférences utilisateur",
        notificationDeliveries: "Tâches de livraison (email, push, etc.)",
        notificationTemplates: "Templates de messages"
      },
      supabaseFunctions: {
        title: "⚙️ Fonctions Supabase",
        eventsEmit: "Émet un événement",
        eventsFanout: "Traite les événements en notifications",
        notificationsRead: "Marque comme lu",
        notificationsSeen: "Marque comme vu",
        preferences: "Gère les préférences"
      },
      dataFlow: {
        title: "🔄 Flux de Données",
        step1: "L'application émet un événement via",
        step2: "L'événement est stocké dans",
        step3Before: "La fonction",
        step3After: "traite les événements",
        step4: "Les notifications sont créées dans",
        step5Before: "Les tâches de livraison sont créées dans",
        step6: "L'interface React s'abonne aux changements en temps réel",
        step7: "Les notifications apparaissent dans la cloche et comme toasts"
      }
    }
  }
};

export default {
  notificationTest: {
    title: "Notifications Test",
    description: "Development page to test MTG Artisan's notification system.",
    architecture: {
      title: "System Architecture",
      dbTables: {
        title: "📊 Database Tables",
        notificationEvents: "Incoming events queue",
        notifications: "Notifications created for users",
        notificationPreferences: "User preferences",
        notificationDeliveries: "Delivery tasks (email, push, etc.)",
        notificationTemplates: "Message templates"
      },
      supabaseFunctions: {
        title: "⚙️ Supabase Functions",
        eventsEmit: "Emits an event",
        eventsFanout: "Processes events into notifications",
        notificationsRead: "Marks as read",
        notificationsSeen: "Marks as seen",
        preferences: "Manages preferences"
      },
      dataFlow: {
        title: "🔄 Data Flow",
        step1: "The application emits an event via",
        step2: "The event is stored in",
        step3Before: "The function",
        step3After: "processes the events",
        step4: "Notifications are created in",
        step5Before: "Delivery tasks are created in",
        step6: "The React interface subscribes to real-time changes",
        step7: "Notifications appear in the bell and as toasts"
      }
    }
  }
};

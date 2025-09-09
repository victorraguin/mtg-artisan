import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import supabase from "../../lib/supabase";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export function DirectNotificationTest() {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const createDirectNotification = async (
    title: string,
    body: string,
    category: string
  ) => {
    try {
      // Utiliser la fonction notifications-direct pour bypasser RLS
      const { error } = await supabase.functions.invoke(
        "notifications-direct",
        {
          body: {
            user_id: user.id,
            category,
            event_name: "test.direct",
            title,
            body,
            icon: "🧪",
          },
        }
      );

      if (error) throw error;
      toast.success(t("debug.directNotificationTest.createSuccess"));
    } catch (error) {
      toast.error(t("debug.directNotificationTest.createError"));
      console.error(error);
    }
  };

  const testNotifications = [
    {
      title: "💳 Commande payée",
      body: "Votre commande TEST-123 a été payée (89.99€)",
      category: "orders",
    },
    {
      title: "🎨 Alter commandé",
      body: "Votre alter Lightning Bolt a été commandé",
      category: "orders",
    },
    {
      title: "⚠️ Stock faible",
      body: "Plus que 2 exemplaires de Test Product",
      category: "shop",
    },
    {
      title: "💬 Nouveau message",
      body: "Test User vous a envoyé un message",
      category: "messages",
    },
    {
      title: "✅ Boutique vérifiée",
      body: "Votre boutique Ma Boutique Test est maintenant vérifiée",
      category: "shop",
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-50">
      <h3 className="text-sm font-medium text-foreground mb-3">
        🔧 Test Direct (sans Edge Function)
      </h3>
      <div className="space-y-2">
        {testNotifications.map((notif, index) => (
          <button
            key={index}
            onClick={() =>
              createDirectNotification(notif.title, notif.body, notif.category)
            }
            className="block w-full text-left text-xs bg-green-500/10 hover:bg-green-500/20 text-green-600 px-3 py-2 rounded transition-colors"
          >
            {notif.title}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        ⚡ Bypass Edge Functions
      </p>
    </div>
  );
}

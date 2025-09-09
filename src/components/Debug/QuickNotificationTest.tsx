import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationService } from "../../services/notificationService";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export function QuickNotificationTest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  if (!user) return null;

  const testNotifications = [
    {
      name: "order.paid",
      label: "💳 Commande payée",
      payload: { orderId: "TEST-123", total: 89.99, currency: "EUR" },
    },
    {
      name: "alter.commissioned",
      label: "🎨 Alter commandé",
      payload: { cardName: "Lightning Bolt", artistName: "Test Artist" },
    },
    {
      name: "product.low_stock",
      label: "⚠️ Stock faible",
      payload: { productName: "Test Product", stock: 2 },
    },
    {
      name: "shop.verified",
      label: "✅ Boutique vérifiée",
      payload: { shopName: "Ma Boutique Test" },
    },
    {
      name: "message.new",
      label: "💬 Nouveau message",
      payload: { senderName: "Test User" },
    },
  ];

  const sendTestNotification = async (
    eventName: string,
    payload: any,
    targetUserIds: string[] = [user.id]
  ) => {
    try {
      await NotificationService.emitEvent(eventName, targetUserIds, payload);
      toast.success(
        t("debug.quickNotificationTest.sendSuccess", {
          eventName,
          count: targetUserIds.length,
        })
      );

      // Forcer la mise à jour des données après un délai
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({
          queryKey: ["notifications", "unread-count"],
        });
        queryClient.refetchQueries({ queryKey: ["notifications"] });
        queryClient.refetchQueries({
          queryKey: ["notifications", "unread-count"],
        });
      }, 1000);
    } catch (error) {
      toast.error(t("debug.quickNotificationTest.sendError"));
      console.error(error);
    }
  };

  const sendCrossUserNotification = async () => {
    // Récupérer quelques utilisateurs pour le test cross-user
    const prompt = window.prompt(
      "Entrez l'ID d'un autre utilisateur (ou laissez vide pour vous-même):"
    );
    const targetId = prompt?.trim() || user.id;

    await sendTestNotification(
      "message.new",
      {
        senderName: user.email,
        message: "Test de notification cross-utilisateur !",
      },
      [targetId]
    );
  };

  const testMarkAllAsRead = async () => {
    try {
      const { NotificationService } = await import(
        "../../services/notificationService"
      );
      await NotificationService.markAllAsRead();
      toast.success(t("debug.quickNotificationTest.markAllSuccess"));
    } catch (error) {
      toast.error(t("debug.quickNotificationTest.markAllError"));
      console.error(error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-50 max-w-xs">
      <h3 className="text-sm font-medium text-foreground mb-3">
        🧪 Test Notifications (Edge Functions)
      </h3>
      <div className="space-y-2">
        {testNotifications.map((notif) => (
          <button
            key={notif.name}
            onClick={() => sendTestNotification(notif.name, notif.payload)}
            className="block w-full text-left text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded transition-colors"
          >
            {notif.label}
          </button>
        ))}
        <hr className="border-border/30 my-3" />
        <button
          onClick={testMarkAllAsRead}
          className="block w-full text-left text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 px-3 py-2 rounded transition-colors"
        >
          🔄 Test "Tout lire"
        </button>
        <button
          onClick={sendCrossUserNotification}
          className="block w-full text-left text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 px-3 py-2 rounded transition-colors"
        >
          👥 Test Cross-Utilisateur
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        ⚡ Via Edge Functions
      </p>
    </div>
  );
}

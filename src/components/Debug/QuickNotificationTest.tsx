import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationService } from "../../services/notificationService";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

export function QuickNotificationTest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  if (!user) return null;

  const testNotifications = [
    {
      name: "order.paid",
      label: "💳 Order paid",
      payload: { orderId: "TEST-123", total: 89.99, currency: "EUR" },
    },
    {
      name: "alter.commissioned",
      label: "🎨 Alter ordered",
      payload: { cardName: "Lightning Bolt", artistName: "Test Artist" },
    },
    {
      name: "product.low_stock",
      label: "⚠️ Low stock",
      payload: { productName: "Test Product", stock: 2 },
    },
    {
      name: "shop.verified",
      label: "✅ Shop verified",
      payload: { shopName: "My Test Shop" },
    },
    {
      name: "message.new",
      label: "💬 New message",
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
        `Notification "${eventName}" sent to ${targetUserIds.length} user(s)!`
      );

      // Force data refresh after a delay
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
      toast.error("Error sending");
      console.error(error);
    }
  };

  const sendCrossUserNotification = async () => {
    // Fetch some users for the cross-user test
    const prompt = window.prompt(
      "Enter another user's ID (or leave blank for yourself):"
    );
    const targetId = prompt?.trim() || user.id;

    await sendTestNotification(
      "message.new",
      {
        senderName: user.email,
        message: "Cross-user notification test!",
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
      toast.success("'Mark all as read' test complete! Check the console.");
    } catch (error) {
      toast.error("Error during 'Mark all as read' test");
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
          🔄 'Mark all as read' test
        </button>
        <button
          onClick={sendCrossUserNotification}
          className="block w-full text-left text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 px-3 py-2 rounded transition-colors"
        >
          👥 Cross-user test
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        ⚡ Via Edge Functions
      </p>
    </div>
  );
}

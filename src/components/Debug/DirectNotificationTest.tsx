import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import supabase from "../../lib/supabase";
import toast from "react-hot-toast";

export function DirectNotificationTest() {
  const { user } = useAuth();

  if (!user) return null;

  const createDirectNotification = async (
    title: string,
    body: string,
    category: string
  ) => {
    try {
      // Use notifications-direct function to bypass RLS
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
      toast.success("Notification created directly!");
    } catch (error) {
      toast.error("Error creating notification");
      console.error(error);
    }
  };

  const testNotifications = [
    {
      title: "💳 Order paid",
      body: "Your order TEST-123 has been paid (89.99€)",
      category: "orders",
    },
    {
      title: "🎨 Alter ordered",
      body: "Your Lightning Bolt alter has been ordered",
      category: "orders",
    },
    {
      title: "⚠️ Low stock",
      body: "Only 2 copies of Test Product left",
      category: "shop",
    },
    {
      title: "💬 New message",
      body: "Test User sent you a message",
      category: "messages",
    },
    {
      title: "✅ Shop verified",
      body: "Your shop My Test Shop is now verified",
      category: "shop",
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-50">
      <h3 className="text-sm font-medium text-foreground mb-3">
        🔧 Direct Test (without Edge Function)
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

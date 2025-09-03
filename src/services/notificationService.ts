import supabase from "../lib/supabase";
import { Notification, NotificationPreference } from "../types/notifications";

export class NotificationService {
  /**
   * Récupère toutes les notifications de l'utilisateur connecté
   */
  static async getNotifications(limit = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Récupère le nombre de notifications non lues
   */
  static async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .is("read_at", null);

    if (error) throw error;
    return count || 0;
  }

  /**
   * Marque une notification comme vue
   */
  static async markAsSeen(notificationId: string): Promise<void> {
    const { error } = await supabase.functions.invoke("notifications-seen", {
      body: { ids: [notificationId] },
    });

    if (error) throw error;
  }

  /**
   * Marque une notification comme lue
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      // Essayer d'abord avec la fonction Edge
      const { error } = await supabase.functions.invoke("notifications-read", {
        body: { ids: [notificationId] },
      });

      if (error) throw error;
    } catch (functionError) {
      console.warn(
        "Edge function failed, trying direct update:",
        functionError
      );

      // Fallback : mise à jour directe
      const { error: directError } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (directError) {
        throw new Error(
          `Failed to mark notification as read: ${directError.message}`
        );
      }
    }
  }

  /**
   * Marque toutes les notifications comme lues
   */
  static async markAllAsRead(): Promise<void> {
    const notifications = await NotificationService.getNotifications();
    const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id);

    console.log("markAllAsRead: unreadIds:", unreadIds);

    if (unreadIds.length > 0) {
      try {
        // Essayer d'abord avec la fonction Edge
        console.log("Calling notifications-read Edge function with:", {
          ids: unreadIds,
        });

        const { data, error } = await supabase.functions.invoke(
          "notifications-read",
          {
            body: { ids: unreadIds },
          }
        );

        console.log("Edge function response:", { data, error });

        if (error) throw error;
      } catch (functionError) {
        console.warn(
          "Edge function failed, trying direct update:",
          functionError
        );

        // Fallback : mise à jour directe (si les politiques RLS le permettent)
        const { error: directError } = await supabase
          .from("notifications")
          .update({ read_at: new Date().toISOString() })
          .in("id", unreadIds);

        if (directError) {
          console.error("Direct update also failed:", directError);
          throw new Error(
            `Failed to mark notifications as read: ${directError.message}`
          );
        }

        console.log("Direct update succeeded");
      }
    } else {
      console.log("No unread notifications to mark as read");
    }
  }

  /**
   * Récupère les préférences de notifications de l'utilisateur
   */
  static async getPreferences(): Promise<NotificationPreference[]> {
    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*");

    if (error) throw error;
    return data || [];
  }

  /**
   * Met à jour une préférence de notification
   */
  static async updatePreference(
    category: string,
    channel: string,
    enabled: boolean
  ): Promise<void> {
    // Récupérer l'utilisateur actuel
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.functions.invoke("preferences", {
      body: {
        user_id: user.id,
        category,
        channel,
        enabled,
        digest_frequency: "immediate",
      },
    });

    if (error) throw error;
  }

  /**
   * S'abonne aux notifications en temps réel
   */
  static subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void
  ) {
    console.log("🔔 Setting up real-time subscription for user:", userId);

    return supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("🔔 Real-time notification received:", payload);
          onNotification(payload.new as Notification);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("🔔 Real-time notification updated:", payload);
          // Invalider les requêtes pour forcer la mise à jour
          if (typeof window !== "undefined" && (window as any).queryClient) {
            const queryClient = (window as any).queryClient;
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({
              queryKey: ["notifications", "unread-count"],
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("🔔 Subscription status:", status);

        // Gestion de la reconnexion automatique
        if (status === "CLOSED") {
          console.log(
            "🔔 Subscription closed, attempting to reconnect in 5s..."
          );
          setTimeout(() => {
            console.log("🔔 Attempting to reconnect...");
            // La reconnexion sera gérée automatiquement par Supabase
          }, 5000);
        }
      });
  }

  /**
   * Émet un événement de notification (pour testing)
   */
  static async emitEvent(
    eventName: string,
    targetUserIds: string[],
    payload?: any
  ): Promise<void> {
    console.log("🚀 Emitting event:", { eventName, targetUserIds, payload });

    const { data, error } = await supabase.functions.invoke("events-emit", {
      body: {
        name: eventName,
        targetUserIds,
        payload,
        idempotencyKey: `${eventName}-${Date.now()}-${Math.random()}`,
      },
    });

    console.log("🚀 Event emission response:", { data, error });

    if (error) throw error;

    // Attendre un peu pour que la notification soit créée et forcer la mise à jour
    setTimeout(() => {
      // Forcer la mise à jour des données en cache si on a accès au query client
      if (typeof window !== "undefined" && (window as any).queryClient) {
        const queryClient = (window as any).queryClient;
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({
          queryKey: ["notifications", "unread-count"],
        });
        queryClient.refetchQueries({ queryKey: ["notifications"] });
        queryClient.refetchQueries({
          queryKey: ["notifications", "unread-count"],
        });
      }
    }, 500);
  }
}

import { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent } from "./UI/Card";
import { Button } from "./UI/Button";
import supabase from "../lib/supabase";

interface MessageNotification {
  id: string;
  order_id: string;
  sender_name: string;
  message_preview: string;
  created_at: string;
}

export function MessageNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchUnreadMessages();
      subscribeToNewMessages();
    }
  }, [user]);

  const fetchUnreadMessages = async () => {
    try {
      // Récupérer les commandes de l'utilisateur
      const { data: userOrders } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user?.id);

      if (!userOrders || userOrders.length === 0) return;

      const orderIds = userOrders.map(order => order.id);

      // Récupérer les messages récents (dernières 24h) des vendeurs
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: messages } = await supabase
        .from("messages")
        .select(`
          id,
          order_id,
          sender_id,
          body,
          created_at,
          sender:profiles!sender_id(display_name)
        `)
        .in("order_id", orderIds)
        .neq("sender_id", user?.id) // Messages des vendeurs uniquement
        .gte("created_at", yesterday.toISOString())
        .order("created_at", { ascending: false })
        .limit(3);

      if (messages && messages.length > 0) {
        const messageNotifications: MessageNotification[] = messages.map(msg => ({
          id: msg.id,
          order_id: msg.order_id,
          sender_name: msg.sender?.display_name || "Vendeur",
          message_preview: msg.body.length > 50 ? msg.body.substring(0, 50) + "..." : msg.body,
          created_at: msg.created_at,
        }));

        setNotifications(messageNotifications.filter(n => !dismissed.has(n.id)));
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error);
    }
  };

  const subscribeToNewMessages = () => {
    const channel = supabase
      .channel('new-messages-for-buyer')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          // Vérifier si le message concerne une commande de l'utilisateur
          const { data: order } = await supabase
            .from("orders")
            .select("user_id")
            .eq("id", payload.new.order_id)
            .single();

          if (order && order.user_id === user?.id && payload.new.sender_id !== user?.id) {
            // C'est un message d'un vendeur pour l'utilisateur
            const { data: senderData } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", payload.new.sender_id)
              .single();

            const newNotification: MessageNotification = {
              id: payload.new.id,
              order_id: payload.new.order_id,
              sender_name: senderData?.display_name || "Vendeur",
              message_preview: payload.new.body.length > 50 
                ? payload.new.body.substring(0, 50) + "..." 
                : payload.new.body,
              created_at: payload.new.created_at,
            };

            setNotifications(prev => [newNotification, ...prev.slice(0, 2)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const dismissNotification = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "À l'instant";
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      return messageTime.toLocaleDateString("fr-FR");
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {notifications.map((notification) => (
        <Card 
          key={notification.id}
          className="border-blue-500/30 bg-blue-500/5 animate-pulse-once"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-foreground text-sm">
                      Message de {notification.sender_name}
                    </h4>
                    <span className="text-xs text-blue-500 font-medium">
                      NOUVEAU
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    "{notification.message_preview}"
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {formatTime(notification.created_at)} • Commande #{notification.order_id.slice(-6)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="ml-2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

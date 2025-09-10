import React, { useEffect, useState, useRef } from "react";
import supabase from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./UI/Button";
import { Input } from "./UI/Input";
import { Send, User, AlertTriangle, Shield } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender?: {
    display_name: string;
    avatar_url?: string;
    role?: string;
  };
}

interface Props {
  orderId: string;
  userId: string;
  context?: "order" | "dispute"; // Contexte pour personnaliser l'affichage
}

export default function Chat({ orderId, userId, context = "order" }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async () => {
      unsubscribe = await subscribeToMessages();
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [orderId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:profiles!sender_id(display_name, avatar_url, role)
        `
        )
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = async () => {
    const channel = supabase
      .channel("order-chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setMessages((msgs) => [...msgs, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const envoyer = async () => {
    if (!text.trim() || sending) return;

    const messageText = text.trim();
    setSending(true);
    setText("");

    try {
      // Message temporaire pour l'UX
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        sender_id: userId,
        body: messageText,
        created_at: new Date().toISOString(),
        sender: {
          display_name: user?.user_metadata?.display_name || "Vous",
          avatar_url: user?.user_metadata?.avatar_url || "",
        },
      };

      setMessages((prev) => [...prev, tempMessage]);
      setTimeout(() => scrollToBottom(), 50);

      // Envoyer le message réel
      const { data, error } = await supabase
        .from("messages")
        .insert({
          order_id: orderId,
          sender_id: userId,
          body: messageText,
        })
        .select(
          `
          *,
          sender:profiles!sender_id(display_name, avatar_url, role)
        `
        )
        .single();

      if (data && !error) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessage.id ? data : msg))
        );
      } else {
        // En cas d'erreur, supprimer le message temporaire
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        setText(messageText); // Remettre le texte
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      setText(messageText); // Remettre le texte
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      envoyer();
    }
  };

  const getMessageStyle = (message: Message) => {
    const isCurrentUser = message.sender_id === userId;
    const isAdminMessage = message.sender?.role === "admin";

    if (isAdminMessage) {
      // Style spécial pour tous les messages d'admin - juste un trait différenciant
      return {
        container: isCurrentUser ? "justify-end" : "justify-start",
        bubble: "bg-muted text-foreground border-l-2 border-primary",
        avatar: "bg-primary text-primary-foreground",
        name: "text-foreground",
        time: "text-muted-foreground",
      };
    } else if (isCurrentUser) {
      // Style normal pour l'utilisateur actuel
      return {
        container: "justify-end",
        bubble: "bg-muted text-foreground",
        avatar: "bg-muted-foreground/20",
        name: "text-foreground/90",
        time: "text-foreground/70",
      };
    } else {
      // Style pour les autres utilisateurs
      return {
        container: "justify-start",
        bubble: "bg-muted text-foreground",
        avatar: "bg-muted-foreground/20",
        name: "text-foreground/90",
        time: "text-foreground/70",
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Chargement des messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p>
              {context === "dispute"
                ? "Aucun message dans cette discussion de litige"
                : "Aucun message pour cette commande"}
            </p>
            <p className="text-sm">
              Soyez le premier à démarrer la conversation !
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === userId;
            const isAdminMessage = message.sender?.role === "admin";
            const style = getMessageStyle(message);

            return (
              <div key={message.id} className={`flex ${style.container}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    style.bubble
                  } ${isCurrentUser ? "ml-auto" : "mr-auto"}`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${style.avatar}`}
                    >
                      {isAdminMessage ? (
                        <Shield className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                    </div>
                    <span className={`text-xs font-medium ${style.name}`}>
                      {message.sender?.display_name || "Utilisateur"}
                      {isAdminMessage && (
                        <span className="ml-1 text-xs opacity-70">(Admin)</span>
                      )}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.body}
                  </p>
                  <p className={`text-xs mt-2 text-right ${style.time}`}>
                    {new Date(message.created_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/20 p-4">
        <div className="flex space-x-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              context === "dispute"
                ? "Tapez votre message pour le litige..."
                : "Tapez votre message..."
            }
            disabled={sending}
            className="flex-1"
          />
          <Button onClick={envoyer} disabled={sending || !text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

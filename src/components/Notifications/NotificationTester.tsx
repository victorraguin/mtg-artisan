import React, { useState } from "react";
import {
  Play,
  Send,
  User,
  Package,
  Star,
  MessageSquare,
  Settings,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { NotificationService } from "../../services/notificationService";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "../UI";

const TEST_EVENTS = [
  {
    category: "Commandes",
    icon: Package,
    color: "text-blue-500",
    events: [
      {
        name: "order.paid",
        label: "Commande payée",
        description: "Simuler une commande payée avec succès",
        payload: {
          orderId: "ORD-123",
          total: 89.99,
          currency: "EUR",
          buyerName: "Alice Dupont",
        },
      },
      {
        name: "order.shipped",
        label: "Commande expédiée",
        description: "Simuler l'expédition d'une commande",
        payload: {
          orderId: "ORD-123",
          trackingNumber: "FR123456789",
          shopName: "ArtMaster Studio",
        },
      },
      {
        name: "alter.commissioned",
        label: "Alter commandé",
        description: "Simuler la commande d'un alter MTG",
        payload: {
          cardName: "Lightning Bolt",
          artistName: "Marie Artisan",
          orderId: "ALT-456",
        },
      },
      {
        name: "token.ready",
        label: "Tokens prêts",
        description: "Simuler des tokens personnalisés prêts",
        payload: { tokenName: "Goblin Token Set", orderId: "TOK-789" },
      },
    ],
  },
  {
    category: "Services",
    icon: User,
    color: "text-green-500",
    events: [
      {
        name: "coaching.scheduled",
        label: "Coaching programmé",
        description: "Simuler une session de coaching programmée",
        payload: { coachName: "Pro Player", date: "2024-02-15", time: "19:00" },
      },
      {
        name: "deckbuilding.completed",
        label: "Deck terminé",
        description: "Simuler un deck construit terminé",
        payload: {
          format: "Modern Burn",
          builderName: "DeckMaster",
          orderId: "DECK-321",
        },
      },
    ],
  },
  {
    category: "Messages",
    icon: MessageSquare,
    color: "text-purple-500",
    events: [
      {
        name: "message.new",
        label: "Nouveau message",
        description: "Simuler un nouveau message reçu",
        payload: { senderName: "Bob Collectionneur" },
      },
      {
        name: "message.commission_request",
        label: "Demande de commission",
        description: "Simuler une demande de commission personnalisée",
        payload: { buyerName: "Sarah Magic" },
      },
    ],
  },
  {
    category: "Avis",
    icon: Star,
    color: "text-yellow-500",
    events: [
      {
        name: "review.posted",
        label: "Nouvel avis",
        description: "Simuler un nouvel avis client",
        payload: {
          reviewerName: "Client Satisfait",
          rating: 5,
          productName: "Alter Lightning Bolt",
        },
      },
    ],
  },
  {
    category: "Boutique",
    icon: Settings,
    color: "text-orange-500",
    events: [
      {
        name: "shop.verified",
        label: "Boutique vérifiée",
        description: "Simuler la vérification d'une boutique",
        payload: { shopName: "Mon Atelier MTG" },
      },
      {
        name: "product.low_stock",
        label: "Stock faible",
        description: "Simuler une alerte de stock faible",
        payload: { productName: "Playmat Dragon", stock: 2 },
      },
      {
        name: "payout.completed",
        label: "Paiement reçu",
        description: "Simuler un paiement reçu",
        payload: { amount: 250.5, currency: "EUR" },
      },
    ],
  },
  {
    category: "Système",
    icon: AlertTriangle,
    color: "text-red-500",
    events: [
      {
        name: "system.update",
        label: "Mise à jour système",
        description: "Simuler une notification de mise à jour",
        payload: {},
      },
      {
        name: "account.login_new_device",
        label: "Nouvelle connexion",
        description: "Simuler une connexion depuis un nouvel appareil",
        payload: { device: "iPhone 15", location: "Paris, France" },
      },
    ],
  },
];

export function NotificationTester() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className="p-6 bg-card border border-border rounded-lg">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Testeur de Notifications
        </h3>
        <p className="text-muted-foreground">
          Vous devez être connecté pour tester les notifications.
        </p>
      </div>
    );
  }

  const handleSendNotification = async (eventName: string, payload: any) => {
    if (!user?.id) return;

    setIsLoading(eventName);
    try {
      await NotificationService.emitEvent(eventName, [user.id], payload);
      toast.success(`Notification "${eventName}" envoyée avec succès !`);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error);
      toast.error("Erreur lors de l'envoi de la notification");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="bg-card border border-border p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center">
          <MessageCircle className="w-6 h-6 mr-3 text-primary" />
          <span>{t("notifications.testerTitle")}</span>
        </h2>
        <div className="flex items-center space-x-2">
          {isLoading && <LoadingSpinner />}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-muted-foreground text-sm">
          Testez les différents types de notifications de l'application. Les
          notifications apparaîtront dans la cloche en haut à droite et comme
          toast.
        </p>
      </div>

      <div className="space-y-6">
        {TEST_EVENTS.map((category) => (
          <div key={category.category} className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center space-x-2">
              <category.icon className={`w-4 h-4 ${category.color}`} />
              <span>{category.category}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.events.map((event) => (
                <div
                  key={event.name}
                  className="p-4 border border-border rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-foreground text-sm">
                        {event.label}
                      </h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.description}
                      </p>
                      <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded mt-2 inline-block">
                        {event.name}
                      </code>
                    </div>

                    <button
                      onClick={() =>
                        handleSendNotification(event.name, event.payload)
                      }
                      disabled={isLoading === event.name}
                      className="ml-3 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Envoyer cette notification"
                    >
                      {isLoading === event.name ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted/30 border border-border rounded-lg">
        <h5 className="font-medium text-foreground text-sm mb-2">
          💡 Instructions
        </h5>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>
            • Cliquez sur le bouton <Send className="w-3 h-3 inline" /> pour
            envoyer une notification test
          </li>
          <li>
            • Les notifications apparaîtront dans la cloche de notifications en
            haut à droite
          </li>
          <li>• Un toast de confirmation s'affichera également</li>
          <li>
            • Vous pouvez tester les différentes catégories et types
            d'événements
          </li>
          <li>
            • Les notifications sont persistantes et resteront visibles même
            après rafraîchissement
          </li>
        </ul>
      </div>
    </div>
  );
}

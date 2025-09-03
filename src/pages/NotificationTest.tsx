import React from "react";
import { NotificationTester } from "../components/Notifications/NotificationTester";

export function NotificationTest() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Test des Notifications
        </h1>
        <p className="text-muted-foreground">
          Page de développement pour tester le système de notifications de MTG
          Artisan.
        </p>
      </div>

      <NotificationTester />

      <div className="mt-8 p-6 bg-card border border-border rounded-lg">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Architecture du Système
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-foreground mb-3">
              📊 Tables de Base de Données
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <code>notification_events</code> - Queue d'événements entrants
              </li>
              <li>
                • <code>notifications</code> - Notifications créées pour les
                utilisateurs
              </li>
              <li>
                • <code>notification_preferences</code> - Préférences
                utilisateur
              </li>
              <li>
                • <code>notification_deliveries</code> - Tâches de livraison
                (email, push, etc.)
              </li>
              <li>
                • <code>notification_templates</code> - Templates de messages
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-3">
              ⚙️ Fonctions Supabase
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <code>events-emit</code> - Émet un événement
              </li>
              <li>
                • <code>events-fanout</code> - Traite les événements en
                notifications
              </li>
              <li>
                • <code>notifications-read</code> - Marque comme lu
              </li>
              <li>
                • <code>notifications-seen</code> - Marque comme vu
              </li>
              <li>
                • <code>preferences</code> - Gère les préférences
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/30 border border-border rounded-lg">
          <h4 className="font-medium text-foreground text-sm mb-2">
            🔄 Flux de Données
          </h4>
          <ol className="text-xs text-muted-foreground space-y-1">
            <li>
              1. L'application émet un événement via{" "}
              <code>NotificationService.emitEvent()</code>
            </li>
            <li>
              2. L'événement est stocké dans <code>notification_events</code>
            </li>
            <li>
              3. La fonction <code>events-fanout</code> traite les événements
            </li>
            <li>
              4. Les notifications sont créées dans <code>notifications</code>
            </li>
            <li>
              5. Les tâches de livraison sont créées dans{" "}
              <code>notification_deliveries</code>
            </li>
            <li>6. L'interface React s'abonne aux changements en temps réel</li>
            <li>
              7. Les notifications apparaissent dans la cloche et comme toasts
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

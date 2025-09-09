import React from "react";
import { NotificationTester } from "../components/Notifications/NotificationTester";

export function NotificationTest() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Notification Test
        </h1>
        <p className="text-muted-foreground">
          Development page for testing the MTG Artisan notification system.
        </p>
      </div>

      <NotificationTester />

      <div className="mt-8 p-6 bg-card border border-border rounded-lg">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          System Architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-foreground mb-3">
              📊 Database Tables
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <code>notification_events</code> - Incoming event queue
              </li>
              <li>
                • <code>notifications</code> - Notifications created for users
              </li>
              <li>
                • <code>notification_preferences</code> - User preferences
              </li>
              <li>
                • <code>notification_deliveries</code> - Delivery tasks (email, push, etc.)
              </li>
              <li>
                • <code>notification_templates</code> - Message templates
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-3">
              ⚙️ Supabase Functions
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <code>events-emit</code> - Emits an event
              </li>
              <li>
                • <code>events-fanout</code> - Processes events into notifications
              </li>
              <li>
                • <code>notifications-read</code> - Marks as read
              </li>
              <li>
                • <code>notifications-seen</code> - Marks as seen
              </li>
              <li>
                • <code>preferences</code> - Manages preferences
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/30 border border-border rounded-lg">
          <h4 className="font-medium text-foreground text-sm mb-2">
            🔄 Data Flow
          </h4>
          <ol className="text-xs text-muted-foreground space-y-1">
            <li>
              1. The application emits an event via <code>NotificationService.emitEvent()</code>
            </li>
            <li>
              2. The event is stored in <code>notification_events</code>
            </li>
            <li>
              3. The <code>events-fanout</code> function processes the events
            </li>
            <li>
              4. Notifications are created in <code>notifications</code>
            </li>
            <li>
              5. Delivery tasks are created in <code>notification_deliveries</code>
            </li>
            <li>6. The React interface subscribes to real-time changes</li>
            <li>
              7. Notifications appear in the bell and as toasts
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

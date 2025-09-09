import React from "react";
import { useTranslation } from "react-i18next";
import { NotificationTester } from "../components/Notifications/NotificationTester";

export function NotificationTest() {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t("notificationTest.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("notificationTest.description")}
        </p>
      </div>

      <NotificationTester />

      <div className="mt-8 p-6 bg-card border border-border rounded-lg">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {t("notificationTest.architecture.title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-foreground mb-3">
              {t("notificationTest.architecture.dbTables.title")}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <code>notification_events</code> -
                {" "}
                {t("notificationTest.architecture.dbTables.notificationEvents")}
              </li>
              <li>
                • <code>notifications</code> -
                {" "}
                {t("notificationTest.architecture.dbTables.notifications")}
              </li>
              <li>
                • <code>notification_preferences</code> -
                {" "}
                {t("notificationTest.architecture.dbTables.notificationPreferences")}
              </li>
              <li>
                • <code>notification_deliveries</code> -
                {" "}
                {t("notificationTest.architecture.dbTables.notificationDeliveries")}
              </li>
              <li>
                • <code>notification_templates</code> -
                {" "}
                {t("notificationTest.architecture.dbTables.notificationTemplates")}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-3">
              {t("notificationTest.architecture.supabaseFunctions.title")}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <code>events-emit</code> -
                {" "}
                {t("notificationTest.architecture.supabaseFunctions.eventsEmit")}
              </li>
              <li>
                • <code>events-fanout</code> -
                {" "}
                {t("notificationTest.architecture.supabaseFunctions.eventsFanout")}
              </li>
              <li>
                • <code>notifications-read</code> -
                {" "}
                {t("notificationTest.architecture.supabaseFunctions.notificationsRead")}
              </li>
              <li>
                • <code>notifications-seen</code> -
                {" "}
                {t("notificationTest.architecture.supabaseFunctions.notificationsSeen")}
              </li>
              <li>
                • <code>preferences</code> -
                {" "}
                {t("notificationTest.architecture.supabaseFunctions.preferences")}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/30 border border-border rounded-lg">
          <h4 className="font-medium text-foreground text-sm mb-2">
            {t("notificationTest.architecture.dataFlow.title")}
          </h4>
          <ol className="text-xs text-muted-foreground space-y-1">
            <li>
              1. {t("notificationTest.architecture.dataFlow.step1")} {" "}
              <code>NotificationService.emitEvent()</code>
            </li>
            <li>
              2. {t("notificationTest.architecture.dataFlow.step2")} {" "}
              <code>notification_events</code>
            </li>
            <li>
              3. {t("notificationTest.architecture.dataFlow.step3Before")} {" "}
              <code>events-fanout</code> {" "}
              {t("notificationTest.architecture.dataFlow.step3After")}
            </li>
            <li>
              4. {t("notificationTest.architecture.dataFlow.step4")} {" "}
              <code>notifications</code>
            </li>
            <li>
              5. {t("notificationTest.architecture.dataFlow.step5Before")} {" "}
              <code>notification_deliveries</code>
            </li>
            <li>6. {t("notificationTest.architecture.dataFlow.step6")}</li>
            <li>7. {t("notificationTest.architecture.dataFlow.step7")}</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

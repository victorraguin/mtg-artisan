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
          {t("notificationTest.subtitle")}
        </p>
      </div>

      <NotificationTester />

      <div className="mt-8 p-6 bg-card border border-border rounded-lg">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {t("notificationTest.architectureTitle")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-foreground mb-3">
              {t("notificationTest.dbTablesTitle")}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <code>{t("notificationTest.dbEvents")}</code>
              </li>
              <li>
                • <code>{t("notificationTest.dbNotifications")}</code>
              </li>
              <li>
                • <code>{t("notificationTest.dbPreferences")}</code>
              </li>
              <li>
                • <code>{t("notificationTest.dbDeliveries")}</code>
              </li>
              <li>
                • <code>{t("notificationTest.dbTemplates")}</code>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-3">
              {t("notificationTest.supabaseFunctionsTitle")}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <code>{t("notificationTest.sfEmit")}</code>
              </li>
              <li>
                • <code>{t("notificationTest.sfFanout")}</code>
              </li>
              <li>
                • <code>{t("notificationTest.sfRead")}</code>
              </li>
              <li>
                • <code>{t("notificationTest.sfSeen")}</code>
              </li>
              <li>
                • <code>{t("notificationTest.sfPreferences")}</code>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/30 border border-border rounded-lg">
          <h4 className="font-medium text-foreground text-sm mb-2">
            {t("notificationTest.dataFlowTitle")}
          </h4>
          <ol className="text-xs text-muted-foreground space-y-1">
            <li>{t("notificationTest.flow1")}</li>
            <li>{t("notificationTest.flow2")}</li>
            <li>{t("notificationTest.flow3")}</li>
            <li>{t("notificationTest.flow4")}</li>
            <li>{t("notificationTest.flow5")}</li>
            <li>{t("notificationTest.flow6")}</li>
            <li>{t("notificationTest.flow7")}</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

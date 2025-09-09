import React from "react";
import { NotificationTester } from "../components/Notifications/NotificationTester";
import { useTranslation } from "react-i18next";

export function NotificationTest() {
  const { t } = useTranslation();
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t('notificationTest.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('notificationTest.description')}
        </p>
      </div>

      <NotificationTester />

      <div className="mt-8 p-6 bg-card border border-border rounded-lg">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {t('notificationTest.architectureTitle')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-foreground mb-3">
              {t('notificationTest.dbTablesTitle')}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <code>notification_events</code> - {t('notificationTest.dbTables.events')}
              </li>
              <li>
                • <code>notifications</code> - {t('notificationTest.dbTables.notifications')}
              </li>
              <li>
                • <code>notification_preferences</code> - {t('notificationTest.dbTables.preferences')}
              </li>
              <li>
                • <code>notification_deliveries</code> - {t('notificationTest.dbTables.deliveries')}
              </li>
              <li>
                • <code>notification_templates</code> - {t('notificationTest.dbTables.templates')}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-3">
              {t('notificationTest.functionsTitle')}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <code>events-emit</code> - {t('notificationTest.functions.eventsEmit')}
              </li>
              <li>
                • <code>events-fanout</code> - {t('notificationTest.functions.eventsFanout')}
              </li>
              <li>
                • <code>notifications-read</code> - {t('notificationTest.functions.notificationsRead')}
              </li>
              <li>
                • <code>notifications-seen</code> - {t('notificationTest.functions.notificationsSeen')}
              </li>
              <li>
                • <code>preferences</code> - {t('notificationTest.functions.preferences')}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/30 border border-border rounded-lg">
          <h4 className="font-medium text-foreground text-sm mb-2">
            {t('notificationTest.flowTitle')}
          </h4>
          <ol className="text-xs text-muted-foreground space-y-1">
            <li>
              {t('notificationTest.flow.step1')} {" "}
              <code>NotificationService.emitEvent()</code>
            </li>
            <li>
              {t('notificationTest.flow.step2')} <code>notification_events</code>
            </li>
            <li>
              {t('notificationTest.flow.step3.part1')} {" "}
              <code>events-fanout</code> {" "}
              {t('notificationTest.flow.step3.part2')}
            </li>
            <li>
              {t('notificationTest.flow.step4')} <code>notifications</code>
            </li>
            <li>
              {t('notificationTest.flow.step5')} {" "}
              <code>notification_deliveries</code>
            </li>
            <li>{t('notificationTest.flow.step6')}</li>
            <li>{t('notificationTest.flow.step7')}</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

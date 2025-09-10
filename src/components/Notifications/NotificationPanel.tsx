import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ExternalLink, Bell, Settings, CheckCheck } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { Notification } from "../../types/notifications";
import { useTranslation } from "react-i18next";

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "orders":
      return "📦";
    case "messages":
      return "💬";
    case "reviews":
      return "⭐";
    case "shop":
      return "🏪";
    case "system":
      return "⚙️";
    default:
      return "🔔";
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "orders":
      return "text-blue-400";
    case "messages":
      return "text-green-400";
    case "reviews":
      return "text-yellow-400";
    case "shop":
      return "text-purple-400";
    case "system":
      return "text-gray-400";
    default:
      return "text-blue-400";
  }
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsSeen: (id: string) => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onMarkAsSeen,
}: NotificationItemProps) {
  const isUnread = !notification.read_at;
  const categoryIcon =
    notification.icon || getCategoryIcon(notification.category);
  const categoryColor = getCategoryColor(notification.category);

  const handleClick = () => {
    // Marquer comme lu si pas encore lu
    if (isUnread) {
      onMarkAsRead(notification.id);
    }
    // Marquer comme vu si pas encore vu
    if (!notification.seen_at) {
      onMarkAsSeen(notification.id);
    }
    // Ouvrir le lien si disponible
    if (notification.action_url) {
      window.open(notification.action_url, "_blank");
    }
  };

  return (
    <div
      className={`p-4 border-b border-border/30 hover:bg-card/50 cursor-pointer transition-colors ${
        isUnread ? "bg-primary/5" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className={`text-lg ${categoryColor}`}>{categoryIcon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4
              className={`text-sm font-medium ${
                isUnread ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {notification.title}
            </h4>
            <div className="flex items-center space-x-1 ml-2">
              {isUnread && (
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
          </div>
          {notification.body && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {notification.body}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span
              className={`text-xs px-2 py-1 rounded-full bg-card ${categoryColor}`}
            >
              {notification.category}
            </span>
            {notification.action_url && (
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAsSeen,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="w-80 sm:w-96 bg-card border border-border rounded-lg shadow-xl">
        <div className="p-4 border-b border-border/30">
          <h3 className="font-medium text-foreground">
            {t("notificationPanel.title")}
          </h3>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">
            {t("notificationPanel.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 sm:w-96 bg-card border border-border rounded-lg shadow-xl max-h-96 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-card/50">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">
            {t("notificationPanel.title")}
            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  console.log(
                    '🔄 Bouton "Tout lire" cliqué, unreadCount:',
                    unreadCount,
                  );
                  markAllAsRead();
                }}
                disabled={isMarkingAllAsRead}
                className="text-xs text-primary hover:text-primary/80 flex items-center space-x-1"
                title={t("notificationPanel.markAllTitle")}
              >
                <CheckCheck className="w-3 h-3" />
                <span>
                  {isMarkingAllAsRead
                    ? t("notificationPanel.loading")
                    : t("notificationPanel.markAll")}
                </span>
              </button>
            )}
            <Link
              to="/notifications/preferences"
              className="text-muted-foreground hover:text-foreground"
              title={t("notificationPanel.settings")}
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {t("notificationPanel.empty")}
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onMarkAsSeen={markAsSeen}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-border/30 bg-card/50">
          <button className="w-full text-xs text-center text-primary hover:text-primary/80">
            {t("notificationPanel.viewAll")}
          </button>
        </div>
      )}
    </div>
  );
}

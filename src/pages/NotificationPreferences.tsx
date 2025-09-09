import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Mail, Save } from "lucide-react";
import { NotificationService } from "../services/notificationService";
import {
  NotificationPreference,
  NotificationCategory,
  NotificationChannel,
} from "../types/notifications";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const categories = [
  {
    key: "orders",
    label: "notificationPreferences.categories.orders.label",
    description: "notificationPreferences.categories.orders.description",
    icon: "📦",
  },
  {
    key: "messages",
    label: "notificationPreferences.categories.messages.label",
    description: "notificationPreferences.categories.messages.description",
    icon: "💬",
  },
  {
    key: "reviews",
    label: "notificationPreferences.categories.reviews.label",
    description: "notificationPreferences.categories.reviews.description",
    icon: "⭐",
  },
  {
    key: "shop",
    label: "notificationPreferences.categories.shop.label",
    description: "notificationPreferences.categories.shop.description",
    icon: "🏪",
  },
  {
    key: "system",
    label: "notificationPreferences.categories.system.label",
    description: "notificationPreferences.categories.system.description",
    icon: "⚙️",
  },
] as const;

const channels = [
  {
    key: "inapp",
    label: "notificationPreferences.channels.inapp.label",
    description: "notificationPreferences.channels.inapp.description",
    icon: Bell,
  },
  {
    key: "email",
    label: "notificationPreferences.channels.email.label",
    description: "notificationPreferences.channels.email.description",
    icon: Mail,
  },
] as const;

export function NotificationPreferences() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Récupérer les préférences actuelles
  const { data: currentPreferences = [], isLoading } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: NotificationService.getPreferences,
  });

  // Mutation pour sauvegarder les préférences
  const savePreferencesMutation = useMutation({
    mutationFn: async () => {
      const promises = Object.entries(preferences).map(([key, enabled]) => {
        const [category, channel] = key.split("-");
        return NotificationService.updatePreference(category, channel, enabled);
      });
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      setHasChanges(false);
      toast.success(t("notificationPreferences.toast.success"));
    },
    onError: (error) => {
      toast.error(t("notificationPreferences.toast.error"));
      console.error("Error saving preferences:", error);
    },
  });

  // Initialiser les préférences locales
  useEffect(() => {
    // Ne pas traiter si les données sont encore en cours de chargement
    if (isLoading) return;

    const prefs: Record<string, boolean> = {};

    // Initialiser avec les valeurs par défaut
    categories.forEach((category) => {
      channels.forEach((channel) => {
        const key = `${category.key}-${channel.key}`;
        // Par défaut, toutes les notifications sont activées
        prefs[key] = true;
      });
    });

    // Appliquer les préférences existantes
    currentPreferences.forEach((pref) => {
      const key = `${pref.category}-${pref.channel}`;
      prefs[key] = pref.enabled;
    });

    setPreferences(prefs);
  }, [currentPreferences.length, isLoading]); // Utiliser length au lieu de l'array complet

  const togglePreference = (category: string, channel: string) => {
    const key = `${category}-${channel}`;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const savePreferences = () => {
    savePreferencesMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-card rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-card rounded w-2/3 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-card rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {t("notificationPreferences.title")}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t("notificationPreferences.subtitle")}
          </p>
        </div>

        {/* Version mobile - Cards empilées */}
        <div className="block md:hidden space-y-4">
          {categories.map((category) => (
            <div
              key={category.key}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              <div className="p-4 bg-card/50 border-b border-border">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{category.icon}</span>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {t(category.label)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(category.description)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {channels.map((channel) => {
                  const key = `${category.key}-${channel.key}`;
                  const isEnabled = preferences[key] || false;

                  return (
                    <div
                      key={channel.key}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <channel.icon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium text-foreground text-sm">
                            {t(channel.label)}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {t(channel.description)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          togglePreference(category.key, channel.key)
                        }
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          isEnabled ? "bg-primary" : "bg-muted"
                        }`}
                        title={t("notificationPreferences.toggle", {
                          action: t(
                            isEnabled
                              ? "notificationPreferences.disable"
                              : "notificationPreferences.enable"
                          ),
                          channel: t(channel.label).toLowerCase(),
                        })}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            isEnabled ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Version desktop - Tableau */}
        <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden">
          {/* Header du tableau */}
          <div className="bg-card/50 border-b border-border p-4 lg:p-6">
            <div className="grid grid-cols-3 gap-4 lg:gap-8">
              <div className="font-semibold text-foreground text-base lg:text-lg">
                {t("notificationPreferences.categoryColumn")}
              </div>
              {channels.map((channel) => (
                <div key={channel.key} className="text-center">
                  <div className="flex items-center justify-center space-x-2 lg:space-x-3 mb-1 lg:mb-2">
                    <channel.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="font-semibold text-foreground text-base lg:text-lg">
                      {t(channel.label)}
                    </span>
                  </div>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    {t(channel.description)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Lignes des catégories */}
          <div className="divide-y divide-border">
            {categories.map((category) => (
              <div
                key={category.key}
                className="p-4 lg:p-6 hover:bg-card/50 transition-colors"
              >
                <div className="grid grid-cols-3 gap-4 lg:gap-8 items-center">
                  <div>
                    <div className="flex items-center space-x-3 lg:space-x-4">
                      <span className="text-xl lg:text-2xl">
                        {category.icon}
                      </span>
                      <div>
                        <h3 className="font-semibold text-foreground text-base lg:text-lg">
                          {t(category.label)}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t(category.description)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {channels.map((channel) => {
                    const key = `${category.key}-${channel.key}`;
                    const isEnabled = preferences[key] || false;

                    return (
                      <div key={channel.key} className="flex justify-center">
                        <button
                          onClick={() =>
                            togglePreference(category.key, channel.key)
                          }
                          className={`relative w-12 h-6 lg:w-14 lg:h-7 rounded-full transition-colors ${
                            isEnabled ? "bg-primary" : "bg-muted"
                          }`}
                          title={t("notificationPreferences.toggleForCategory", {
                            action: t(
                              isEnabled
                                ? "notificationPreferences.disable"
                                : "notificationPreferences.enable"
                            ),
                            channel: t(channel.label).toLowerCase(),
                            category: t(category.label).toLowerCase(),
                          })}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 lg:w-5 lg:h-5 bg-white rounded-full transition-transform shadow-sm ${
                              isEnabled
                                ? "translate-x-7 lg:translate-x-8"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        {hasChanges && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={savePreferences}
              disabled={savePreferencesMutation.isPending}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {savePreferencesMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{t("notificationPreferences.saving")}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t("notificationPreferences.save")}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Note informative */}
        <div className="mt-8 p-4 bg-muted/30 border border-border rounded-lg">
          <h3 className="font-medium text-foreground mb-2">
            {t("notificationPreferences.about")}
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              • <strong>{t("notificationPreferences.channels.inapp.label")}</strong> :
              {" "}
              {t("notificationPreferences.aboutInapp")}
            </li>
            <li>
              • <strong>{t("notificationPreferences.channels.email.label")}</strong> :
              {" "}
              {t("notificationPreferences.aboutEmail")}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

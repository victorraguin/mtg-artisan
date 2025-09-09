import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Mail, Save, Check } from "lucide-react";
import { NotificationService } from "../services/notificationService";
import {
  NotificationPreference,
  NotificationCategory,
  NotificationChannel,
} from "../types/notifications";
import toast from "react-hot-toast";

const categories = [
  {
    key: "orders",
    label: "Orders",
    description: "New orders, status updates, deliveries",
    icon: "📦",
  },
  {
    key: "messages",
    label: "Messages",
    description: "Customer messages and conversations",
    icon: "💬",
  },
  {
    key: "reviews",
    label: "Reviews",
    description: "New reviews and ratings",
    icon: "⭐",
  },
  {
    key: "shop",
    label: "Shop",
    description: "Shop management, quotes, payments",
    icon: "🏪",
  },
  {
    key: "system",
    label: "System",
    description: "Important updates and maintenance",
    icon: "⚙️",
  },
] as const;

const channels = [
  {
    key: "inapp",
    label: "In-app",
    description: "Notifications inside the interface",
    icon: Bell,
  },
  {
    key: "email",
    label: "Email",
    description: "Email notifications",
    icon: Mail,
  },
] as const;

export function NotificationPreferences() {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current preferences
  const { data: currentPreferences = [], isLoading } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: NotificationService.getPreferences,
  });

  // Mutation to save preferences
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
      toast.success("Preferences saved successfully");
    },
    onError: (error) => {
      toast.error("Error saving preferences");
      console.error("Error saving preferences:", error);
    },
  });

  // Initialize local preferences
  useEffect(() => {
    // Skip if data is still loading
    if (isLoading) return;

    const prefs: Record<string, boolean> = {};

    // Initialize with default values
    categories.forEach((category) => {
      channels.forEach((channel) => {
        const key = `${category.key}-${channel.key}`;
        // By default, all notifications are enabled
        prefs[key] = true;
      });
    });

    // Apply existing preferences
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
            Notification Preferences
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage how you want to receive notifications for each event type.
          </p>
        </div>

        {/* Mobile version - stacked cards */}
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
                      {category.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
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
                            {channel.label}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {channel.description}
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
                        title={`${
                          isEnabled ? "Disable" : "Enable"
                        } ${channel.label.toLowerCase()} notifications`}
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
                Category
              </div>
              {channels.map((channel) => (
                <div key={channel.key} className="text-center">
                  <div className="flex items-center justify-center space-x-2 lg:space-x-3 mb-1 lg:mb-2">
                    <channel.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="font-semibold text-foreground text-base lg:text-lg">
                      {channel.label}
                    </span>
                  </div>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    {channel.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Category rows */}
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
                          {category.label}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
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
                          title={`${
                            isEnabled ? "Disable" : "Enable"
                          } ${channel.label.toLowerCase()} notifications for ${category.label.toLowerCase()}`}
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save preferences</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Info note */}
        <div className="mt-8 p-4 bg-muted/30 border border-border rounded-lg">
          <h3 className="font-medium text-foreground mb-2">
            💡 About notifications
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              • <strong>In-app</strong>: Notifications visible in the user interface
            </li>
            <li>
              • <strong>Email</strong>: Notifications sent to your email address
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

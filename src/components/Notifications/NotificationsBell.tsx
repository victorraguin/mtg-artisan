import React, { useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { NotificationPanel } from "./NotificationPanel";

export default function NotificationsBell() {
  const { unreadCount, isOpen, togglePanel, closePanel } = useNotifications();

  // Debug: voir les changements du compteur
  useEffect(() => {
    console.log("🔔 Bell unreadCount changed:", unreadCount);
  }, [unreadCount]);

  // Debug: forcer un re-render pour voir si le problème vient du cache
  console.log("🔔 Bell render - unreadCount:", unreadCount);

  const bellRef = useRef<HTMLDivElement>(null);

  // Fermer le panneau si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        closePanel();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, closePanel]);

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={togglePanel}
        className="relative p-3 text-muted-foreground hover:text-primary transition-colors duration-300 rounded-xl hover:bg-card/50"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Version mobile - plein écran */}
          <div
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
            onClick={closePanel}
          />
          <div className="fixed top-20 right-4 left-4 z-50 sm:absolute sm:right-0 sm:left-auto sm:top-auto sm:mt-2 sm:w-96">
            <NotificationPanel />
          </div>
        </>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { NotificationService } from "../services/notificationService";
import { Notification } from "../types/notifications";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Récupérer les notifications
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => NotificationService.getNotifications(),
    enabled: !!user,
    refetchInterval: 30000, // Actualise toutes les 30 secondes
  });

  // Récupérer le nombre de notifications non lues
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => NotificationService.getUnreadCount(),
    enabled: !!user,
    refetchInterval: 60000, // Refetch toutes les 60 secondes pour rester synchronisé
    staleTime: 30000, // Considérer les données comme fraîches pendant 30 secondes
  });

  // Marquer comme lu avec optimistic update
  const markAsReadMutation = useMutation({
    mutationFn: NotificationService.markAsRead,
    onMutate: async (notificationId: string) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      await queryClient.cancelQueries({
        queryKey: ["notifications", "unread-count"],
      });

      // Sauvegarder l'état actuel
      const previousNotifications = queryClient.getQueryData<Notification[]>([
        "notifications",
      ]);
      const previousUnreadCount = queryClient.getQueryData<number>([
        "notifications",
        "unread-count",
      ]);

      // Optimistic update des notifications
      if (previousNotifications) {
        const updatedNotifications = previousNotifications.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        );
        queryClient.setQueryData(["notifications"], updatedNotifications);
      }

      // Optimistic update du compteur
      if (previousUnreadCount && previousUnreadCount > 0) {
        const wasUnread = previousNotifications?.find(
          (n) => n.id === notificationId && !n.read_at
        );
        if (wasUnread) {
          const newCount = previousUnreadCount - 1;
          console.log(
            "🔔 Optimistic update: unreadCount",
            previousUnreadCount,
            "->",
            newCount
          );
          queryClient.setQueryData(["notifications", "unread-count"], newCount);
        }
      }

      return { previousNotifications, previousUnreadCount };
    },
    onError: (err, notificationId, context) => {
      // Restaurer l'état précédent en cas d'erreur
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications"],
          context.previousNotifications
        );
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(
          ["notifications", "unread-count"],
          context.previousUnreadCount
        );
      }
      console.error("Erreur lors du marquage comme lu:", err);
    },
    onSettled: () => {
      // Refetch pour s'assurer que les données sont à jour
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  // Marquer comme vu
  const markAsSeenMutation = useMutation({
    mutationFn: NotificationService.markAsSeen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Marquer toutes comme lues avec optimistic update
  const markAllAsReadMutation = useMutation({
    mutationFn: NotificationService.markAllAsRead,
    onMutate: async () => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      await queryClient.cancelQueries({
        queryKey: ["notifications", "unread-count"],
      });

      // Sauvegarder l'état actuel
      const previousNotifications = queryClient.getQueryData<Notification[]>([
        "notifications",
      ]);
      const previousUnreadCount = queryClient.getQueryData<number>([
        "notifications",
        "unread-count",
      ]);

      // Optimistic update : marquer toutes les notifications comme lues
      if (previousNotifications) {
        const updatedNotifications = previousNotifications.map((notif) => ({
          ...notif,
          read_at: notif.read_at || new Date().toISOString(),
        }));
        queryClient.setQueryData(["notifications"], updatedNotifications);
      }

      // Optimistic update : compteur à 0
      queryClient.setQueryData(["notifications", "unread-count"], 0);

      return { previousNotifications, previousUnreadCount };
    },
    onError: (err, variables, context) => {
      // Restaurer l'état précédent en cas d'erreur
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications"],
          context.previousNotifications
        );
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(
          ["notifications", "unread-count"],
          context.previousUnreadCount
        );
      }
      console.error("Erreur lors du marquage de toutes comme lues:", err);
      toast.error("Erreur lors du marquage des notifications");
    },
    onSuccess: () => {
      toast.success("Toutes les notifications ont été marquées comme lues");
    },
    onSettled: () => {
      // Refetch pour s'assurer que les données sont à jour
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  // S'abonner aux notifications en temps réel
  useEffect(() => {
    if (!user?.id) return;

    const subscription = NotificationService.subscribeToNotifications(
      user.id,
      (notification) => {
        // Optimistic update : ajouter la nouvelle notification
        const previousNotifications =
          queryClient.getQueryData<Notification[]>(["notifications"]) || [];
        const previousUnreadCount =
          queryClient.getQueryData<number>(["notifications", "unread-count"]) ||
          0;

        // Ajouter la nouvelle notification en première position
        const updatedNotifications = [notification, ...previousNotifications];
        queryClient.setQueryData(["notifications"], updatedNotifications);

        // Incrémenter le compteur si la notification n'est pas lue
        if (!notification.read_at) {
          const newCount = previousUnreadCount + 1;
          console.log(
            "🔔 New notification received, updating unread count:",
            previousUnreadCount,
            "->",
            newCount
          );
          queryClient.setQueryData(["notifications", "unread-count"], newCount);
        }

        // Pas d'invalidation immédiate pour laisser l'optimistic update être visible
        // L'invalidation se fera naturellement lors des prochaines interactions

        // Afficher une notification toast
        toast.success(notification.title, {
          duration: 4000,
          icon: notification.icon || "🔔",
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, queryClient]);

  const markAsRead = useCallback(
    (notificationId: string) => {
      markAsReadMutation.mutate(notificationId);
    },
    [markAsReadMutation]
  );

  const markAsSeen = useCallback(
    (notificationId: string) => {
      markAsSeenMutation.mutate(notificationId);
    },
    [markAsSeenMutation]
  );

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const togglePanel = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    isOpen,
    markAsRead,
    markAsSeen,
    markAllAsRead,
    togglePanel,
    closePanel,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
}

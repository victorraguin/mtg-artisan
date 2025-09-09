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

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => NotificationService.getNotifications(),
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch unread notification count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => NotificationService.getUnreadCount(),
    enabled: !!user,
    refetchInterval: 60000, // Refetch every 60 seconds to stay in sync
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Mark as read with optimistic update
  const markAsReadMutation = useMutation({
    mutationFn: NotificationService.markAsRead,
    onMutate: async (notificationId: string) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      await queryClient.cancelQueries({
        queryKey: ["notifications", "unread-count"],
      });

      // Save current state
      const previousNotifications = queryClient.getQueryData<Notification[]>([
        "notifications",
      ]);
      const previousUnreadCount = queryClient.getQueryData<number>([
        "notifications",
        "unread-count",
      ]);

      // Optimistic update of notifications
      if (previousNotifications) {
        const updatedNotifications = previousNotifications.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        );
        queryClient.setQueryData(["notifications"], updatedNotifications);
      }

      // Optimistic update of the counter
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
      // Restore previous state in case of error
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
      console.error("Error marking as read:", err);
    },
    onSettled: () => {
      // Refetch to ensure data is up to date
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  // Mark as seen
  const markAsSeenMutation = useMutation({
    mutationFn: NotificationService.markAsSeen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read with optimistic update
  const markAllAsReadMutation = useMutation({
    mutationFn: NotificationService.markAllAsRead,
    onMutate: async () => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      await queryClient.cancelQueries({
        queryKey: ["notifications", "unread-count"],
      });

      // Save current state
      const previousNotifications = queryClient.getQueryData<Notification[]>([
        "notifications",
      ]);
      const previousUnreadCount = queryClient.getQueryData<number>([
        "notifications",
        "unread-count",
      ]);

      // Optimistic update: mark all notifications as read
      if (previousNotifications) {
        const updatedNotifications = previousNotifications.map((notif) => ({
          ...notif,
          read_at: notif.read_at || new Date().toISOString(),
        }));
        queryClient.setQueryData(["notifications"], updatedNotifications);
      }

      // Optimistic update: counter to 0
      queryClient.setQueryData(["notifications", "unread-count"], 0);

      return { previousNotifications, previousUnreadCount };
    },
    onError: (err, variables, context) => {
      // Restore previous state in case of error
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
      console.error("Error marking all as read:", err);
      toast.error("Error marking notifications");
    },
    onSuccess: () => {
      toast.success("All notifications have been marked as read");
    },
    onSettled: () => {
      // Refetch to ensure data is up to date
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const subscription = NotificationService.subscribeToNotifications(
      user.id,
      (notification) => {
        // Optimistic update: add the new notification
        const previousNotifications =
          queryClient.getQueryData<Notification[]>(["notifications"]) || [];
        const previousUnreadCount =
          queryClient.getQueryData<number>(["notifications", "unread-count"]) ||
          0;

        // Add the new notification at the top
        const updatedNotifications = [notification, ...previousNotifications];
        queryClient.setQueryData(["notifications"], updatedNotifications);

        // Increment counter if notification is unread
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

        // No immediate invalidation to let the optimistic update be visible
        // Invalidation will occur naturally during next interactions

        // Show a toast notification
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

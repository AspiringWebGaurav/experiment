"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { auth } from "@/lib/firebase";
import {
  Notification,
  CreateNotificationInput,
  NotificationType,
} from "@/types/notification";
import { toast } from "sonner";
import { setNotificationService } from "@/lib/notificationHelpers";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  createNotification: (
    input: Omit<CreateNotificationInput, "userId">
  ) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  showToast: (type: NotificationType, message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch notifications when user changes
  useEffect(() => {
    if (userId) {
      refreshNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [userId]);

  const refreshNotifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`);

      if (!response.ok) {
        // Handle error gracefully - just log and set empty notifications
        console.warn(
          "Could not fetch notifications:",
          response.status,
          response.statusText
        );
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const data = await response.json();
      const notifs = data.notifications || [];

      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
    } catch (error) {
      // Handle any network or parsing errors gracefully
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createNotification = useCallback(
    async (input: Omit<CreateNotificationInput, "userId">) => {
      if (!userId) {
        console.warn("Cannot create notification: No user logged in");
        return;
      }

      try {
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...input, userId }),
        });

        if (!response.ok) {
          console.warn(
            "Failed to create notification:",
            response.status,
            response.statusText
          );
          return;
        }

        await refreshNotifications();
      } catch (error) {
        console.error("Error creating notification:", error);
      }
    },
    [userId, refreshNotifications]
  );

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      try {
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId, userId, action: "mark-read" }),
        });

        if (!response.ok) {
          console.warn(
            "Failed to mark notification as read:",
            response.status,
            response.statusText
          );
          return;
        }

        await refreshNotifications();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [userId, refreshNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "mark-all-read" }),
      });

      if (!response.ok) {
        console.warn(
          "Failed to mark all as read:",
          response.status,
          response.statusText
        );
        toast.error("Failed to mark all as read");
        return;
      }

      await refreshNotifications();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  }, [userId, refreshNotifications]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      try {
        const response = await fetch("/api/notifications", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId, userId }),
        });

        if (!response.ok) {
          console.warn(
            "Failed to delete notification:",
            response.status,
            response.statusText
          );
          toast.error("Failed to delete notification");
          return;
        }

        await refreshNotifications();
      } catch (error) {
        console.error("Error deleting notification:", error);
        toast.error("Failed to delete notification");
      }
    },
    [userId, refreshNotifications]
  );

  const clearAllNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "clear-all" }),
      });

      if (!response.ok) {
        console.warn(
          "Failed to clear all notifications:",
          response.status,
          response.statusText
        );
        toast.error("Failed to clear all notifications");
        return;
      }

      await refreshNotifications();
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      toast.error("Failed to clear all notifications");
    }
  }, [userId, refreshNotifications]);

  const showToast = useCallback(
    (type: NotificationType, message: string, title?: string) => {
      const toastMessage = title ? `${title}: ${message}` : message;

      switch (type) {
        case "success":
          toast.success(toastMessage);
          break;
        case "error":
          toast.error(toastMessage);
          break;
        case "warning":
          toast.warning(toastMessage);
          break;
        case "info":
        default:
          toast.info(toastMessage);
          break;
      }
    },
    []
  );

  // Set notification service for helper functions
  useEffect(() => {
    setNotificationService({
      createNotification,
      showToast,
    });
  }, [createNotification, showToast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        createNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        refreshNotifications,
        showToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}

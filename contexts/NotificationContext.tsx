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

  // Fetch notifications when user changes - inline to avoid circular dependency
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchNotifications = async () => {
      console.log("Starting notification refresh");
      setLoading(true);
      try {
        console.log(`Fetching notifications from portfolio-user`);
        const response = await fetch(
          `/api/notifications?userId=portfolio-user`,
          {
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.warn(
            `Could not fetch notifications:`,
            response.status,
            response.statusText
          );
          if (isMounted) {
            setNotifications([]);
            setUnreadCount(0);
          }
          return;
        }

        const data = await response.json();
        console.log(
          `Received ${data.notifications?.length || 0} notifications`
        );
        const notifs = data.notifications || [];

        if (isMounted) {
          setNotifications(notifs);
          setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        if (isMounted) {
          setNotifications([]);
          setUnreadCount(0);
        }
      } finally {
        if (isMounted) {
          console.log(
            "Notification refresh complete, setting loading to false"
          );
          setLoading(false);
        }
      }
    };

    fetchNotifications();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Separate refreshNotifications function for manual refresh
  const refreshNotifications = useCallback(async () => {
    if (!userId) {
      console.log("No userId, skipping notification refresh");
      setLoading(false);
      return;
    }

    console.log("Manual notification refresh triggered");
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?userId=portfolio-user`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn(
          `Could not fetch notifications:`,
          response.status,
          response.statusText
        );
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const data = await response.json();
      console.log(`Received ${data.notifications?.length || 0} notifications`);
      const notifs = data.notifications || [];

      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      console.log("Notification refresh complete, setting loading to false");
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
          body: JSON.stringify({ notificationId, userId }),
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
        body: JSON.stringify({ userId, markAllAsRead: true }),
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
        const response = await fetch(
          `/api/notifications?userId=${userId}&notificationId=${notificationId}`,
          {
            method: "DELETE",
          }
        );

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
      const response = await fetch(
        `/api/notifications?userId=${userId}&deleteAll=true`,
        {
          method: "DELETE",
        }
      );

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

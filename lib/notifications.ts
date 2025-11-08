/**
 * Centralized notification helper
 * Shows toast notification AND saves to Firebase Realtime DB
 * Single source of truth - prevents duplicate notifications
 */

import { toast } from "sonner";
import { NotificationType } from "@/types/notification";

const NOTIFICATION_DURATION = 3000; // 3 seconds
const USER_ID = "portfolio-user";

interface NotifyOptions {
  type?: NotificationType;
  title: string;
  message?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    url: string;
  };
  data?: Record<string, any>;
  saveToDatabase?: boolean; // Default true
}

/**
 * Show a notification (toast + save to database)
 */
export async function notify(options: NotifyOptions) {
  const {
    type = "info",
    title,
    message,
    description,
    duration = NOTIFICATION_DURATION,
    action,
    data,
    saveToDatabase = true,
  } = options;

  // Determine toast type
  const toastType = getToastType(type);

  // Show toast notification
  const toastId = showToast(toastType, title, description, duration, action);

  // Save to database (async, don't wait)
  if (saveToDatabase) {
    saveNotificationToDatabase({
      userId: USER_ID,
      type,
      title,
      message: message || title,
      description,
      action,
      data,
    }).catch((error) => {
      console.error("Failed to save notification to database:", error);
    });
  }

  return toastId;
}

/**
 * Helper: Determine toast type from notification type
 */
function getToastType(
  type: NotificationType
): "success" | "error" | "info" | "warning" {
  switch (type) {
    case "success":
    case "create":
    case "restore":
      return "success";
    case "error":
    case "delete":
      return "error";
    case "warning":
      return "warning";
    default:
      return "info";
  }
}

/**
 * Helper: Show toast notification
 */
function showToast(
  type: "success" | "error" | "info" | "warning",
  title: string,
  description?: string,
  duration?: number,
  action?: { label: string; url: string }
): string | number {
  const options: any = {
    description,
    duration,
  };

  if (action) {
    options.action = {
      label: action.label,
      onClick: () => {
        if (typeof window !== "undefined") {
          window.location.href = action.url;
        }
      },
    };
  }

  switch (type) {
    case "success":
      return toast.success(title, options);
    case "error":
      return toast.error(title, options);
    case "warning":
      return toast.warning(title, options);
    default:
      return toast.info(title, options);
  }
}

/**
 * Helper: Save notification to Firebase Realtime Database
 */
async function saveNotificationToDatabase(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  description?: string;
  action?: { label: string; url: string };
  data?: Record<string, any>;
}) {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to save notification:", response.status, errorData);
      throw new Error(
        `Failed to save notification: ${errorData.error || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving notification:", error);
    throw error;
  }
}

/**
 * Convenience methods
 */
export const notifySuccess = (
  title: string,
  description?: string,
  options?: Partial<NotifyOptions>
) => notify({ type: "success", title, description, ...options });

export const notifyError = (
  title: string,
  description?: string,
  options?: Partial<NotifyOptions>
) => notify({ type: "error", title, description, ...options });

export const notifyInfo = (
  title: string,
  description?: string,
  options?: Partial<NotifyOptions>
) => notify({ type: "info", title, description, ...options });

export const notifyWarning = (
  title: string,
  description?: string,
  options?: Partial<NotifyOptions>
) => notify({ type: "warning", title, description, ...options });

// Specific notification types
export const notifyProjectCreated = (projectName: string) =>
  notify({
    type: "create",
    title: "Project created",
    description: `${projectName} has been added successfully`,
    data: { entity: "project", name: projectName },
  });

export const notifyProjectDeleted = (projectName: string) =>
  notify({
    type: "delete",
    title: "Project deleted",
    description: `${projectName} moved to recycle bin`,
    data: { entity: "project", name: projectName },
  });

export const notifyItemMovedToRecycleBin = (
  itemType: string,
  expiryDays: number = 15
) =>
  notify({
    type: "recycleBin",
    title: "Item moved to Recycle Bin",
    description: `Expires in ${expiryDays} days. You can restore it or extend the expiry period.`,
    data: { itemType, expiryDays },
  });

export const notifyItemRestored = (itemType: string) =>
  notify({
    type: "restore",
    title: "Item restored successfully",
    description: `${itemType} has been restored from recycle bin`,
    data: { itemType },
  });

export const notifyItemDeleted = (itemType: string) =>
  notify({
    type: "delete",
    title: "Item permanently deleted",
    description: `${itemType} has been removed permanently`,
    data: { itemType },
  });

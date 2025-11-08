export type NotificationType =
  | "login"
  | "logout"
  | "timesheet"
  | "todo"
  | "version"
  | "system"
  | "error"
  | "success"
  | "info"
  | "warning"
  | "project"
  | "testimonial"
  | "workExperience"
  | "contactSubmission"
  | "recycleBin"
  | "delete"
  | "restore"
  | "create"
  | "update";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  description?: string; // Optional description for toast
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
  action?: {
    label: string;
    url: string;
  };
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  description?: string;
  data?: Record<string, any>;
  action?: {
    label: string;
    url: string;
  };
}

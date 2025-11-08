/**
 * API routes for notification management using Firebase Realtime Database
 * Real-time sync, no localStorage, centralized notification system
 */

import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  remove,
  update,
} from "firebase/database";
import { CreateNotificationInput, Notification } from "@/types/notification";

// Initialize Firebase for server-side
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const rtdb = getDatabase(app);

/**
 * GET - Fetch notifications for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "portfolio-user";
    const limit = parseInt(searchParams.get("limit") || "50");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const notificationsRef = ref(rtdb, `notifications/${userId}`);
    const snapshot = await get(notificationsRef);

    if (!snapshot.exists()) {
      return NextResponse.json({
        success: true,
        notifications: [],
        count: 0,
        unreadCount: 0,
      });
    }

    const notificationsData = snapshot.val();
    let notifications: Notification[] = Object.keys(notificationsData).map(
      (key) => ({
        id: key,
        ...notificationsData[key],
      })
    );

    // Filter unread if requested
    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.read);
    }

    // Sort by createdAt descending
    notifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply limit
    notifications = notifications.slice(0, limit);

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateNotificationInput = await request.json();

    const { userId, type, title, message, description, data, action } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: userId, type, title, message",
        },
        { status: 400 }
      );
    }

    console.log("Creating notification:", { userId, type, title });

    const notificationsRef = ref(rtdb, `notifications/${userId}`);
    const newNotificationRef = push(notificationsRef);

    // Remove undefined values for Firebase Realtime DB
    const notification: any = {
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      data: data || {},
    };

    // Only add optional fields if they have values
    if (description) notification.description = description;
    if (action) notification.action = action;

    console.log(
      "Saving to path:",
      `notifications/${userId}/${newNotificationRef.key}`
    );
    await set(newNotificationRef, notification);
    console.log("Notification saved successfully");

    return NextResponse.json(
      {
        success: true,
        notification: {
          id: newNotificationRef.key,
          ...notification,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create notification",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Mark notification(s) as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationId, markAllAsRead } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (markAllAsRead) {
      // Mark all notifications as read
      const notificationsRef = ref(rtdb, `notifications/${userId}`);
      const snapshot = await get(notificationsRef);

      if (snapshot.exists()) {
        const updates: Record<string, any> = {};
        const notificationsData = snapshot.val();

        Object.keys(notificationsData).forEach((key) => {
          updates[`notifications/${userId}/${key}/read`] = true;
        });

        await update(ref(rtdb), updates);
      }

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    } else if (notificationId) {
      // Mark single notification as read
      const notificationRef = ref(
        rtdb,
        `notifications/${userId}/${notificationId}`
      );
      await update(notificationRef, { read: true });

      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "notificationId or markAllAsRead is required",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete notification(s)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const notificationId = searchParams.get("notificationId");
    const deleteAll = searchParams.get("deleteAll") === "true";

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (deleteAll) {
      // Delete all notifications for user
      const notificationsRef = ref(rtdb, `notifications/${userId}`);
      await remove(notificationsRef);

      return NextResponse.json({
        success: true,
        message: "All notifications deleted",
      });
    } else if (notificationId) {
      // Delete single notification
      const notificationRef = ref(
        rtdb,
        `notifications/${userId}/${notificationId}`
      );
      await remove(notificationRef);

      return NextResponse.json({
        success: true,
        message: "Notification deleted",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "notificationId or deleteAll is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

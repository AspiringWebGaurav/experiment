"use client";

import type { User } from "firebase/auth";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as fbSignOut,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./firebase";
import { toast } from "sonner";
import { createAuthNotification } from "./notificationHelpers";

export { auth };

const ALLOWED_EMAIL = "gauravpatil9262@gmail.com";
const ALLOWED_UID = "cgwqNNfMfPNmsAHJfgWGcRSsIRG2";

// Google Sign-In
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
      login_hint: ALLOWED_EMAIL,
    });

    const cred = await signInWithPopup(auth, provider);
    const user = cred.user;

    // Check if user is authorized
    if (
      user.email?.toLowerCase() !== ALLOWED_EMAIL ||
      user.uid !== ALLOWED_UID
    ) {
      await fbSignOut(auth);
      toast.error(
        "Access restricted to authorized users only. Please contact the owner."
      );
      throw new Error("Unauthorized user.");
    }

    // Get ID token and create server-side session
    const idToken = await user.getIdToken();
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to create session");
    }

    // Create login notification
    await createAuthNotification("login", user);

    return cred;
  } catch (err: unknown) {
    const message = (err as Error).message || "Google Sign-In failed.";
    if (!message.includes("popup-closed-by-user")) {
      toast.error(message);
    }
    throw err;
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    if (
      user.email?.toLowerCase() !== ALLOWED_EMAIL ||
      user.uid !== ALLOWED_UID
    ) {
      await fbSignOut(auth);
      toast.error("Access restricted. Please contact the owner.");
      throw new Error("Access restricted.");
    }

    // Get ID token and create server-side session
    const idToken = await user.getIdToken();
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to create session");
    }

    await createAuthNotification("login", user);
    return cred;
  } catch (err: unknown) {
    const message = (err as Error).message || "Authentication failed.";
    toast.error(message);
    throw err;
  }
}

export async function signOut(): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await createAuthNotification("logout", user);
  }

  // Destroy server-side session
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Failed to destroy server session:", error);
  }

  await fbSignOut(auth);
}

export function initAuthListener(cb: (user: User | null) => void) {
  const unsub = onAuthStateChanged(auth, (user) => {
    if (!user) {
      cb(null);
      return;
    }
    // enforce email gate
    if (
      user.email?.toLowerCase() !== ALLOWED_EMAIL ||
      user.uid !== ALLOWED_UID
    ) {
      void fbSignOut(auth).then(() => {
        toast.error("Access restricted. Please contact the owner.");
        cb(null);
      });
      return;
    }
    cb(user);
  });

  return unsub;
}

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCMKuKgoWq7s_b_798pJq9QgGbHgUEy9kM",
  authDomain: "gaurav-portfolio-improved.firebaseapp.com",
  databaseURL: "https://gaurav-portfolio-improved-default-rtdb.firebaseio.com",
  projectId: "gaurav-portfolio-improved",
  storageBucket: "gaurav-portfolio-improved.firebasestorage.app",
  messagingSenderId: "761696179429",
  appId: "1:761696179429:web:8919d6a499c2e8f0d4b00c",
  measurementId: "G-WQKV3WPPD8",
};

function initApp() {
  try {
    if (!getApps().length) {
      return initializeApp(firebaseConfig);
    }
    return getApp();
  } catch (err) {
    throw err;
  }
}

const app = initApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// Enable offline persistence (only in browser environment)
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Firestore persistence failed: Multiple tabs open");
    } else if (err.code === "unimplemented") {
      console.warn("Firestore persistence not supported in this browser");
    }
  });
}
